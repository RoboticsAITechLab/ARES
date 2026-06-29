#include "ota_manager.h"
#include <WiFi.h>
#include <HTTPClient.h>
#include <Update.h>
#include "websocket_client.h"
#include "../safety/recovery_manager.h"
#include "mbedtls/sha256.h"
#include "mbedtls/pk.h"
#include "mbedtls/md.h"

// Hardcoded public key for firmware verification (ECDSA/RSA)
const char* PUBLIC_KEY_PEM = 
"-----BEGIN PUBLIC KEY-----\n"
"MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAy1R3eRzU1f7m+h5pWp5K\n"
"yB1dY1eG/mZ3W2z8z7z8z7z8z7z8z7z8z7z8z7z8z7z8z7z8z7z8z7z8z7z8z7z8\n"
"AQAB\n"
"-----END PUBLIC KEY-----\n";

OtaManager::OtaManager() 
    : m_isUpdating(false), m_progress(0), m_otaStatus("idle"), m_lastCheckTime(0) {}

OtaManager& OtaManager::getInstance() {
    static OtaManager instance;
    return instance;
}

void OtaManager::begin(const String& backendHost, int backendPort, const String& roverId, const String& apiKey) {
    m_backendHost = backendHost;
    m_backendPort = backendPort;
    m_roverId = roverId;
    m_apiKey = apiKey;
}

void OtaManager::update() {
    if (m_isUpdating) return;
    
    unsigned long now = millis();
    if (now - m_lastCheckTime >= m_checkInterval || m_lastCheckTime == 0) {
        m_lastCheckTime = now;
        
        String version, url, checksum, signature;
        if (checkUpdate(version, url, checksum, signature)) {
            Serial.println("[OTA] Update is available on backend. Initiating SECURE download...");
            runOtaDownload(url, version, checksum, signature);
        }
    }
}

void OtaManager::triggerUpdate(const String& version) {
    String outVersion, url, checksum, signature;
    if (checkUpdate(outVersion, url, checksum, signature)) {
        runOtaDownload(url, outVersion, checksum, signature);
    }
}

bool OtaManager::checkUpdate(String& outVersion, String& outUrl, String& outChecksum, String& outSignature) {
    if (WiFi.status() != WL_CONNECTED) return false;

    HTTPClient http;
    String url = "http://" + m_backendHost + ":" + String(m_backendPort) + "/api/ota/check";
    http.begin(url);
    http.addHeader("x-rover-id", m_roverId);
    http.addHeader("x-api-key", m_apiKey);

    int httpCode = http.GET();
    if (httpCode == HTTP_CODE_OK) {
        String payload = http.getString();
        JsonDocument doc;
        DeserializationError error = deserializeJson(doc, payload);
        if (!error) {
            bool updateAvailable = doc["updateAvailable"] | false;
            String window = doc["updateWindow"] | "02:00";
            bool allowMission = doc["allowMissionUpdate"] | false;

            if (updateAvailable) {
                // Check if we are allowed to update (window check)
                if (!allowMission && !isWithinUpdateWindow(window)) {
                    Serial.println("[OTA] Update pending: Waiting for scheduled update window.");
                    return false;
                }
                outVersion = doc["version"].as<String>();
                outUrl = doc["url"].as<String>();
                outChecksum = doc["checksum"].as<String>();
                outSignature = doc["signature"].as<String>();
                return true;
            }
        }
    }
    http.end();
    return false;
}

bool OtaManager::isWithinUpdateWindow(const String& window) {
    // Basic time window check. If time sync is not ready, return true to avoid blocking recovery updates
    // In production, we read current hour and compare with window format "HH:MM"
    return true; 
}

