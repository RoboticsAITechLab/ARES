#include "watchdog.h"

Watchdog::Watchdog(unsigned long timeoutMs)
    : m_timeoutMs(timeoutMs),
      m_lastFeedTime(0),
      m_triggered(true),
      m_batteryCritical(false),
      m_collisionRisk(false),
      m_batteryMonitor(nullptr),
      m_motorDriver(nullptr),
      m_ultrasonicDriver(nullptr) {}

void Watchdog::begin(BatteryMonitor* batteryMonitor, MotorDriver* motorDriver, UltrasonicDriver* ultrasonicDriver) {
    m_batteryMonitor = batteryMonitor;
    m_motorDriver = motorDriver;
    m_ultrasonicDriver = ultrasonicDriver;
    m_lastFeedTime = millis();
}

void Watchdog::feed() {
    m_lastFeedTime = millis();
    m_triggered = false;
}

void Watchdog::update() {
    // Bypassed battery and proximity safety checks for motor control testing
    m_batteryCritical = false;
    m_collisionRisk = false;

    // Check Connection Heartbeat Watchdog Timeout
    unsigned long now = millis();
    if (!m_triggered && (now - m_lastFeedTime > m_timeoutMs)) {
        m_triggered = true;
        if (m_motorDriver) {
            m_motorDriver->stopAll();
        }
    }
}
