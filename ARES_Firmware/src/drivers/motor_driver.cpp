#include "motor_driver.h"

MotorDriver::MotorDriver() {}

void MotorDriver::begin() {
    // Set standby pin as output
    pinMode(MotorPins::STBY, OUTPUT);
    digitalWrite(MotorPins::STBY, LOW); // Keep in standby during init

    // Configure GPIO direction control pins as outputs
    pinMode(MotorPins::LF_IN1, OUTPUT);
    pinMode(MotorPins::LF_IN2, OUTPUT);
    pinMode(MotorPins::LR_IN1, OUTPUT);
    pinMode(MotorPins::LR_IN2, OUTPUT);

    pinMode(MotorPins::RF_IN1, OUTPUT);
    pinMode(MotorPins::RF_IN2, OUTPUT);
    pinMode(MotorPins::RR_IN1, OUTPUT);
    pinMode(MotorPins::RR_IN2, OUTPUT);

    // Setup LEDC PWM channels
    ledcSetup(PWMConfig::LF_CHANNEL, PWMConfig::FREQ, PWMConfig::RESOLUTION);
    ledcAttachPin(MotorPins::LF_PWM, PWMConfig::LF_CHANNEL);

    ledcSetup(PWMConfig::LR_CHANNEL, PWMConfig::FREQ, PWMConfig::RESOLUTION);
    ledcAttachPin(MotorPins::LR_PWM, PWMConfig::LR_CHANNEL);

    ledcSetup(PWMConfig::RF_CHANNEL, PWMConfig::FREQ, PWMConfig::RESOLUTION);
    ledcAttachPin(MotorPins::RF_PWM, PWMConfig::RF_CHANNEL);

    ledcSetup(PWMConfig::RR_CHANNEL, PWMConfig::FREQ, PWMConfig::RESOLUTION);
    ledcAttachPin(MotorPins::RR_PWM, PWMConfig::RR_CHANNEL);

    // Reset speeds to 0
    stopAll();

    // Enable H-bridges by pulling standby HIGH
    setStandby(false);
}

void MotorDriver::setSpeeds(float lfSpeed, float lrSpeed, float rfSpeed, float rrSpeed) {
    writeMotor(MotorPins::LF_IN1, MotorPins::LF_IN2, PWMConfig::LF_CHANNEL, lfSpeed);
    writeMotor(MotorPins::LR_IN1, MotorPins::LR_IN2, PWMConfig::LR_CHANNEL, lrSpeed);
    writeMotor(MotorPins::RF_IN1, MotorPins::RF_IN2, PWMConfig::RF_CHANNEL, rfSpeed);
    writeMotor(MotorPins::RR_IN1, MotorPins::RR_IN2, PWMConfig::RR_CHANNEL, rrSpeed);
}

void MotorDriver::stopAll() {
    // Dynamic braking: IN1=HIGH, IN2=HIGH (or IN1=LOW, IN2=LOW depending on decay, TB6612 does short brake when both IN1 & IN2 are HIGH)
    digitalWrite(MotorPins::LF_IN1, HIGH);
    digitalWrite(MotorPins::LF_IN2, HIGH);
    ledcWrite(PWMConfig::LF_CHANNEL, 0);

    digitalWrite(MotorPins::LR_IN1, HIGH);
    digitalWrite(MotorPins::LR_IN2, HIGH);
    ledcWrite(PWMConfig::LR_CHANNEL, 0);

    digitalWrite(MotorPins::RF_IN1, HIGH);
    digitalWrite(MotorPins::RF_IN2, HIGH);
    ledcWrite(PWMConfig::RF_CHANNEL, 0);

    digitalWrite(MotorPins::RR_IN1, HIGH);
    digitalWrite(MotorPins::RR_IN2, HIGH);
    ledcWrite(PWMConfig::RR_CHANNEL, 0);
}

void MotorDriver::setStandby(bool standby) {
    // STBY Pin: LOW = Standby (all motors off), HIGH = Active
    digitalWrite(MotorPins::STBY, standby ? LOW : HIGH);
}

void MotorDriver::writeMotor(int in1Pin, int in2Pin, int pwmChannel, float speed) {
    // Constrain speed to [-1.0, 1.0]
    speed = constrain(speed, -1.0f, 1.0f);

    // Determine direction
    if (speed > 0.01f) {
        // Forward direction
        digitalWrite(in1Pin, HIGH);
        digitalWrite(in2Pin, LOW);
    } else if (speed < -0.01f) {
        // Reverse direction
        digitalWrite(in1Pin, LOW);
        digitalWrite(in2Pin, HIGH);
    } else {
        // Short brake / Stop
        digitalWrite(in1Pin, HIGH);
        digitalWrite(in2Pin, HIGH);
        ledcWrite(pwmChannel, 0);
        return;
    }

    // Calculate duty cycle: 10-bit resolution -> max value is 1023
    int dutyCycle = static_cast<int>(fabs(speed) * 1023.0f);
    ledcWrite(pwmChannel, dutyCycle);
}