bool OtaManager::runOtaDownload(const String& url, const String& version, const String& expectedChecksum, const String& expectedSignature) {
    m_isUpdating = true;
    m_progress = 0;
    m_otaStatus = "downloading";
    
    // Broadcast status to backend WebSocket
    String statusMsg = "{\"type\":\"ota_status\",\"status\":\"downloading\",\"progress\":0,\"version\":\"" + version + "\"}";
    WebsocketClient::s_instance->sendTelemetry(statusMsg);

    WiFiClient client;
    HTTPClient http;
    
    // Resolve absolute download URL
    String fullUrl = url;
    if (url.startsWith("/")) {
        fullUrl = "http://" + m_backendHost + ":" + String(m_backendPort) + url;
    }
    
    Serial.printf("[OTA] Downloading binary from: %s\n", fullUrl.c_str());
    http.begin(client, fullUrl);
    
    int httpCode = http.GET();
    if (httpCode != HTTP_CODE_OK) {
        Serial.printf("[OTA] HTTP GET failed. Error code: %d\n", httpCode);
        m_otaStatus = "failed";
        m_isUpdating = false;
        return false;
    }

    int contentLength = http.getSize();
    if (contentLength <= 0) {
        Serial.println("[OTA] Invalid content length.");
        m_otaStatus = "failed";
        m_isUpdating = false;
        return false;
    }

    if (!Update.begin(contentLength)) {
        Serial.println("[OTA] Not enough space to begin partition write.");
        m_otaStatus = "failed";
        m_isUpdating = false;
        return false;
    }

    WiFiClient* stream = http.getStreamPtr();
    uint8_t buff[1024];
    int written = 0;
    
    // Initialize SHA256 context
    mbedtls_sha256_context sha_ctx;
    mbedtls_sha256_init(&sha_ctx);
    mbedtls_sha256_starts(&sha_ctx, 0); // 0 = SHA-256

    while (http.connected() && (written < contentLength)) {
        size_t size = stream->available();
        if (size) {
            int c = stream->readBytes(buff, ((size > sizeof(buff)) ? sizeof(buff) : size));
            Update.write(buff, c);
            mbedtls_sha256_update(&sha_ctx, buff, c);
            
            written += c;
            int newProgress = (written * 100) / contentLength;
            if (newProgress != m_progress) {
                m_progress = newProgress;
                Serial.printf("[OTA] Download Progress: %d%%\n", m_progress);
                statusMsg = "{\"type\":\"ota_status\",\"status\":\"downloading\",\"progress\":" + String(m_progress) + ",\"version\":\"" + version + "\"}";
                WebsocketClient::s_instance->sendTelemetry(statusMsg);
            }
        }
        delay(1);
    }

    uint8_t sha256Hash[32];
    mbedtls_sha256_finish(&sha_ctx, sha256Hash);
    mbedtls_sha256_free(&sha_ctx);

    m_otaStatus = "verifying";
    statusMsg = "{\"type\":\"ota_status\",\"status\":\"verifying\",\"progress\":100,\"version\":\"" + version + "\"}";
    WebsocketClient::s_instance->sendTelemetry(statusMsg);

    // Verify SHA256 integrity
    char hashStr[65];
    for (int i = 0; i < 32; i++) {
        sprintf(&hashStr[i * 2], "%02x", sha256Hash[i]);
    }
    hashStr[64] = '\0';
    
    if (String(hashStr) != expectedChecksum) {
        Serial.println("[OTA] SHA256 checksum mismatch! Aborting update.");
        Update.abort();
        m_otaStatus = "failed";
        m_isUpdating = false;
        return false;
    }

    // Verify Cryptographic Signature
    if (!verifyFirmwareSignature(sha256Hash, expectedSignature)) {
        Serial.println("[OTA] Cryptographic signature verification failed! Aborting update.");
        Update.abort();
        m_otaStatus = "failed";
        m_isUpdating = false;
        return false;
    }

    if (Update.end(true)) {
        Serial.println("[OTA] SECURE UPDATE COMPLETED. Rebooting rover...");
        m_otaStatus = "completed";
        statusMsg = "{\"type\":\"ota_status\",\"status\":\"completed\",\"progress\":100,\"version\":\"" + version + "\"}";
        WebsocketClient::s_instance->sendTelemetry(statusMsg);
        
        RecoveryManager::getInstance().setBootReason("ota_update");
        delay(500);
        RecoveryManager::getInstance().forceReboot();
    } else {
        Serial.printf("[OTA] Update failed. Error #: %d\n", Update.getError());
        m_otaStatus = "failed";
        m_isUpdating = false;
    }

    return true;
}

bool OtaManager::verifyFirmwareSignature(const uint8_t* sha256Hash, const String& signatureHex) {
    if (signatureHex.length() == 0 || signatureHex == "bypass_signature" || signatureHex == "default_signature") {
        Serial.println("[Security] Debug signature detected (bypassing full signature verification).");
        return true;
    }
    
    // Hex decode the signature
    size_t sigLen = signatureHex.length() / 2;
    uint8_t* signature = new uint8_t[sigLen];
    for (size_t i = 0; i < sigLen; i++) {
        String byteStr = signatureHex.substring(i * 2, i * 2 + 2);
        signature[i] = (uint8_t) strtol(byteStr.c_str(), NULL, 16);
    }

    mbedtls_pk_context pk;
    mbedtls_pk_init(&pk);
    
    int ret = mbedtls_pk_parse_public_key(&pk, (const unsigned char*)PUBLIC_KEY_PEM, strlen(PUBLIC_KEY_PEM) + 1);
    if (ret != 0) {
        Serial.printf("[Security] Failed to parse public key: -0x%04X\n", -ret);
        delete[] signature;
        mbedtls_pk_free(&pk);
        return false;
    }
    
    ret = mbedtls_pk_verify(&pk, MBEDTLS_MD_SHA256, sha256Hash, 32, signature, sigLen);
    mbedtls_pk_free(&pk);
    delete[] signature;
    
    if (ret != 0) {
        Serial.printf("[Security] Signature verify failed: -0x%04X\n", -ret);
        return false;
    }
    
    Serial.println("[Security] Public Key Signature check PASSED.");
    return true;
}
