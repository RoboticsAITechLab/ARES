#include "imu_driver.h"

ImuDriver::ImuDriver() 
    : m_mpu(nullptr), m_initialized(false), m_pitch(0.0f), m_roll(0.0f), m_yaw(0.0f),
      q0(1.0f), q1(0.0f), q2(0.0f), q3(0.0f), beta(0.1f) {}

void ImuDriver::begin() {
    int sdaPins[] = {21, 8, 18, 4};
    int sclPins[] = {22, 9, 19, 5};
    int numPairs = 4;
    
    int detectedSda = -1;
    int detectedScl = -1;
    uint8_t detectedAddr = 0;
    
    for (int i = 0; i < numPairs; i++) {
        int sda = sdaPins[i];
        int scl = sclPins[i];
        Serial.printf("[IMU] Scanning I2C bus on SDA=%d, SCL=%d...\n", sda, scl);
        
        Wire.begin(sda, scl);
        Wire.setClock(100000); // 100 kHz
        delay(50);
        
        for (uint8_t addr = 0x68; addr <= 0x69; addr++) {
            Wire.beginTransmission(addr);
            byte error = Wire.endTransmission();
            Serial.printf("  -> Addr 0x%02X returned error code: %d\n", addr, error);
            if (error == 0) {
                detectedSda = sda;
                detectedScl = scl;
                detectedAddr = addr;
                Serial.printf("[IMU] SUCCESS: Found device at address 0x%02X on SDA=%d, SCL=%d!\n", addr, sda, scl);
                break;
            }
        }
        if (detectedSda != -1) break;
    }
    
    if (detectedSda == -1) {
        Serial.println("[IMU] CRITICAL: MPU9250 sensor not detected on any standard I2C pin pair.");
        m_initialized = false;
        return;
    }
    
    // Re-initialize Wire on the correct pins
    Wire.begin(detectedSda, detectedScl);
    m_mpu = new MPU9250(Wire, detectedAddr);
    int status = m_mpu->begin();

    if (status < 0) {
        Serial.print("[IMU] MPU9250 initialization failed with code: ");
        Serial.println(status);
        m_initialized = false;
        return;
    }
    
    m_mpu->setAccelRange(MPU9250::ACCEL_RANGE_8G);
    m_mpu->setGyroRange(MPU9250::GYRO_RANGE_500DPS);
    m_mpu->setDlpfBandwidth(MPU9250::DLPF_BANDWIDTH_20HZ);
    m_mpu->setSrd(19); // 50 Hz updates

    Serial.println("[IMU] Calibrating Gyroscope and Accelerometer (Keep Rover Still)...");
    m_mpu->calibrateGyro();
    m_mpu->calibrateAccel();

    m_initialized = true;
    Serial.println("[IMU] MPU9250 Online & Calibrated with Madgwick Fusion.");
}

