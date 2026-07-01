#include "motor_controller.h"

MotorController::MotorController()
    : m_leftTarget(0.0f), m_rightTarget(0.0f),
      m_leftCurrent(0.0f), m_rightCurrent(0.0f),
      m_standbyActive(true), m_lastUpdateMs(0) {}

void MotorController::begin() {
    // Pin setup
    pinMode(MotorPins::STBY, OUTPUT);
    pinMode(MotorPins::AIN1, OUTPUT);
    pinMode(MotorPins::AIN2, OUTPUT);
    pinMode(MotorPins::BIN1, OUTPUT);
    pinMode(MotorPins::BIN2, OUTPUT);

    // Initial state: Standby active (disabled H-bridges)
    digitalWrite(MotorPins::STBY, LOW);

    // Setup LEDC channels
    ledcSetup(PWMConfig::CHANNEL_A, PWMConfig::FREQ, PWMConfig::RESOLUTION);
    ledcAttachPin(MotorPins::PWMA, PWMConfig::CHANNEL_A);

    ledcSetup(PWMConfig::CHANNEL_B, PWMConfig::FREQ, PWMConfig::RESOLUTION);
    ledcAttachPin(MotorPins::PWMB, PWMConfig::CHANNEL_B);

    // Short brake state by default
    digitalWrite(MotorPins::AIN1, HIGH);
    digitalWrite(MotorPins::AIN2, HIGH);
    digitalWrite(MotorPins::BIN1, HIGH);
    digitalWrite(MotorPins::BIN2, HIGH);
    ledcWrite(PWMConfig::CHANNEL_A, 0);
    ledcWrite(PWMConfig::CHANNEL_B, 0);

    m_lastUpdateMs = millis();
}

void MotorController::setTargetSpeeds(float left, float right) {
    m_leftTarget = constrain(left, -1.0f, 1.0f);
    m_rightTarget = constrain(right, -1.0f, 1.0f);
}

void MotorController::emergencyStop() {
    m_leftTarget = 0.0f;
    m_rightTarget = 0.0f;
    m_leftCurrent = 0.0f;
    m_rightCurrent = 0.0f;
    
    // Apply immediate hard brake
    digitalWrite(MotorPins::AIN1, HIGH);
    digitalWrite(MotorPins::AIN2, HIGH);
    digitalWrite(MotorPins::BIN1, HIGH);
    digitalWrite(MotorPins::BIN2, HIGH);
    ledcWrite(PWMConfig::CHANNEL_A, 0);
    ledcWrite(PWMConfig::CHANNEL_B, 0);
    
    // Force standby
    setStandby(true);
}

void MotorController::setStandby(bool standby) {
    m_standbyActive = standby;
    digitalWrite(MotorPins::STBY, standby ? LOW : HIGH);
}

void MotorController::update() {
    unsigned long now = millis();
    unsigned long dt = now - m_lastUpdateMs;
    if (dt < 10) return; // Limit ramp updates to 100Hz
    m_lastUpdateMs = now;

    if (m_standbyActive) {
        m_leftCurrent = 0.0f;
        m_rightCurrent = 0.0f;
        return;
    }

    // Smooth speed ramping
    float deltaLeft = m_leftTarget - m_leftCurrent;
    if (fabs(deltaLeft) < NavConfig::RAMP_RATE) {
        m_leftCurrent = m_leftTarget;
    } else {
        m_leftCurrent += (deltaLeft > 0) ? NavConfig::RAMP_RATE : -NavConfig::RAMP_RATE;
    }

    float deltaRight = m_rightTarget - m_rightCurrent;
    if (fabs(deltaRight) < NavConfig::RAMP_RATE) {
        m_rightCurrent = m_rightTarget;
    } else {
        m_rightCurrent += (deltaRight > 0) ? NavConfig::RAMP_RATE : -NavConfig::RAMP_RATE;
    }

    applySpeeds(m_leftCurrent, m_rightCurrent);
}

void MotorController::applySpeeds(float left, float right) {
    writeMotor(MotorPins::AIN1, MotorPins::AIN2, PWMConfig::CHANNEL_A, left);
    writeMotor(MotorPins::BIN1, MotorPins::BIN2, PWMConfig::CHANNEL_B, right);
}

void MotorController::writeMotor(int in1Pin, int in2Pin, int pwmChannel, float speed) {
    // 0.01 threshold to avoid jitter around 0
    if (fabs(speed) < 0.01f) {
        digitalWrite(in1Pin, HIGH);
        digitalWrite(in2Pin, HIGH);
        ledcWrite(pwmChannel, 0);
    } else if (speed > 0.0f) {
        digitalWrite(in1Pin, HIGH);
        digitalWrite(in2Pin, LOW);
        int duty = static_cast<int>(speed * 1023.0f);
        ledcWrite(pwmChannel, duty);
    } else {
        digitalWrite(in1Pin, LOW);
        digitalWrite(in2Pin, HIGH);
        int duty = static_cast<int>(-speed * 1023.0f);
        ledcWrite(pwmChannel, duty);
    }
}
