#ifndef IMU_MANAGER_H
#define IMU_MANAGER_H

#include <Arduino.h>
#include <Wire.h>
#include <MPU9250.h>
#include "config.h"

struct ImuData {
    float ax, ay, az; // Accelerometer (m/s^2)
    float gx, gy, gz; // Gyroscope (rad/s)
    float mx, my, mz; // Magnetometer (uT)
    float temp;       // Temperature (C)
    float pitch;      // Estimated pitch (degrees)
    float roll;       // Estimated roll (degrees)
    float yaw;        // Estimated yaw (degrees, 0-360)
};

class ImuManager {
public:
    ImuManager();
    bool begin();
    
    // Non-blocking update. Integrates sensors, filters yaw, checks thresholds.
    void update();
    
    // Triggers calibration routine. Rover must be stationary.
    bool calibrate();
    
    // Data and state status accessors
    const ImuData& getData() const { return m_data; }
    bool isHealthy() const { return m_healthy; }
    bool isCalibrated() const { return m_calibrated; }
    bool isRolloverDetected() const { return m_rolloverWarning; }
    bool isCollisionDetected() const { return m_collisionWarning; }
    float getTerrainVariance() const { return m_terrainVariance; }

private:
    MPU9250 m_mpu;
    ImuData m_data;
    bool m_healthy;
    bool m_calibrated;
    bool m_rolloverWarning;
    bool m_collisionWarning;
    
    // Gyro bias offsets
    float m_gyroBiasX;
    float m_gyroBiasY;
    float m_gyroBiasZ;
    
    // Mag calibration offsets (min/max window method)
    float m_magOffsetX;
    float m_magOffsetY;
    float m_magOffsetZ;

    unsigned long m_lastUpdateMs;
    
    // Circular buffer for Z-axis acceleration variance (Terrain roughness classification)
    static const int VARIANCE_WINDOW = 10;
    float m_accelZHistory[VARIANCE_WINDOW];
    int m_historyIndex;
    float m_terrainVariance;

    void updateSensors();
    void computeOrientation(float dt);
    void classifyTerrain();
};

#endif // IMU_MANAGER_H
