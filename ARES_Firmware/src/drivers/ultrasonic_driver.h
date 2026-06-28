#ifndef ULTRASONIC_DRIVER_H
#define ULTRASONIC_DRIVER_H

#include <Arduino.h>

class UltrasonicDriver {
public:
    UltrasonicDriver(int trigPin = 5, int echoPin = 12);
    void begin();
    
    // Read obstacle distance in centimeters
    float readDistanceCm();

private:
    int m_trigPin;
    int m_echoPin;
};

#endif // ULTRASONIC_DRIVER_H
