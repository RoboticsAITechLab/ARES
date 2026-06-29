#ifndef PACKET_PROTOCOL_H
#define PACKET_PROTOCOL_H

#include <Arduino.h>
#include <ArduinoJson.h>

struct RoverCommand {
    String command;
    String valueStr;
    float valueNum;
    bool hasNumericValue;
    int servoPitch;
    int servoYaw;
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
        if (!type || (strcmp(type, "rover_command") != 0 && strcmp(type, "config_update") != 0)) {
            return false;
        }

        const char* command = doc["command"];
        if (!command) {
            outCmd.command = String(type); // fallback
        } else {
            outCmd.command = String(command);
        }

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

    static String serializeTelemetry(
        float batteryVoltage, float batteryPercent, int rssi, bool watchdogTriggered, 
        bool batteryLow, float speed, float pitch, float roll, float yaw, float obstacleDistance,
        const String& firmwareVersion, uint32_t heapFree, float cpuTemp,
        const String& bootReason, const String& lastCrash, int rollbackCount, 
        const String& otaStatus, bool safeMode
    ) {
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

        // Expanded telemetry structure
        doc["roverId"] = "mother-rover";
        doc["firmwareVersion"] = firmwareVersion;
        doc["battery"] = batteryPercent;
        doc["wifiRssi"] = rssi;
        doc["heapFree"] = heapFree;
        doc["cpuTemp"] = cpuTemp;
        
        // Hardened recovery fields
        doc["bootReason"] = bootReason;
        doc["lastCrash"] = lastCrash;
        doc["rollbackCount"] = rollbackCount;
        doc["otaStatus"] = otaStatus;
        doc["safeMode"] = safeMode;

        String output;
        serializeJson(doc, output);
        return output;
    }
};

#endif // PACKET_PROTOCOL_H
