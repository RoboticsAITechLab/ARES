#ifndef MOTOR_CONTROLLER_H
#define MOTOR_CONTROLLER_H

#include "config.h"

class MotorController {
public:
    MotorController();
    void begin();
    
    // Set target speeds for differential drive (-1.0 to 1.0)
    void setTargetSpeeds(float left, float right);
    
    // Directly set target speed to zero and instantly apply dynamic braking
    void emergencyStop();
    
    // Enable/disable the TB6612FNG standby pin (active low standby)
    void setStandby(bool standby);
    
    // Non-blocking update cycle for speed ramping (should be called in loop)
    void update();
    
    // Getters for telemetry
    float getLeftTarget() const { return m_leftTarget; }
    float getRightTarget() const { return m_rightTarget; }
    float getLeftCurrent() const { return m_leftCurrent; }
    float getRightCurrent() const { return m_rightCurrent; }
    bool isStandby() const { return m_standbyActive; }

private:
    float m_leftTarget;
    float m_rightTarget;
    float m_leftCurrent;
    float m_rightCurrent;
    bool m_standbyActive;
    unsigned long m_lastUpdateMs;

    void applySpeeds(float left, float right);
    void writeMotor(int in1Pin, int in2Pin, int pwmChannel, float speed);
};

#endif // MOTOR_CONTROLLER_H
