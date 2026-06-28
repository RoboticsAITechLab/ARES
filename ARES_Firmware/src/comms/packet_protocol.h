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
        if (!type || strcmp(type, "rover_command") != 0) {
            return false;
        }

        const char* command = doc["command"];
        if (!command) {
            return false;
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

    static String serializeTelemetry(float batteryVoltage, float batteryPercent, int rssi, bool watchdogTriggered, bool batteryLow, float speed, float pitch, float roll, float yaw, float obstacleDistance) {
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
        
        String output;
        serializeJson(doc, output);
        return output;
    }
};

#endif // PACKET_PROTOCOL_H
