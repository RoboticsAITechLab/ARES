#ifndef WATCHDOG_H
#define WATCHDOG_H

#include <Arduino.h>
#include "../drivers/battery_monitor.h"
#include "../drivers/motor_driver.h"
#include "../drivers/ultrasonic_driver.h"

class Watchdog {
public:
    Watchdog(unsigned long timeoutMs = 500);
    
    void begin(BatteryMonitor* batteryMonitor, MotorDriver* motorDriver, UltrasonicDriver* ultrasonicDriver = nullptr);
    
    void feed();
    void update();
    
    bool isTriggered() const { return m_triggered; }
    bool isBatteryCritical() const { return m_batteryCritical; }
    bool isCollisionRisk() const { return m_collisionRisk; }
    unsigned long getLastFeedTime() const { return m_lastFeedTime; }

private:
    unsigned long m_timeoutMs;
    unsigned long m_lastFeedTime;
    bool m_triggered;
    bool m_batteryCritical;
    bool m_collisionRisk;
    
    BatteryMonitor* m_batteryMonitor;
    MotorDriver* m_motorDriver;
    UltrasonicDriver* m_ultrasonicDriver;
};

#endif // WATCHDOG_H
