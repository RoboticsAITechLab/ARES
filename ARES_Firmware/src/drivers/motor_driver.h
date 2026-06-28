#ifndef MOTOR_DRIVER_H
#define MOTOR_DRIVER_H

#include <Arduino.h>

// GPIO Pin Definitions for 2x TB6612FNG drivers
namespace MotorPins {
    // Shared Standby Pin
    const int STBY = 33;

    // Driver 1 (Left Side)
    const int LF_PWM = 25; // PWMA
    const int LF_IN1 = 26; // AIN1
    const int LF_IN2 = 27; // AIN2

    const int LR_PWM = 14; // PWMB
    const int LR_IN1 = 12; // BIN1
    const int LR_IN2 = 13; // BIN2

    // Driver 2 (Right Side)
    const int RF_PWM = 18; // PWMA
    const int RF_IN1 = 19; // AIN1
    const int RF_IN2 = 23; // AIN2

    const int RR_PWM = 5;  // PWMB
    const int RR_IN1 = 16; // BIN1
    const int RR_IN2 = 17; // BIN2
}

// LEDC PWM Configuration
namespace PWMConfig {
    const int FREQ = 20000;      // 20 kHz frequency
    const int RESOLUTION = 10;   // 10-bit resolution (0 to 1023)
    
    // PWM Channel assignments (ESP32 LEDC)
    const int LF_CHANNEL = 0;
    const int LR_CHANNEL = 1;
    const int RF_CHANNEL = 2;
    const int RR_CHANNEL = 3;
}

class MotorDriver {
public:
    MotorDriver();
    void begin();
    
    // Set individual motor speeds (-1.0 to 1.0)
    void setSpeeds(float lfSpeed, float lrSpeed, float rfSpeed, float rrSpeed);
    
    // Stop all motors immediately (dynamic braking)
    void stopAll();
    
    // Put drivers in standby mode (disable H-bridges to save power)
    void setStandby(bool standby);

private:
    void writeMotor(int in1Pin, int in2Pin, int pwmChannel, float speed);
};

#endif // MOTOR_DRIVER_H
