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
    bool isHealthy() const { return m_initialized; }

private:
    MPU9250* m_mpu;
    bool m_initialized;
    float m_pitch;
    float m_roll;
    float m_yaw;

    // Madgwick filter variables
    float q0, q1, q2, q3;
    float beta;
    void madgwickUpdate(float gx, float gy, float gz, float ax, float ay, float az, float dt);
};

#endif // IMU_DRIVER_H
