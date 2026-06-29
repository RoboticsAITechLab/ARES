#include "comms/websocket_client.h"
#include "comms/wifi_manager.h"
#include "comms/ota_manager.h"
#include "drivers/battery_monitor.h"
#include "drivers/imu_driver.h"
#include "drivers/motor_driver.h"
#include "drivers/servo_driver.h"
#include "drivers/ultrasonic_driver.h"
#include "safety/watchdog.h"
#include "safety/recovery_manager.h"
#include "safety/diagnostics.h"
#include "val/kinematics.h"
#include <Arduino.h>
#include <Preferences.h>

// Wi-Fi Station Configuration
const char *WIFI_SSID = "Airtel_RoboticsAiTechLab";
const char *WIFI_PASSWORD = "RoboticsAiTechLabs";

// Hardcoded default device identity for demonstration / default state
String roverId = "mother-rover";
String apiKey = "generated-key";
String firmwareVersion = "1.3.0";

// System Instances
MotorDriver motorDriver;
BatteryMonitor batteryMonitor;
ImuDriver imuDriver;
UltrasonicDriver ultrasonicDriver(2, 34); // trig=2, echo=34
ServoDriver servoDriver(4);               // servo=4
Kinematics kinematics;
Watchdog watchdog(1500); // 1500ms safety timeout
WifiManager wifiManager("ARES_Rover_V2", "aresroverpassword");

// Instantiate global WebsocketClient with a generic path that will be overridden on setup
WebsocketClient webSocketClient("192.168.1.5", 3001, "/ws");

// Global Configuration states (load from Preferences if present)
float currentThrottle = 0.6f;
float targetLinear = 0.0f;
float targetAngular = 0.0f;

// Diagnostics results caching
SelfTestReport lastDiagnostics;

unsigned long lastTelemetryTime = 0;
const unsigned long telemetryInterval = 1000;
bool bootMarkedClean = false;

// Forward Declarations
void handleIncomingCommand(const RoverCommand &cmd);
void updateLocomotion();
void logToCloud(const String& level, const String& msg);
void sendCommandAck(const String& command, const String& status, const String& extraJson = "");

void setup() {
  Serial.begin(115200);
  delay(1000);
  Serial.println("==================================================");
  Serial.println("         ARES ROVER HARDENED OTA FIRMWARE         ");
  Serial.println("==================================================");

  // Initialize Recovery & Boot manager
  RecoveryManager::getInstance().begin();
  bool safeMode = RecoveryManager::getInstance().isSafeMode();

  // Initialize Preferences and load credentials/configurations
  Preferences prefs;
  prefs.begin("ares_config", false);
  roverId = prefs.getString("rover_id", "mother-rover");
  apiKey = prefs.getString("api_key", "generated-key");
  currentThrottle = prefs.getFloat("speed_mult", 0.6f);
  prefs.end();

  // Configure dynamic authentication path for WebsocketClient
  // We point it to localhost or local network server depending on dev configuration
  // Usually the host is overridden by network scan or local IP, but we use the backend server port 3001
  String wsPath = "/ws?token=ares_auth_secret&role=rover&roverId=" + roverId + "&apiKey=" + apiKey;
  webSocketClient.setPath(wsPath);

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

  // Safe Mode Logic: If Safe Mode is active, disable motor control outputs completely
  if (safeMode) {
      Serial.println("[System] WARNING: Booted in SAFE MODE. Motors and autonomy are DISABLED.");
      motorDriver.stopAll();
      motorDriver.setStandby(true);
  } else {
      // Initialize Motor HAL normally
      Serial.println("[Init] Initializing Motor Driver HAL...");
      motorDriver.begin();
      
      // Initialize Safety Watchdog
      Serial.println("[Init] Registering Watchdog Safety Guardian...");
      watchdog.begin(&batteryMonitor, &motorDriver, &ultrasonicDriver);
  }

  // Initialize WiFi
  Serial.println("[Init] Booting WiFi Link...");
  wifiManager.begin(WIFI_SSID, WIFI_PASSWORD);

  // Start WebSocket Client
  Serial.println("[Init] Connecting WebSocket Client...");
  webSocketClient.begin(handleIncomingCommand);

  // Initialize OTA Manager
  // Standard port 3001 for local REST backend, fallback to Render/Cloud depending on environments
  OtaManager::getInstance().begin("192.168.1.5", 3001, roverId, apiKey);

  Serial.println("[System] Boot Sequence Complete. ARES Rover is ONLINE.");
  Serial.println("==================================================");
}

