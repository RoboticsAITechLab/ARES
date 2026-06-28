#ifndef IMU_DRIVER_H
#define IMU_DRIVER_H

#include <Arduino.h>
#include <Wire.h>
#include <MPU9250.h>

class ImuDriver {
public:
    ImuDriver();
    void begin();
    void update();
    float getPitch() const { return m_pitch; }
    float getRoll() const { return m_roll; }
    float getYaw() const { return m_yaw; }

private:
    MPU9250 m_mpu;
    bool m_initialized;
    float m_pitch;
    float m_roll;
    float m_yaw;
};

#endif // IMU_DRIVER_H
