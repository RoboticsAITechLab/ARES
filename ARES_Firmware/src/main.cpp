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

    // Serialize and broadcast telemetry
    String telemetryData = PacketProtocol::serializeTelemetry(
        volts, pct, rssi, safetyTriggered, battLow, currentSpeed, pitch, roll,
        yaw, distance);
    webSocketClient.sendTelemetry(telemetryData);
  }

  // Sleep slightly to yield to ESP32 background tasks
  delay(10);
}

// Callback handler for WebSocket commands
void handleIncomingCommand(const RoverCommand &cmd) {
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
    } else if (cmd.valueStr == "retractScout") {
      servoDriver.retractScout();
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