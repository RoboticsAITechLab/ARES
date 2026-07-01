#include "telemetry.h"
#include <esp_now.h>
#include <WiFi.h>

struct __attribute__((packed)) ESPNowTelemetry {
    float battery;
    float yaw;
    float pitch;
    float roll;
    float distance;
    float temp;
    char status[32];
    float speed;
};

TelemetryManager::TelemetryManager(ImuManager* imu, UltrasonicSensor* sonar, MotorController* motor, SafetyManager* safety)
    : m_imu(imu), m_sonar(sonar), m_motor(motor), m_safety(safety), m_lastTelemetryMs(0) {}

void TelemetryManager::begin() {
    m_lastTelemetryMs = millis();

    // Start WiFi in STA mode to support ESP-NOW
    WiFi.mode(WIFI_STA);
    
    if (esp_now_init() == ESP_OK) {
        Serial.println("[ESP-NOW] Init successful.");
        
        esp_now_peer_info_t peerInfo;
        memset(&peerInfo, 0, sizeof(peerInfo));
        memcpy(peerInfo.peer_addr, CommsConfig::MOTHER_MAC, 6);
        peerInfo.channel = 0;
        peerInfo.encrypt = false;
        
        if (esp_now_add_peer(&peerInfo) == ESP_OK) {
            Serial.println("[ESP-NOW] Mother Rover peer registered.");
        } else {
            Serial.println("[ESP-NOW] Failed to register Mother peer.");
        }
    } else {
        Serial.println("[ESP-NOW] Init failed.");
    }
}

void TelemetryManager::update(RoverState currentState) {
    unsigned long now = millis();
    if (now - m_lastTelemetryMs < TELEMETRY_PERIOD) return;
    m_lastTelemetryMs = now;

    // Send binary packet over ESP-NOW to Mother
    ESPNowTelemetry packet;
    packet.battery = 98.0f; // Placeholder scout battery
    const ImuData& imuData = m_imu->getData();
    packet.yaw = imuData.yaw;
    packet.pitch = imuData.pitch;
    packet.roll = imuData.roll;
    packet.distance = m_sonar->getDistanceCm();
    packet.temp = imuData.temp;
    
    String stateStr = stateToString(currentState);
    memset(packet.status, 0, sizeof(packet.status));
    strncpy(packet.status, stateStr.c_str(), sizeof(packet.status) - 1);
    
    packet.speed = (m_motor->getLeftCurrent() + m_motor->getRightCurrent()) / 2.0f;

    esp_now_send(CommsConfig::MOTHER_MAC, (uint8_t*)&packet, sizeof(packet));

    // Use ArduinoJson v7 to serialize
    JsonDocument doc;

    doc["state"] = stateToString(currentState);
    
    // IMU Data
    JsonObject imu = doc["imu"].to<JsonObject>();
    imu["yaw"] = round(imuData.yaw * 10.0f) / 10.0f;
    imu["pitch"] = round(imuData.pitch * 10.0f) / 10.0f;
    imu["roll"] = round(imuData.roll * 10.0f) / 10.0f;
    imu["temp"] = round(imuData.temp * 10.0f) / 10.0f;
    imu["healthy"] = m_imu->isHealthy();

    // Ultrasonic Data
    JsonObject sonar = doc["sonar"].to<JsonObject>();
    sonar["distance"] = round(m_sonar->getDistanceCm() * 10.0f) / 10.0f;
    sonar["confidence"] = round(m_sonar->getConfidenceScore() * 100.0f) / 100.0f;
    sonar["healthy"] = m_sonar->isHealthy();

    // Motor Speeds
    JsonObject motors = doc["motor"].to<JsonObject>();
    motors["left_target"] = round(m_motor->getLeftTarget() * 100.0f) / 100.0f;
    motors["right_target"] = round(m_motor->getRightTarget() * 100.0f) / 100.0f;
    motors["left_current"] = round(m_motor->getLeftCurrent() * 100.0f) / 100.0f;
    motors["right_current"] = round(m_motor->getRightCurrent() * 100.0f) / 100.0f;

    // Safety and Terrain Status
    doc["terrain"] = getTerrainString(m_imu->getTerrainVariance());
    
    JsonArray warnings = doc["warnings"].to<JsonArray>();
    if (m_safety->isRolloverDetected()) warnings.add("ROLLOVER_WARNING");
    if (m_safety->isCollisionImpact()) warnings.add("COLLISION_IMPACT");
    if (m_imu->getTerrainVariance() > SafetyConfig::TERRAIN_VARIANCE_ROUGH) warnings.add("ROUGH_TERRAIN");

    JsonArray errors = doc["errors"].to<JsonArray>();
    if (m_safety->isSensorFault()) errors.add("SENSOR_FAULT");
    if (m_safety->isWatchdogTriggered()) errors.add("WATCHDOG_TIMEOUT");
    if (m_safety->isEmergencyActive()) errors.add("EMERGENCY_STOP");

    // Output JSON to Serial
    serializeJson(doc, Serial);
    Serial.println();
}

String TelemetryManager::getTerrainString(float variance) {
    if (variance < 0.08f) {
        return "SMOOTH";
    } else if (variance <= SafetyConfig::TERRAIN_VARIANCE_ROUGH) {
        return "MODERATE";
    } else {
        return "ROUGH";
    }
}
