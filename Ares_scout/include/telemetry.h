#ifndef TELEMETRY_H
#define TELEMETRY_H

#include <ArduinoJson.h>
#include "config.h"
#include "imu_manager.h"
#include "ultrasonic_sensor.h"
#include "motor_controller.h"
#include "safety_manager.h"

class TelemetryManager {
public:
    TelemetryManager(ImuManager* imu, UltrasonicSensor* sonar, MotorController* motor, SafetyManager* safety);
    void begin();
    
    // Gathers system metrics and writes the JSON document out to Serial.
    void update(RoverState currentState);

private:
    ImuManager* m_imu;
    UltrasonicSensor* m_sonar;
    MotorController* m_motor;
    SafetyManager* m_safety;

    unsigned long m_lastTelemetryMs;

    String getTerrainString(float variance);
};

#endif // TELEMETRY_H
