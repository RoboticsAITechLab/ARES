#include "comms/websocket_client.h"
#include "comms/wifi_manager.h"
#include "drivers/battery_monitor.h"
#include "drivers/imu_driver.h"
#include "drivers/motor_driver.h"
#include "drivers/servo_driver.h"
#include "drivers/ultrasonic_driver.h"
#include "safety/watchdog.h"
#include "val/kinematics.h"
#include <Arduino.h>
#include <ArduinoOTA.h>
#include <esp_now.h>
#include <WiFi.h>

// ESP-NOW structures
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

struct __attribute__((packed)) ESPNowCommand {
    char command[16];
    char valueStr[16];
    float valueNum;
};

ScoutData scoutTelemetry;
unsigned long lastScoutRxTime = 0;

// Hardcoded Scout MAC Address
uint8_t scoutMac[] = {0x24, 0x62, 0xAB, 0xD4, 0x22, 0x14};

#ifdef ESP_IDF_VERSION_MAJOR
#if ESP_IDF_VERSION_MAJOR >= 5
void OnDataRecv(const esp_now_recv_info_t * recv_info, const uint8_t *incomingData, int len) {
#else
void OnDataRecv(const uint8_t * mac, const uint8_t *incomingData, int len) {
#endif
#else
void OnDataRecv(const uint8_t * mac, const uint8_t *incomingData, int len) {
#endif
    if (len == sizeof(ESPNowTelemetry)) {
        ESPNowTelemetry packet;
        memcpy(&packet, incomingData, sizeof(packet));
        scoutTelemetry.active = true;
        scoutTelemetry.battery = packet.battery;
        scoutTelemetry.heading = packet.yaw;
        scoutTelemetry.pitch = packet.pitch;
        scoutTelemetry.roll = packet.roll;
        scoutTelemetry.distance = packet.distance;
        scoutTelemetry.temperature = packet.temp;
        scoutTelemetry.speed = packet.speed;
        strncpy(scoutTelemetry.status, packet.status, sizeof(scoutTelemetry.status));
        scoutTelemetry.signal = constrain(100 + WiFi.RSSI(), 0, 100);
        lastScoutRxTime = millis();
    }
}

void sendScoutCommand(const char* commandName, const char* valueStr, float valueNum) {
    ESPNowCommand packet;
    memset(&packet, 0, sizeof(packet));
    strncpy(packet.command, commandName, sizeof(packet.command) - 1);
    strncpy(packet.valueStr, valueStr, sizeof(packet.valueStr) - 1);
    packet.valueNum = valueNum;
    esp_now_send(scoutMac, (uint8_t*)&packet, sizeof(packet));
    Serial.printf("[ESP-NOW] Sent command '%s' (val='%s') to Scout.\n", commandName, valueStr);
}

// Wi-Fi Station Configuration (Edit to connect your rover to the Internet)
const char *WIFI_SSID = "Airtel_RoboticsAiTechLab";
const char *WIFI_PASSWORD = "RoboticsAiTechLabs";

// System Instances
MotorDriver motorDriver;
BatteryMonitor batteryMonitor;
ImuDriver imuDriver;
UltrasonicDriver ultrasonicDriver(2, 34); // trig=2, echo=34
ServoDriver servoDriver(4);               // servo=4
Kinematics kinematics;
Watchdog watchdog(1000); // 1000ms safety timeout
WifiManager wifiManager("ARES_Rover_V2", "aresroverpassword");
WebsocketClient webSocketClient("ares-mk3j.onrender.com", 443,
                                "/ws?token=ares_auth_secret&role=rover");

// Global Motion States
float currentThrottle = 0.6f; // Base speed multiplier (0.0 to 1.0)
float targetLinear = 0.0f;
float targetAngular = 0.0f;

// Timing trackers
unsigned long lastTelemetryTime = 0;
const unsigned long telemetryInterval =
    1000; // Broadcast telemetry every 1000ms

// Forward Declarations
void handleIncomingCommand(const RoverCommand &cmd);
void updateLocomotion();

void setup() {
  Serial.begin(115200);
  delay(1000);
  Serial.println("==================================================");
  Serial.println("         ARES ROVER MVR FIRMWARE SYSTEM           ");
  Serial.println("==================================================");

  // Initialize Motor HAL
  Serial.println("[Init] Initializing Motor Driver HAL...");
  motorDriver.begin();

  // Initialize Battery ADC Reader
  Serial.println("[Init] Initializing Battery Monitor...");
  batteryMonitor.begin();

  // Initialize IMU
  Serial.println("[Init] Initializing MPU9250 IMU Sensor...");
  imuDriver.begin();

  // Initialize Proximity Sensor
  Serial.println("[Init] Initializing Ultrasonic Sensor...");
  ultrasonicDriver.begin();

  // Initialize Servos
  Serial.println("[Init] Initializing SG90 Pan/Tilt Gimbal Servos...");
  servoDriver.begin();

  // Initialize Safety Watchdog
  Serial.println("[Init] Registering Watchdog Safety Guardian...");
  watchdog.begin(&batteryMonitor, &motorDriver, &ultrasonicDriver);

  // Initialize WiFi
  Serial.println("[Init] Booting WiFi Link...");
  wifiManager.begin(WIFI_SSID, WIFI_PASSWORD);

  // Start WebSocket Client
  Serial.println("[Init] Connecting WebSocket Client...");
  webSocketClient.begin(handleIncomingCommand);

  // Start Arduino OTA Service
  Serial.println("[Init] Starting Arduino OTA service...");
  ArduinoOTA.setHostname("ARES_Rover_ESP32");
  ArduinoOTA.onStart([]() {
    Serial.println("[OTA] Firmware update starting...");
  });
  ArduinoOTA.onEnd([]() {
    Serial.println("\n[OTA] Update successfully finished!");
  });
  ArduinoOTA.onProgress([](unsigned int progress, unsigned int total) {
    Serial.printf("[OTA] Progress: %u%%\r", (progress / (total / 100)));
  });
  ArduinoOTA.onError([](ota_error_t error) {
    Serial.printf("[OTA] Error[%u]: ", error);
    if (error == OTA_AUTH_ERROR) Serial.println("Auth Failed");
    else if (error == OTA_BEGIN_ERROR) Serial.println("Begin Failed");
    else if (error == OTA_CONNECT_ERROR) Serial.println("Connect Failed");
    else if (error == OTA_RECEIVE_ERROR) Serial.println("Receive Failed");
    else if (error == OTA_END_ERROR) Serial.println("End Failed");
  });
  ArduinoOTA.begin();

  Serial.println("[System] Boot Sequence Complete. ARES Rover is ONLINE.");
  Serial.println("==================================================");

  // Initialize ESP-NOW
  if (esp_now_init() == ESP_OK) {
      esp_now_register_recv_cb(OnDataRecv);
      esp_now_peer_info_t peerInfo;
      memset(&peerInfo, 0, sizeof(peerInfo));
      memcpy(peerInfo.peer_addr, scoutMac, 6);
      peerInfo.channel = 0;
      peerInfo.encrypt = false;
      if (esp_now_add_peer(&peerInfo) == ESP_OK) {
          Serial.println("[ESP-NOW] Scout peer registered successfully.");
      }
  } else {
      Serial.println("[ESP-NOW] Initialization failed.");
  }
}

void loop() {
  // Handle OTA updates
  ArduinoOTA.handle();

  // Process inbound websocket packets
  webSocketClient.update();

  // Update IMU calculations
  imuDriver.update();

  // Perform watchdog safety checks (low battery, collision risk, connection
  // timeout)
  watchdog.update();

  // Handle periodic telemetry broadcasts
  unsigned long now = millis();
  if (now - lastTelemetryTime >= telemetryInterval) {
    lastTelemetryTime = now;

    // Read stats
    float volts = batteryMonitor.readVoltage();
    float pct = batteryMonitor.getPercentage();
    int rssi = WiFi.RSSI();

    // Check watchdog and emergency states
    bool safetyTriggered = watchdog.isTriggered();
    bool battLow = watchdog.isBatteryCritical();

    // Read IMU pitch, roll, yaw
    float pitch = imuDriver.getPitch();
    float roll = imuDriver.getRoll();
    float yaw = imuDriver.getYaw();

    // Read ultrasonic distance
    float distance = ultrasonicDriver.readDistanceCm();

    // Calculate current speed estimate
    float currentSpeed =
        (targetLinear != 0.0f) ? fabs(targetLinear * currentThrottle) : 0.0f;

    // Scout link loss check on Mother side
    if (scoutTelemetry.active && (millis() - lastScoutRxTime > 4000)) {
        strncpy(scoutTelemetry.status, "LOST_LINK", sizeof(scoutTelemetry.status));
    }

    // Serialize and broadcast telemetry
    String telemetryData = PacketProtocol::serializeTelemetry(
        volts, pct, rssi, safetyTriggered, battLow, currentSpeed, pitch, roll,
        yaw, distance, scoutTelemetry);
    webSocketClient.sendTelemetry(telemetryData);

    // Send periodic heartbeat to Scout
    sendScoutCommand("HEARTBEAT", "", 0.0f);
  }

  // Sleep slightly to yield to ESP32 background tasks
  delay(10);
}

// Callback handler for WebSocket commands
void handleIncomingCommand(const RoverCommand &cmd) {
  if (cmd.target == "ARES-SCOUT-01" || cmd.target == "scout") {
      sendScoutCommand(cmd.command.c_str(), cmd.valueStr.c_str(), cmd.valueNum);
      
      if (cmd.command == "SET_STATE") {
          strncpy(scoutTelemetry.status, cmd.valueStr.c_str(), sizeof(scoutTelemetry.status) - 1);
      } else if (cmd.command == "estop") {
          strncpy(scoutTelemetry.status, "EMERGENCY_STOP", sizeof(scoutTelemetry.status) - 1);
      }
      return;
  }

  // Reset safety watchdog timer
  watchdog.feed();

  // Verify that battery is safe to operate
  if (watchdog.isBatteryCritical()) {
    Serial.println(
        "[Warning] Command rejected: Battery under-voltage threshold reached!");
    return;
  }

  if (watchdog.isCollisionRisk() && cmd.command == "move" &&
      cmd.valueStr == "forward") {
    Serial.println(
        "[Warning] Move forward rejected: Collision obstacle risk active!");
    return;
  }

  Serial.printf("[Cmd] Processing command: %s\n", cmd.command.c_str());

  if (cmd.command == "move") {
    if (cmd.valueStr == "forward") {
      targetLinear = 1.0f;
      targetAngular = 0.0f;
    } else if (cmd.valueStr == "backward") {
      targetLinear = -1.0f;
      targetAngular = 0.0f;
    } else if (cmd.valueStr == "left") {
      targetLinear = 0.0f;
      targetAngular = 1.0f;
    } else if (cmd.valueStr == "right") {
      targetLinear = 0.0f;
      targetAngular = -1.0f;
    } else if (cmd.valueStr == "forward-left") {
      targetLinear = 1.0f;
      targetAngular = 0.5f;
    } else if (cmd.valueStr == "forward-right") {
      targetLinear = 1.0f;
      targetAngular = -0.5f;
    } else if (cmd.valueStr == "backward-left") {
      targetLinear = -1.0f;
      targetAngular = -0.5f;
    } else if (cmd.valueStr == "backward-right") {
      targetLinear = -1.0f;
      targetAngular = 0.5f;
    } else {
      targetLinear = 0.0f;
      targetAngular = 0.0f;
    }
    updateLocomotion();
  } else if (cmd.command == "stop") {
    targetLinear = 0.0f;
    targetAngular = 0.0f;
    updateLocomotion();
  } else if (cmd.command == "speed") {
    if (cmd.hasNumericValue) {
      currentThrottle = constrain(cmd.valueNum / 100.0f, 0.0f, 1.0f);
      Serial.printf("[Cmd] Speed throttle adjusted to %.2f\n", currentThrottle);
      updateLocomotion();
    }
  } else if (cmd.command == "servo") {
    servoDriver.setAngle(cmd.servoYaw);
    Serial.printf("[Cmd] Servo moved to angle: %d\n", cmd.servoYaw);
  } else if (cmd.command == "deploy") {
    if (cmd.valueStr == "deployScout") {
      servoDriver.deployScout();
      strncpy(scoutTelemetry.status, "READY_FOR_DEPLOYMENT", sizeof(scoutTelemetry.status) - 1);
      sendScoutCommand("SET_STATE", "READY_FOR_DEPLOYMENT", 0.0f);
    } else if (cmd.valueStr == "retractScout") {
      servoDriver.retractScout();
      strncpy(scoutTelemetry.status, "DOCKED", sizeof(scoutTelemetry.status) - 1);
      sendScoutCommand("SET_STATE", "DOCKED", 0.0f);
    }
  } else if (cmd.command == "estop") {
    targetLinear = 0.0f;
    targetAngular = 0.0f;
    updateLocomotion();
    motorDriver.setStandby(true); // Disable H-bridges immediately
    Serial.println(
        "[Failsafe] Emergency Stop triggered manually via control client!");
  }
}

// Translate target linear/angular velocities to wheel outputs
void updateLocomotion() {
  motorDriver.setStandby(false); // Force enable motor drivers out of standby
  float resolvedLinear = targetLinear * currentThrottle;
  float resolvedAngular = targetAngular * currentThrottle;

  WheelSpeeds speeds = kinematics.resolve(resolvedLinear, resolvedAngular);
  motorDriver.setSpeeds(speeds.lf, speeds.lr, speeds.rf, speeds.rr);
}