void loop() {
  // Check and mark boot clean after 15 seconds of clean execution
  if (!bootMarkedClean && millis() > 15000) {
      bootMarkedClean = true;
      RecoveryManager::getInstance().markBootClean();
      logToCloud("INFO", "Rover boot finalized and marked clean in system registers.");
  }

  // Process inbound websocket packets
  webSocketClient.update();

  // Periodically check and run background OTA downloads (within schedule window)
  if (!RecoveryManager::getInstance().isSafeMode()) {
      OtaManager::getInstance().update();
  }

  // Update IMU orientation fusion
  imuDriver.update();

  // Run watchdog safety checks (only if not in safe mode)
  if (!RecoveryManager::getInstance().isSafeMode()) {
      watchdog.update();
  }

  // Periodic telemetry broadcast
  unsigned long now = millis();
  if (now - lastTelemetryTime >= telemetryInterval) {
    lastTelemetryTime = now;

    float volts = batteryMonitor.readVoltage();
    float pct = batteryMonitor.getPercentage();
    int rssi = WiFi.status() == WL_CONNECTED ? WiFi.RSSI() : -100;

    bool safetyTriggered = !RecoveryManager::getInstance().isSafeMode() && watchdog.isTriggered();
    bool battLow = watchdog.isBatteryCritical();

    float pitch = imuDriver.getPitch();
    float roll = imuDriver.getRoll();
    float yaw = imuDriver.getYaw();

    float distance = ultrasonicDriver.readDistanceCm();
    float currentSpeed = (targetLinear != 0.0f) ? fabs(targetLinear * currentThrottle) : 0.0f;

    uint32_t freeHeap = ESP.getFreeHeap();
    float tempCelsius = 28.0f; // Mock internal temp sensor

    // Retrieve Recovery states
    String bootReason = RecoveryManager::getInstance().getBootReason();
    String lastCrash = RecoveryManager::getInstance().getLastCrash();
    int rollbackCount = RecoveryManager::getInstance().getRollbackCount();
    String otaStatus = OtaManager::getInstance().getOtaStatus();
    bool safeModeActive = RecoveryManager::getInstance().isSafeMode();

    String telemetryData = PacketProtocol::serializeTelemetry(
        volts, pct, rssi, safetyTriggered, battLow, currentSpeed, pitch, roll,
        yaw, distance, firmwareVersion, freeHeap, tempCelsius,
        bootReason, lastCrash, rollbackCount, otaStatus, safeModeActive
    );
    
    webSocketClient.sendTelemetry(telemetryData);
  }

  delay(10);
}

void logToCloud(const String& level, const String& msg) {
    Serial.printf("[%s] %s\n", level.c_str(), msg.c_str());
    String payload = "{\"type\":\"rover_log\",\"level\":\"" + level + "\",\"message\":\"" + msg + "\",\"timestamp\":" + String(millis()) + "}";
    webSocketClient.sendTelemetry(payload);
}

void sendCommandAck(const String& command, const String& status, const String& extraJson) {
    String payload = "{\"type\":\"command_ack\",\"command\":\"" + command + "\",\"status\":\"" + status + "\",\"timestamp\":" + String(millis());
    if (extraJson.length() > 0) {
        payload += ",\"value\":" + extraJson;
    }
    payload += "}";
    webSocketClient.sendTelemetry(payload);
}

