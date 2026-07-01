#ifndef SAFETY_MANAGER_H
#define SAFETY_MANAGER_H

#include "config.h"
#include "motor_controller.h"
#include "imu_manager.h"
#include "ultrasonic_sensor.h"

class SafetyManager {
public:
    SafetyManager(MotorController* motor, ImuManager* imu, UltrasonicSensor* sonar);
    void begin();
    
    // Monitors health states, updates watchdog timers, enforces shutdowns.
    void update();
    
    // Resets the timeout watchdog timer
    void feedWatchdog();
    
    // Check if safety shutdown is active
    bool isEmergencyActive() const { return m_emergencyActive; }
    bool isRolloverDetected() const { return m_rolloverActive; }
    bool isCollisionImpact() const { return m_collisionImpact; }
    bool isSensorFault() const { return m_sensorFault; }
    bool isWatchdogTriggered() const { return m_watchdogTriggered; }

    // Recover from emergency state if safe
    void resetEmergency();

private:
    MotorController* m_motor;
    ImuManager* m_imu;
    UltrasonicSensor* m_sonar;

    unsigned long m_lastFeedMs;
    bool m_emergencyActive;
    bool m_rolloverActive;
    bool m_collisionImpact;
    bool m_sensorFault;
    bool m_watchdogTriggered;

    void triggerEmergencyStop();
};

#endif // SAFETY_MANAGER_H
