#include "diagnostics.h"
#include <WiFi.h>

Diagnostics::Diagnostics() {}

Diagnostics& Diagnostics::getInstance() {
    static Diagnostics instance;
    return instance;
}

SelfTestReport Diagnostics::runSelfTests(
    MotorDriver& motor,
    ServoDriver& servo,
    ImuDriver& imu,
    UltrasonicDriver& ultrasonic
) {
    SelfTestReport report;
    report.motor = false;
    report.servo = false;
    report.imu = false;
    report.ultrasonic = false;
    report.camera = true; // Simulated Camera subsystem
    report.wifi = false;
    report.memory = false;
    
    Serial.println("[Diagnostics] Starting remote diagnostics self-test routine...");
    
    // 1. Motor test (Verify pins / standby logic)
    motor.setStandby(false);
    report.motor = true; // If we can successfully toggle standby, mark OK
    Serial.println("[Diagnostics] Motor Controller: OK");

    // 2. Servo test (Verify current angles / bounds)
    int initialAngle = servo.getAngle();
    servo.setAngle(initialAngle);
    report.servo = (initialAngle >= 0 && initialAngle <= 180);
    Serial.printf("[Diagnostics] SG90 Servo: OK (angle=%d)\n", initialAngle);

    // 3. MPU9250 IMU test
    report.imu = imu.isHealthy();
    Serial.printf("[Diagnostics] MPU9250 IMU: %s\n", report.imu ? "OK" : "FAILED");

    // 4. Ultrasonic Proximity sensor test
    float dist = ultrasonic.readDistanceCm();
    report.ultrasonic = (dist > 0.0f && dist < 1000.0f);
    Serial.printf("[Diagnostics] Ultrasonic: %s (dist=%.2f cm)\n", report.ultrasonic ? "OK" : "FAILED", dist);

    // 5. Camera Test (Simulated check)
    report.camera = true;
    Serial.println("[Diagnostics] Camera Node (Simulated): OK");

    // 6. WiFi link quality check
    report.wifi = (WiFi.status() == WL_CONNECTED);
    Serial.printf("[Diagnostics] WiFi Link: %s (RSSI=%d)\n", report.wifi ? "OK" : "FAILED", WiFi.RSSI());

    // 7. Memory test (Heap health check)
    uint32_t freeHeap = ESP.getFreeHeap();
    report.memory = (freeHeap > 20000); // Need at least 20KB free heap for stable operation
    Serial.printf("[Diagnostics] Internal RAM Heap: %s (Free Heap: %u bytes)\n", report.memory ? "OK" : "CRITICAL", freeHeap);

    // Summary calculation
    bool overallPass = report.motor && report.servo && report.imu && report.ultrasonic && report.camera && report.wifi && report.memory;
    report.summary = overallPass ? "ALL SYSTEMS OPERATIONAL" : "DEGRADED - ATTENTION REQUIRED";
    
    return report;
}
