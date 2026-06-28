#include "imu_driver.h"

ImuDriver::ImuDriver() : m_mpu(Wire, 0x68), m_initialized(false), m_pitch(0.0f), m_roll(0.0f), m_yaw(0.0f) {}

void ImuDriver::begin() {
    Wire.begin(21, 22); // Standard I2C: SDA=21, SCL=22
    delay(100);
    
    int status = m_mpu.begin();
    if (status < 0) {
        Serial.print("[IMU] Initialization failed: ");
        Serial.println(status);
        m_initialized = false;
        return;
    }
    
    m_mpu.setAccelRange(MPU9250::ACCEL_RANGE_8G);
    m_mpu.setGyroRange(MPU9250::GYRO_RANGE_500DPS);
    m_mpu.setDlpfBandwidth(MPU9250::DLPF_BANDWIDTH_20HZ);
    m_mpu.setSrd(19); // 50 Hz updates
    m_initialized = true;
    Serial.println("[IMU] MPU9250 Online & Calibrated.");
}

void ImuDriver::update() {
    if (!m_initialized) return;
    
    if (m_mpu.readSensor() < 0) {
        return;
    }
    
    float ax = m_mpu.getAccelX_mss();
    float ay = m_mpu.getAccelY_mss();
    float az = m_mpu.getAccelZ_mss();
    float gz = m_mpu.getGyroZ_rads();

    // Basic trigonometric calculation for Pitch & Roll orientation angles
    m_pitch = atan2(-ax, sqrt(ay * ay + az * az)) * 180.0 / PI;
    m_roll = atan2(ay, az) * 180.0 / PI;
    
    // Yaw heading accumulation
    static unsigned long lastUpdate = 0;
    unsigned long now = millis();
    if (lastUpdate == 0) {
        lastUpdate = now;
        return;
    }
    
    float dt = (now - lastUpdate) / 1000.0f;
    lastUpdate = now;

    float yawRate = gz * 180.0 / PI;
    m_yaw += yawRate * dt;
    
    // Normalize heading to [0, 360] range
    if (m_yaw >= 360.0f) m_yaw -= 360.0f;
    if (m_yaw < 0.0f) m_yaw += 360.0f;
}
