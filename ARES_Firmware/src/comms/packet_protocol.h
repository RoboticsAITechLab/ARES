#ifndef PACKET_PROTOCOL_H
#define PACKET_PROTOCOL_H

#include <Arduino.h>
#include <ArduinoJson.h>

struct RoverCommand {
    String target;
    String command;
    String valueStr;
    float valueNum;
    bool hasNumericValue;
    int servoPitch;
    int servoYaw;
};

struct ScoutData {
    char id[16] = "ARES-SCOUT-01";
    float battery = 0.0f;
    int signal = 0;
    float temperature = 0.0f;
    float speed = 0.0f;
    float heading = 0.0f;
    float pitch = 0.0f;
    float roll = 0.0f;
    float distance = 0.0f;
    float x = 45.0f;
    float y = 35.0f;
    char status[32] = "OFFLINE";
    bool active = false;
};

class PacketProtocol {
public:
    static bool parseCommand(const uint8_t* payload, size_t length, RoverCommand& outCmd) {
        JsonDocument doc;
        DeserializationError error = deserializeJson(doc, payload, length);
        
        if (error) {
            return false;
        }

        const char* type = doc["type"];
        if (!type || strcmp(type, "rover_command") != 0) {
            return false;
        }

        const char* command = doc["command"];
        if (!command) {
            return false;
        }

        outCmd.target = doc["target"].as<String>();
        if (outCmd.target.length() == 0) {
            outCmd.target = "ARES-MOTHER-01";
        }
        outCmd.command = String(command);
        outCmd.servoPitch = 90;
        outCmd.servoYaw = 90;
        
        if (doc["value"].is<float>()) {
            outCmd.valueNum = doc["value"].as<float>();
            outCmd.hasNumericValue = true;
            outCmd.valueStr = "";
        } else if (doc["value"].is<const char*>()) {
            outCmd.valueStr = String(doc["value"].as<const char*>());
            outCmd.hasNumericValue = false;
            outCmd.valueNum = 0.0f;
        } else if (doc["value"].is<JsonObject>()) {
            JsonObject valObj = doc["value"].as<JsonObject>();
            outCmd.servoPitch = valObj["pitch"] | 90;
            outCmd.servoYaw = valObj["yaw"] | 90;
            outCmd.hasNumericValue = false;
            outCmd.valueStr = "";
            outCmd.valueNum = 0.0f;
        } else {
            outCmd.hasNumericValue = false;
            outCmd.valueStr = "";
            outCmd.valueNum = 0.0f;
        }

        return true;
    }

    static String serializeTelemetry(float batteryVoltage, float batteryPercent, int rssi, bool watchdogTriggered, bool batteryLow, float speed, float pitch, float roll, float yaw, float obstacleDistance, const ScoutData& scout) {
        JsonDocument doc;
        doc["type"] = "rover_telemetry";
        doc["batteryVoltage"] = batteryVoltage;
        doc["batteryPercent"] = batteryPercent;
        doc["signalRssi"] = rssi;
        doc["safety_triggered"] = watchdogTriggered;
        doc["battery_low"] = batteryLow;
        doc["speed"] = speed;
        doc["pitch"] = pitch;
        doc["roll"] = roll;
        doc["yaw"] = yaw;
        doc["obstacleDistance"] = obstacleDistance;
        doc["uptime"] = millis() / 1000;
        
        JsonArray scouts = doc["scouts"].to<JsonArray>();
        JsonObject s = scouts.add<JsonObject>();
        s["id"] = scout.id;
        s["battery"] = scout.active ? scout.battery : 0.0f;
        s["signal"] = scout.active ? scout.signal : 0;
        s["temperature"] = scout.active ? scout.temperature : 0.0f;
        s["speed"] = scout.active ? scout.speed : 0.0f;
        s["heading"] = scout.active ? scout.heading : 0.0f;
        s["pitch"] = scout.active ? scout.pitch : 0.0f;
        s["roll"] = scout.active ? scout.roll : 0.0f;
        s["distance"] = scout.active ? scout.distance : 0.0f;
        s["x"] = scout.active ? scout.x : 45.0f;
        s["y"] = scout.active ? scout.y : 35.0f;
        s["status"] = scout.status;
        
        String output;
        serializeJson(doc, output);
        return output;
    }
};

#endif // PACKET_PROTOCOL_H
