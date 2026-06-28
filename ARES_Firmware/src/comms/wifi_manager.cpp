#include "wifi_manager.h"

WifiManager::WifiManager(const char* apSsid, const char* apPassword)
    : m_apSsid(apSsid),
      m_apPassword(apPassword),
      m_isApMode(false) {}

void WifiManager::begin(const char* stationSsid, const char* stationPassword) {
    // Check if station SSID is provided
    if (stationSsid && strlen(stationSsid) > 0) {
        Serial.print("Connecting to WiFi Station: ");
        Serial.println(stationSsid);
        
        // Start station mode
        WiFi.mode(WIFI_STA);
        WiFi.begin(stationSsid, stationPassword);
        
        // Wait up to 10 seconds for connection
        int retries = 20;
        while (WiFi.status() != WL_CONNECTED && retries > 0) {
            delay(500);
            Serial.print(".");
            retries--;
        }
        
        if (WiFi.status() == WL_CONNECTED) {
            Serial.println("\nWiFi Connected successfully!");
            Serial.print("IP Address: ");
            Serial.println(WiFi.localIP());
            m_isApMode = false;
            return;
        }
        
        Serial.println("\nFailed to connect to Station WiFi. Falling back to Access Point mode...");
    }

    // Config AP Mode
    Serial.println("Initializing Access Point mode...");
    WiFi.mode(WIFI_AP);
    
    // Configure standard IP configuration for AP Mode
    IPAddress local_ip(192, 168, 4, 1);
    IPAddress gateway(192, 168, 4, 1);
    IPAddress subnet(255, 255, 255, 0);
    WiFi.softAPConfig(local_ip, gateway, subnet);
    
    WiFi.softAP(m_apSsid, m_apPassword);
    
    // Explicitly set WiFi RF transmit power to maximum (19.5dBm) for strongest signal
    WiFi.setTxPower(WIFI_POWER_19_5dBm);
    
    Serial.print("AP SSID: ");
    Serial.println(m_apSsid);
    Serial.print("AP IP Address: ");
    Serial.println(WiFi.softAPIP());
    
    m_isApMode = true;
}

bool WifiManager::isConnected() const {
    if (m_isApMode) {
        return WiFi.softAPgetStationNum() > 0; // In AP mode, 'connected' means we have clients
    }
    return WiFi.status() == WL_CONNECTED; // In station mode, connected to AP
}

IPAddress WifiManager::getLocalIP() const {
    if (m_isApMode) {
        return WiFi.softAPIP();
    }
    return WiFi.localIP();
}
