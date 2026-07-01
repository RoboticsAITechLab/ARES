#include "imu_manager.h"
#include <math.h>

ImuManager::ImuManager()
    : m_mpu(Wire, ImuPins::ADDR), m_healthy(false), m_calibrated(false),
      m_rolloverWarning(false), m_collisionWarning(false),
      m_gyroBiasX(0.0f), m_gyroBiasY(0.0f), m_gyroBiasZ(0.0f),
      m_magOffsetX(0.0f), m_magOffsetY(0.0f), m_magOffsetZ(0.0f),
      m_lastUpdateMs(0), m_historyIndex(0), m_terrainVariance(0.0f) {
          
    memset(&m_data, 0, sizeof(ImuData));
    for (int i = 0; i < VARIANCE_WINDOW; i++) {
        m_accelZHistory[i] = 9.8f; // Gravity default
    }
}

bool ImuManager::begin() {
    Wire.begin(ImuPins::SDA, ImuPins::SCL);
    delay(100);

    int status = m_mpu.begin();
    if (status < 0) {
        Serial.print("[IMU] Initialization failed with status: ");
        Serial.println(status);
        m_healthy = false;
        return false;
    }

    m_mpu.setAccelRange(MPU9250::ACCEL_RANGE_8G);
    m_mpu.setGyroRange(MPU9250::GYRO_RANGE_500DPS);
    m_mpu.setDlpfBandwidth(MPU9250::DLPF_BANDWIDTH_20HZ);
    m_mpu.setSrd(19); // 50 Hz updates

    m_healthy = true;
    Serial.println("[IMU] MPU9250 initialized successfully.");
    return true;
}

bool ImuManager::calibrate() {
    if (!m_healthy) return false;

    Serial.println("[IMU] Starting Gyro calibration. DO NOT MOVE ROVER...");
    float sumX = 0, sumY = 0, sumZ = 0;
    const int samples = 200;

    for (int i = 0; i < samples; i++) {
        if (m_mpu.readSensor() >= 0) {
            sumX += m_mpu.getGyroX_rads();
            sumY += m_mpu.getGyroY_rads();
            sumZ += m_mpu.getGyroZ_rads();
        }
        delay(10);
    }

    m_gyroBiasX = sumX / samples;
    m_gyroBiasY = sumY / samples;
    m_gyroBiasZ = sumZ / samples;

    m_calibrated = true;
    m_lastUpdateMs = millis();
    Serial.printf("[IMU] Gyro calibrated. Offsets: X=%.4f, Y=%.4f, Z=%.4f\n", m_gyroBiasX, m_gyroBiasY, m_gyroBiasZ);
    return true;
}

void ImuManager::update() {
    if (!m_healthy) return;

    if (m_mpu.readSensor() < 0) {
        // Read fail
        return;
    }

    unsigned long now = millis();
    float dt = (now - m_lastUpdateMs) / 1000.0f;
    m_lastUpdateMs = now;
    if (dt <= 0.0f) dt = 0.001f;

    updateSensors();
    computeOrientation(dt);
    classifyTerrain();
}

void ImuManager::updateSensors() {
    m_data.ax = m_mpu.getAccelX_mss();
    m_data.ay = m_mpu.getAccelY_mss();
    m_data.az = m_mpu.getAccelZ_mss();

    m_data.gx = m_mpu.getGyroX_rads() - m_gyroBiasX;
    m_data.gy = m_mpu.getGyroY_rads() - m_gyroBiasY;
    m_data.gz = m_mpu.getGyroZ_rads() - m_gyroBiasZ;

    m_data.mx = m_mpu.getMagX_uT() - m_magOffsetX;
    m_data.my = m_mpu.getMagY_uT() - m_magOffsetY;
    m_data.mz = m_mpu.getMagZ_uT() - m_magOffsetZ;

    m_data.temp = m_mpu.getTemperature_C();
}

void ImuManager::computeOrientation(float dt) {
    // 1. Calculate Pitch & Roll from accelerometer
    // Pitch (theta) around Y axis, Roll (phi) around X axis
    float pitchRad = atan2(-m_data.ax, sqrt(m_data.ay * m_data.ay + m_data.az * m_data.az));
    float rollRad = atan2(m_data.ay, m_data.az);

    m_data.pitch = pitchRad * 180.0f / PI;
    m_data.roll = rollRad * 180.0f / PI;

    // 2. Rollover detection check
    if (fabs(m_data.pitch) > SafetyConfig::ROLLOVER_THRESHOLD || 
        fabs(m_data.roll) > SafetyConfig::ROLLOVER_THRESHOLD) {
        m_rolloverWarning = true;
    } else {
        m_rolloverWarning = false;
    }

    // 3. Tilt-compensated magnetometer heading calculation
    float cosRoll = cos(rollRad);
    float sinRoll = sin(rollRad);
    float cosPitch = cos(pitchRad);
    float sinPitch = sin(pitchRad);

    float Xh = m_data.mx * cosPitch + m_data.mz * sinPitch;
    float Yh = m_data.mx * sinRoll * sinPitch + m_data.my * cosRoll - m_data.mz * sinRoll * cosPitch;

    float headingMag = atan2(-Yh, Xh) * 180.0f / PI;
    if (headingMag < 0) headingMag += 360.0f;

    // 4. Complementary Filter Yaw Integration
    float gyroYawRate = m_data.gz * 180.0f / PI; // deg/s
    
    // Complementary coefficient (0.98 Gyro, 0.02 Magnetometer compass)
    float alpha = 0.98f;
    m_data.yaw = alpha * (m_data.yaw + gyroYawRate * dt) + (1.0f - alpha) * headingMag;

    // Keep heading in [0, 360) range
    if (m_data.yaw >= 360.0f) m_data.yaw -= 360.0f;
    if (m_data.yaw < 0.0f) m_data.yaw += 360.0f;
}

void ImuManager::classifyTerrain() {
    // Collision detection: Check total instantaneous acceleration magnitude
    float totalAccel = sqrt(m_data.ax * m_data.ax + m_data.ay * m_data.ay + m_data.az * m_data.az);
    if (totalAccel > SafetyConfig::SHOCK_THRESHOLD) {
        m_collisionWarning = true;
    } else {
        m_collisionWarning = false;
    }

    // Terrain classification using Z-axis acceleration variance
    m_accelZHistory[m_historyIndex] = m_data.az;
    m_historyIndex = (m_historyIndex + 1) % VARIANCE_WINDOW;

    // Calculate mean
    float sum = 0.0f;
    for (int i = 0; i < VARIANCE_WINDOW; i++) {
        sum += m_accelZHistory[i];
    }
    float mean = sum / VARIANCE_WINDOW;

    // Calculate variance
    float varianceSum = 0.0f;
    for (int i = 0; i < VARIANCE_WINDOW; i++) {
        float diff = m_accelZHistory[i] - mean;
        varianceSum += diff * diff;
    }
    m_terrainVariance = varianceSum / VARIANCE_WINDOW;
}
