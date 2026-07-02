#include "safety_manager.h"

SafetyManager::SafetyManager(MotorController* motor, ImuManager* imu, UltrasonicSensor* sonar)
    : m_motor(motor), m_imu(imu), m_sonar(sonar), m_lastFeedMs(0),
      m_emergencyActive(false), m_rolloverActive(false), m_collisionImpact(false),
      m_sensorFault(false), m_watchdogTriggered(false) {}

void SafetyManager::begin() {
    m_lastFeedMs = millis();
}

void SafetyManager::feedWatchdog() {
    m_lastFeedMs = millis();
    m_watchdogTriggered = false;
}

void SafetyManager::update() {
    unsigned long now = millis();

    // 1. Check Watchdog timeout
    if (now - m_lastFeedMs > SafetyConfig::WATCHDOG_TIMEOUT) {
        if (!m_watchdogTriggered) {
            Serial.println("[Safety] WATCHDOG TIMEOUT! No controller feed.");
            m_watchdogTriggered = true;
            triggerEmergencyStop();
        }
    }

    // 2. Check IMU Rollover
    if (m_imu->isHealthy() && m_imu->isRolloverDetected()) {
        if (!m_rolloverActive) {
            Serial.printf("[Safety] ROLLOVER WARNING! Orientation Pitch=%.2f, Roll=%.2f\n", 
                m_imu->getData().pitch, m_imu->getData().roll);
            m_rolloverActive = true;
            triggerEmergencyStop();
        }
    } else {
        m_rolloverActive = false;
    }

    // 3. Check IMU Shock (Collision)
    if (m_imu->isHealthy() && m_imu->isCollisionDetected()) {
        if (!m_collisionImpact) {
            Serial.println("[Safety] COLLISION DETECTED! High-G acceleration impact.");
            m_collisionImpact = true;
            triggerEmergencyStop();
        }
    }

    // 4. Check Sensor Health Faults (Non-blocking Warning)
    if (!m_imu->isHealthy() || !m_sonar->isHealthy()) {
        static bool warningLogged = false;
        if (!warningLogged) {
            Serial.printf("[Safety] WARNING: Sensor offline/faulty! IMU Healthy=%d, Sonar Healthy=%d\n", 
                m_imu->isHealthy(), m_sonar->isHealthy());
            warningLogged = true;
        }
        m_sensorFault = false;
    } else {
        m_sensorFault = false;
    }
}

void SafetyManager::triggerEmergencyStop() {
    m_emergencyActive = true;
    m_motor->emergencyStop();
}

void SafetyManager::resetEmergency() {
    if (m_rolloverActive || m_sensorFault || m_watchdogTriggered) {
        Serial.println("[Safety] Cannot reset emergency stop: faults are still active.");
        return;
    }
    
    m_emergencyActive = false;
    m_collisionImpact = false;
    m_motor->setStandby(false);
    feedWatchdog();
    Serial.println("[Safety] Emergency state successfully cleared.");
}