void handleIncomingCommand(const RoverCommand &cmd) {
  // Feed watchdog if not in safe mode
  if (!RecoveryManager::getInstance().isSafeMode()) {
      watchdog.feed();
  }

  // Reject execution commands if in Safe Mode
  if (RecoveryManager::getInstance().isSafeMode()) {
      if (cmd.command == "move" || cmd.command == "speed" || cmd.command == "servo" || cmd.command == "deploy") {
          logToCloud("WARNING", "Command " + cmd.command + " rejected: Rover is currently in SAFE MODE.");
          sendCommandAck(cmd.command, "failed", "\"Safe Mode Active\"");
          return;
      }
  }

  // Process standard execution commands
  if (cmd.command == "move") {
    if (cmd.valueStr == "forward") {
      targetLinear = 1.0f;
      targetAngular = 0.0f;
    } else if (cmd.valueStr == "backward") {
      targetLinear = -1.0f;
      targetAngular = 0.0f;
    } else if (cmd.valueStr == "left") {
      targetLinear = 0.0f;
      targetAngular = -1.0f;
    } else if (cmd.valueStr == "right") {
      targetLinear = 0.0f;
      targetAngular = 1.0f;
    } else {
      targetLinear = 0.0f;
      targetAngular = 0.0f;
    }
    updateLocomotion();
    sendCommandAck("move", "completed");
  } else if (cmd.command == "stop") {
    targetLinear = 0.0f;
    targetAngular = 0.0f;
    updateLocomotion();
    sendCommandAck("stop", "completed");
  } else if (cmd.command == "speed") {
    if (cmd.hasNumericValue) {
      currentThrottle = constrain(cmd.valueNum / 100.0f, 0.0f, 1.0f);
      updateLocomotion();
      
      Preferences prefs;
      prefs.begin("ares_config", false);
      prefs.putFloat("speed_mult", currentThrottle);
      prefs.end();
      
      sendCommandAck("speed", "completed");
    }
  } else if (cmd.command == "servo") {
    servoDriver.setAngle(cmd.servoYaw);
    sendCommandAck("servo", "completed");
  } else if (cmd.command == "estop") {
    targetLinear = 0.0f;
    targetAngular = 0.0f;
    updateLocomotion();
    motorDriver.setStandby(true);
    logToCloud("CRITICAL", "Emergency Stop triggered manually via control client!");
    sendCommandAck("estop", "completed");
  } 
  // Hardened Remote Recovery & OTA Commands
  else if (cmd.command == "reboot") {
    logToCloud("WARNING", "Reboot command received. Restarting system...");
    sendCommandAck("reboot", "acknowledged");
    delay(500);
    RecoveryManager::getInstance().forceReboot();
  } else if (cmd.command == "rollback") {
    logToCloud("WARNING", "Rollback command received. Triggering firmare restoration...");
    sendCommandAck("rollback", "acknowledged");
    OtaManager::getInstance().triggerUpdate("rollback");
  } else if (cmd.command == "factory_reset") {
    logToCloud("CRITICAL", "Factory reset command received. Purging credentials and variables...");
    sendCommandAck("factory_reset", "acknowledged");
    delay(500);
    RecoveryManager::getInstance().factoryReset();
  } else if (cmd.command == "diagnostics") {
    logToCloud("INFO", "Running diagnostics routine...");
    sendCommandAck("diagnostics", "acknowledged");
    
    SelfTestReport report = Diagnostics::getInstance().runSelfTests(
        motorDriver, servoDriver, imuDriver, ultrasonicDriver
    );
    
    String reportJson = "{\"motor\":" + String(report.motor ? "true" : "false") +
                        ",\"servo\":" + String(report.servo ? "true" : "false") +
                        ",\"imu\":" + String(report.imu ? "true" : "false") +
                        ",\"ultrasonic\":" + String(report.ultrasonic ? "true" : "false") +
                        ",\"camera\":" + String(report.camera ? "true" : "false") +
                        ",\"wifi\":" + String(report.wifi ? "true" : "false") +
                        ",\"memory\":" + String(report.memory ? "true" : "false") +
                        ",\"summary\":\"" + report.summary + "\"}";
                        
    sendCommandAck("diagnostics", "completed", reportJson);
  } else if (cmd.command == "ota_trigger") {
    logToCloud("INFO", "OTA Update trigger request received.");
    sendCommandAck("ota_trigger", "acknowledged");
    OtaManager::getInstance().triggerUpdate();
  } else if (cmd.command == "config_update") {
    logToCloud("INFO", "Parameters configuration update received.");
    sendCommandAck("config_update", "completed");
  }
}

void updateLocomotion() {
  if (RecoveryManager::getInstance().isSafeMode()) return;
  
  motorDriver.setStandby(false);
  float resolvedLinear = targetLinear * currentThrottle;
  float resolvedAngular = targetAngular * currentThrottle;

  WheelSpeeds speeds = kinematics.resolve(resolvedLinear, resolvedAngular);
  motorDriver.setSpeeds(speeds.lf, speeds.lr, speeds.rf, speeds.rr);
}