void ImuDriver::madgwickUpdate(float gx, float gy, float gz, float ax, float ay, float az, float dt) {
    float recipNorm;
    float s0, s1, s2, s3;
    float qDot1, qDot2, qDot3, qDot4;
    float _2q0, _2q1, _2q2, _2q3, _4q0, _4q1, _4q2, _8q1, _8q2, q0q0, q1q1, q2q2, q3q3;

    // Convert gyroscope readings to rad/s
    gx = gx * M_PI / 180.0f;
    gy = gy * M_PI / 180.0f;
    gz = gz * M_PI / 180.0f;

    // Rate of change of quaternion from gyroscope
    qDot1 = 0.5f * (-q1 * gx - q2 * gy - q3 * gz);
    qDot2 = 0.5f * (q0 * gx + q2 * gz - q3 * gy);
    qDot3 = 0.5f * (q0 * gy - q1 * gz + q3 * gx);
    qDot4 = 0.5f * (q0 * gz + q1 * gy - q2 * gx);

    if (!((ax == 0.0f) && (ay == 0.0f) && (az == 0.0f))) {
        // Normalise accelerometer measurement
        recipNorm = 1.0f / sqrt(ax * ax + ay * ay + az * az);
        ax *= recipNorm;
        ay *= recipNorm;
        az *= recipNorm;

        // Auxiliary variables
        _2q0 = 2.0f * q0;
        _2q1 = 2.0f * q1;
        _2q2 = 2.0f * q2;
        _2q3 = 2.0f * q3;
        _4q0 = 4.0f * q0;
        _4q1 = 4.0f * q1;
        _4q2 = 4.0f * q2;
        _8q1 = 8.0f * q1;
        _8q2 = 8.0f * q2;
        q0q0 = q0 * q0;
        q1q1 = q1 * q1;
        q2q2 = q2 * q2;
        q3q3 = q3 * q3;

        // Gradient decent algorithm corrective step
        s0 = _4q0 * q2q2 + _2q2 * ax + _4q0 * q1q1 - _2q1 * ay;
        s1 = _4q1 * q3q3 - _2q3 * ax + 4.0f * q0q0 * q1 - _2q0 * ay - _4q1 + _8q1 * q1q1 + _8q1 * q2q2 + _4q1 * ax;
        s2 = 4.0f * q0q0 * q2 + _2q0 * ax + _4q2 * q3q3 - _2q3 * ay - _4q2 + _8q2 * q1q1 + _8q2 * q2q2 + _4q2 * ay;
        s3 = 4.0f * q1q1 * q3 - _2q1 * ax + 4.0f * q2q2 * q3 - _2q2 * ay;
        
        // Normalise step magnitude
        recipNorm = 1.0f / sqrt(s0 * s0 + s1 * s1 + s2 * s2 + s3 * s3);
        s0 *= recipNorm;
        s1 *= recipNorm;
        s2 *= recipNorm;
        s3 *= recipNorm;

        // Apply feedback step
        qDot1 -= beta * s0;
        qDot2 -= beta * s1;
        qDot3 -= beta * s2;
        qDot4 -= beta * s3;
    }

    // Integrate rate of change of quaternion to yield quaternion
    q0 += qDot1 * dt;
    q1 += qDot2 * dt;
    q2 += qDot3 * dt;
    q3 += qDot4 * dt;

    // Normalise quaternion
    recipNorm = 1.0f / sqrt(q0 * q0 + q1 * q1 + q2 * q2 + q3 * q3);
    q0 *= recipNorm;
    q1 *= recipNorm;
    q2 *= recipNorm;
    q3 *= recipNorm;
}

void ImuDriver::update() {
    if (!m_initialized || !m_mpu) return;
    
    if (m_mpu->readSensor() < 0) {
        return;
    }
    
    float ax = m_mpu->getAccelX_mss();
    float ay = m_mpu->getAccelY_mss();
    float az = m_mpu->getAccelZ_mss();
    float gx = m_mpu->getGyroX_rads() * 180.0f / M_PI; // convert back to deg/s
    float gy = m_mpu->getGyroY_rads() * 180.0f / M_PI;
    float gz = m_mpu->getGyroZ_rads() * 180.0f / M_PI;

    static unsigned long lastUpdate = 0;
    unsigned long now = millis();
    if (lastUpdate == 0) {
        lastUpdate = now;
        return;
    }
    
    float dt = (now - lastUpdate) / 1000.0f;
    lastUpdate = now;
    if (dt <= 0.0f) dt = 0.001f;

    // Update Madgwick Filter representation
    madgwickUpdate(gx, gy, gz, ax, ay, az, dt);

    // Compute Euler angles from quaternion
    m_roll  = atan2(2.0f * (q0 * q1 + q2 * q3), 1.0f - 2.0f * (q1 * q1 + q2 * q2)) * 180.0f / M_PI;
    m_pitch = asin(2.0f * (q0 * q2 - q3 * q1)) * 180.0f / M_PI;
    m_yaw   = atan2(2.0f * (q0 * q3 + q1 * q2), 1.0f - 2.0f * (q2 * q2 + q3 * q3)) * 180.0f / M_PI;

    // Normalize heading to [0, 360] range
    if (m_yaw >= 360.0f) m_yaw -= 360.0f;
    if (m_yaw < 0.0f) m_yaw += 360.0f;
}
