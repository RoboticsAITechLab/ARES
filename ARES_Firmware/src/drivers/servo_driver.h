#ifndef SERVO_DRIVER_H
#define SERVO_DRIVER_H

#include <Arduino.h>
#include <ESP32Servo.h>

class ServoDriver {
public:
    ServoDriver(int servoPin = 4);
    void begin();
    
    void setAngle(int angle);
    int getAngle() const { return m_angle; }
    
    void deployScout();
    void retractScout();

private:
    int m_servoPin;
    int m_angle;
    Servo m_servo;
};

#endif // SERVO_DRIVER_H
