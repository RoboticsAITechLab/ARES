#include <Arduino.h>
#include "config.h"
#include "motor_controller.h"
#include "imu_manager.h"
#include "ultrasonic_sensor.h"
#include "safety_manager.h"
#include "navigator.h"
#include "telemetry.h"
#include <esp_now.h>
#include <WiFi.h>
#include <WebSocketsClient.h>
#include <ArduinoJson.h>

struct __attribute__((packed)) ESPNowCommand {
    char command[16];
    char valueStr[16];
    float valueNum;
};

volatile bool g_commandPending = false;
ESPNowCommand g_receivedCommand;
volatile unsigned long g_lastMotherRxTime = 0;

#ifdef ESP_IDF_VERSION_MAJOR
#if ESP_IDF_VERSION_MAJOR >= 5
void OnCommandRecv(const esp_now_recv_info_t * recv_info, const uint8_t *incomingData, int len) {
#else
void OnCommandRecv(const uint8_t * mac, const uint8_t *incomingData, int len) {
#endif
#else
void OnCommandRecv(const uint8_t * mac, const uint8_t *incomingData, int len) {
#endif
    if (len == sizeof(ESPNowCommand)) {
        memcpy((void*)&g_receivedCommand, incomingData, sizeof(g_receivedCommand));
        g_commandPending = true;
        g_lastMotherRxTime = millis();
    }
}

// System Instances
MotorController motorController;
ImuManager imuManager;
UltrasonicSensor sonarSensor;
SafetyManager safetyManager(&motorController, &imuManager, &sonarSensor);
Navigator navigator(&motorController, &imuManager, &sonarSensor);
TelemetryManager telemetryManager(&imuManager, &sonarSensor, &motorController, &safetyManager);

// WebSockets Client and Wi-Fi Config
WebSocketsClient webSocket;
bool wsConnected = false;
const char *WIFI_SSID = "Airtel_RoboticsAiTechLab";
const char *WIFI_PASSWORD = "RoboticsAiTechLabs";

// Global State
RoverState currentRoverState = RoverState::BOOT;
unsigned long stateChangeTimerMs = 0;
float currentThrottle = 0.5f;

// Forward declaration of WebSocket command handler
void handleWebSocketCommand(const char* payload, size_t length) {
    JsonDocument doc;
    DeserializationError error = deserializeJson(doc, payload, length);
    if (error) {
        return;
    }

    const char* type = doc["type"];
    if (!type || strcmp(type, "rover_command") != 0) return;

    const char* target = doc["target"];
    if (target && strcmp(target, "ARES-SCOUT-01") != 0 && strcmp(target, "scout") != 0) {
        return;
    }

    const char* cmd = doc["command"];
    if (!cmd) return;

    Serial.printf("[WS Command] Received: %s\n", cmd);

    if (strcmp(cmd, "SET_STATE") == 0) {
        const char* val = doc["value"];
        if (val) {
            String targetState = String(val);
            if (targetState == "READY_FOR_DEPLOYMENT") {
                currentRoverState = RoverState::READY_FOR_DEPLOYMENT;
                stateChangeTimerMs = millis();
            } else if (targetState == "ACTIVE") {
                currentRoverState = RoverState::ACTIVE;
                navigator.lockCurrentHeading();
                stateChangeTimerMs = millis();
            } else if (targetState == "DOCKED") {
                currentRoverState = RoverState::DOCKED;
                stateChangeTimerMs = millis();
            }
        }
    } else if (strcmp(cmd, "estop") == 0) {
        currentRoverState = RoverState::EMERGENCY_STOP;
        motorController.emergencyStop();
        stateChangeTimerMs = millis();
    } else if (strcmp(cmd, "move") == 0) {
        if (currentRoverState == RoverState::ACTIVE) {
            motorController.setStandby(false);
            const char* val = doc["value"];
            if (val) {
                String direction = String(val);
                float leftSpd = 0.0f;
                float rightSpd = 0.0f;
                float baseSpd = currentThrottle;

                if (direction == "forward") {
                    leftSpd = baseSpd;
                    rightSpd = baseSpd;
                } else if (direction == "backward") {
                    leftSpd = -baseSpd;
                    rightSpd = -baseSpd;
                } else if (direction == "left") {
                    leftSpd = -baseSpd * 0.5f;
                    rightSpd = baseSpd * 0.5f;
                } else if (direction == "right") {
                    leftSpd = baseSpd * 0.5f;
                    rightSpd = -baseSpd * 0.5f;
                } else if (direction == "forward-left") {
                    leftSpd = baseSpd * 0.5f;
                    rightSpd = baseSpd;
                } else if (direction == "forward-right") {
                    leftSpd = baseSpd;
                    rightSpd = baseSpd * 0.5f;
                } else if (direction == "backward-left") {
                    leftSpd = -baseSpd * 0.5f;
                    rightSpd = -baseSpd;
                } else if (direction == "backward-right") {
                    leftSpd = -baseSpd;
                    rightSpd = -baseSpd * 0.5f;
                }
                motorController.setTargetSpeeds(leftSpd, rightSpd);
            }
        }
    } else if (strcmp(cmd, "stop") == 0) {
        if (currentRoverState == RoverState::ACTIVE) {
            motorController.setTargetSpeeds(0.0f, 0.0f);
        }
    } else if (strcmp(cmd, "speed") == 0) {
        float percentage = doc["value"] | 50.0f;
        currentThrottle = constrain(percentage / 100.0f, 0.0f, 1.0f);
    }
}

void webSocketEvent(WStype_t type, uint8_t * payload, size_t length) {
    switch(type) {
        case WStype_DISCONNECTED:
            Serial.println("[WS] Disconnected from Cloud Server!");
            wsConnected = false;
            break;
        case WStype_CONNECTED:
            Serial.println("[WS] Connected to Cloud Server successfully.");
            wsConnected = true;
            break;
        case WStype_TEXT:
            handleWebSocketCommand((const char*)payload, length);
            break;
        default:
            break;
    }
}

// Global State (moved to top)

void setup() {
    Serial.begin(115200);
    delay(1000);
    Serial.println("\n==================================================");
    Serial.println("      ARES AUTONOMOUS SCOUT ROVER FIRMWARE        ");
    Serial.println("==================================================");

    // Boot Phase
    Serial.println("[Boot] Initializing system modules...");
    
    motorController.begin();
    sonarSensor.begin();
    safetyManager.begin();
    telemetryManager.begin();

    // Register ESP-NOW command receiver callback
    esp_now_register_recv_cb(OnCommandRecv);

    // Try starting IMU
    if (imuManager.begin()) {
        currentRoverState = RoverState::CALIBRATION;
        stateChangeTimerMs = millis();
    } else {
        Serial.println("[Boot] WARNING: IMU initialization failed! Booting into DOCKED state without IMU.");
        currentRoverState = RoverState::DOCKED;
        stateChangeTimerMs = millis();
    }

    // Connect to router Wi-Fi station
    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
    Serial.printf("[WiFi] Attempting connection to station SSID: %s\n", WIFI_SSID);

    // Initialize WebSockets client to connect directly to the cloud Render URL
    webSocket.beginSSL("ares-mk3j.onrender.com", 443, "/ws?token=ares_auth_secret&role=rover&roverId=ARES-SCOUT-01");
    webSocket.onEvent(webSocketEvent);
    webSocket.setReconnectInterval(5000);
}

void loop() {
    webSocket.loop();

    // Process incoming ESP-NOW commands from Mother Rover
    if (g_commandPending) {
        g_commandPending = false;
        if (strcmp(g_receivedCommand.command, "SET_STATE") == 0) {
            String targetState = String(g_receivedCommand.valueStr);
            if (targetState == "READY_FOR_DEPLOYMENT") {
                currentRoverState = RoverState::READY_FOR_DEPLOYMENT;
                stateChangeTimerMs = millis();
                Serial.println("[State] Set to READY_FOR_DEPLOYMENT via ESP-NOW.");
            } else if (targetState == "ACTIVE") {
                currentRoverState = RoverState::ACTIVE;
                navigator.lockCurrentHeading();
                stateChangeTimerMs = millis();
                Serial.println("[State] Set to ACTIVE via ESP-NOW.");
            } else if (targetState == "DOCKED") {
                currentRoverState = RoverState::DOCKED;
                stateChangeTimerMs = millis();
                Serial.println("[State] Set to DOCKED via ESP-NOW.");
            }
        } else if (strcmp(g_receivedCommand.command, "estop") == 0) {
            currentRoverState = RoverState::EMERGENCY_STOP;
            motorController.emergencyStop();
            stateChangeTimerMs = millis();
            Serial.println("[State] Set to EMERGENCY_STOP via ESP-NOW.");
        } else if (strcmp(g_receivedCommand.command, "move") == 0) {
            if (currentRoverState == RoverState::ACTIVE) {
                motorController.setStandby(false);
                String direction = String(g_receivedCommand.valueStr);
                float leftSpd = 0.0f;
                float rightSpd = 0.0f;
                float baseSpd = currentThrottle;

                if (direction == "forward") {
                    leftSpd = baseSpd;
                    rightSpd = baseSpd;
                } else if (direction == "backward") {
                    leftSpd = -baseSpd;
                    rightSpd = -baseSpd;
                } else if (direction == "left") {
                    leftSpd = -baseSpd * 0.5f;
                    rightSpd = baseSpd * 0.5f;
                } else if (direction == "right") {
                    leftSpd = baseSpd * 0.5f;
                    rightSpd = -baseSpd * 0.5f;
                } else if (direction == "forward-left") {
                    leftSpd = baseSpd * 0.5f;
                    rightSpd = baseSpd;
                } else if (direction == "forward-right") {
                    leftSpd = baseSpd;
                    rightSpd = baseSpd * 0.5f;
                } else if (direction == "backward-left") {
                    leftSpd = -baseSpd * 0.5f;
                    rightSpd = -baseSpd;
                } else if (direction == "backward-right") {
                    leftSpd = -baseSpd;
                    rightSpd = -baseSpd * 0.5f;
                }
                motorController.setTargetSpeeds(leftSpd, rightSpd);
                Serial.printf("[Cmd] Move: %s (L=%.2f, R=%.2f)\n", direction.c_str(), leftSpd, rightSpd);
            }
        } else if (strcmp(g_receivedCommand.command, "stop") == 0) {
            if (currentRoverState == RoverState::ACTIVE) {
                motorController.setTargetSpeeds(0.0f, 0.0f);
                Serial.println("[Cmd] Stopped motors.");
            }
        } else if (strcmp(g_receivedCommand.command, "speed") == 0) {
            float percentage = g_receivedCommand.valueNum;
            currentThrottle = constrain(percentage / 100.0f, 0.0f, 1.0f);
            Serial.printf("[Cmd] Speed throttle updated to %.2f\n", currentThrottle);
        }
    }

    // Scout link loss watchdog check
    if (currentRoverState == RoverState::ACTIVE || 
        currentRoverState == RoverState::MOVING_FORWARD ||
        currentRoverState == RoverState::HEADING_LOCK ||
        currentRoverState == RoverState::SCANNING ||
        currentRoverState == RoverState::TURNING ||
        currentRoverState == RoverState::RECOVERING ||
        currentRoverState == RoverState::AVOIDING_OBSTACLE) {
        if (millis() - g_lastMotherRxTime > 4000) {
            currentRoverState = RoverState::LOST_LINK;
            motorController.setTargetSpeeds(0.0f, 0.0f);
            Serial.println("[Safety] ESP-NOW link lost! Transitioned to LOST_LINK.");
        }
    }

    // 1. Update hardware driver loops
    imuManager.update();
    sonarSensor.update();
    motorController.update();

    // 2. Update safety subsystem checks
    safetyManager.update();

    // 3. Keep watchdog fed if in operational states
    if (currentRoverState != RoverState::EMERGENCY_STOP && 
        currentRoverState != RoverState::SENSOR_FAILURE &&
        currentRoverState != RoverState::BOOT &&
        currentRoverState != RoverState::CALIBRATION) {
        safetyManager.feedWatchdog();
    }

    // 4. State Machine Controller Logic
    if (safetyManager.isEmergencyActive()) {
        if (safetyManager.isSensorFault()) {
            currentRoverState = RoverState::SENSOR_FAILURE;
        } else {
            currentRoverState = RoverState::EMERGENCY_STOP;
        }
    }

    switch (currentRoverState) {
        case RoverState::BOOT:
            // Handled in setup
            break;

        case RoverState::CALIBRATION:
            if (millis() - stateChangeTimerMs > 500) { // Slight delay to settle
                if (imuManager.calibrate()) {
                    navigator.begin();
                    currentRoverState = RoverState::DOCKED;
                    stateChangeTimerMs = millis();
                    Serial.println("[System] Calibration complete. Rover is DOCKED.");
                } else {
                    currentRoverState = RoverState::SENSOR_FAILURE;
                    Serial.println("[System] Calibration failed.");
                }
            }
            break;

        case RoverState::DOCKED:
            motorController.setTargetSpeeds(0.0f, 0.0f);
            motorController.setStandby(true);
            break;

        case RoverState::READY_FOR_DEPLOYMENT:
            motorController.setTargetSpeeds(0.0f, 0.0f);
            motorController.setStandby(true);
            break;

        case RoverState::LOST_LINK:
            motorController.setTargetSpeeds(0.0f, 0.0f);
            motorController.setStandby(false);
            break;

        case RoverState::IDLE:
            motorController.setTargetSpeeds(0.0f, 0.0f);
            motorController.setStandby(true);
            break;

        case RoverState::MOVING_FORWARD:
        case RoverState::HEADING_LOCK:
        case RoverState::SCANNING:
        case RoverState::TURNING:
        case RoverState::RECOVERING:
        case RoverState::AVOIDING_OBSTACLE:
            // Delegate motion state execution to navigation coordinator
            navigator.update(currentRoverState);

            // Handle terrain alerts
            if (imuManager.getTerrainVariance() > SafetyConfig::TERRAIN_VARIANCE_ROUGH) {
                currentRoverState = RoverState::TERRAIN_ALERT;
                stateChangeTimerMs = millis();
                Serial.println("[System] High vibrations: Transitioned to TERRAIN_ALERT.");
            }
            break;

        case RoverState::TERRAIN_ALERT:
            navigator.update(currentRoverState);
            // Return to nominal state once terrain smooths out
            if (imuManager.getTerrainVariance() <= SafetyConfig::TERRAIN_VARIANCE_ROUGH) {
                currentRoverState = RoverState::MOVING_FORWARD;
                Serial.println("[System] Terrain stabilized: Returned to MOVING_FORWARD.");
            }
            break;

        case RoverState::COLLISION_RECOVERY:
            // Trigger escape reverse sequence
            currentRoverState = RoverState::RECOVERING;
            navigator.update(currentRoverState);
            break;

        case RoverState::SENSOR_FAILURE:
            motorController.emergencyStop();
            // Retry IMU recovery if possible after 5s
            if (millis() - stateChangeTimerMs > 5000) {
                Serial.println("[Failsafe] Attempting sensor hot-reset...");
                if (imuManager.begin()) {
                    currentRoverState = RoverState::CALIBRATION;
                }
                stateChangeTimerMs = millis();
            }
            break;

        case RoverState::EMERGENCY_STOP:
            motorController.emergencyStop();
            // Check if we can recover from impact after 4 seconds
            if (!safetyManager.isRolloverDetected() && !safetyManager.isSensorFault()) {
                if (millis() - stateChangeTimerMs > 4000) {
                    Serial.println("[Failsafe] Clearing emergency latch.");
                    safetyManager.resetEmergency();
                    currentRoverState = RoverState::CALIBRATION;
                    stateChangeTimerMs = millis();
                }
            }
            break;
    }

    // 5. Output periodic JSON telemetry diagnostics
    telemetryManager.update(currentRoverState);

    // Yield to ESP32 RTOS core manager tasks
    delay(1);
}