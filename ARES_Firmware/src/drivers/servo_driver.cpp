#include "servo_driver.h"

ServoDriver::ServoDriver(int servoPin)
    : m_servoPin(servoPin), m_angle(90) {}

void ServoDriver::begin() {
    ESP32PWM::allocateTimer(0);
    m_servo.setPeriodHertz(50);
    m_servo.attach(m_servoPin, 500, 2400);
    setAngle(90); // Center standard position
}

void ServoDriver::setAngle(int angle) {
    m_angle = constrain(angle, 0, 180);
    m_servo.write(m_angle);
}

void ServoDriver::deployScout() {
    setAngle(180);
    Serial.println("[Servo] Scout locking latch RELEASED (180 deg).");
}

void ServoDriver::retractScout() {
    setAngle(90);
    Serial.println("[Servo] Scout locking latch SECURED (90 deg).");
}
