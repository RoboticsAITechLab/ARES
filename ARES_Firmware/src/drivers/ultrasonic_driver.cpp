#include "ultrasonic_driver.h"

UltrasonicDriver::UltrasonicDriver(int trigPin, int echoPin)
    : m_trigPin(trigPin), m_echoPin(echoPin) {}

void UltrasonicDriver::begin() {
    pinMode(m_trigPin, OUTPUT);
    pinMode(m_echoPin, INPUT);
    digitalWrite(m_trigPin, LOW);
}

float UltrasonicDriver::readDistanceCm() {
    digitalWrite(m_trigPin, LOW);
    delayMicroseconds(2);
    
    // Issue trigger pulse
    digitalWrite(m_trigPin, HIGH);
    delayMicroseconds(10);
    digitalWrite(m_trigPin, LOW);
    
    // Wait for Echo pulse with 30ms safety timeout
    long duration = pulseIn(m_echoPin, HIGH, 30000);
    if (duration == 0) {
        return 999.0f; // Return out-of-range flag
    }
    
    // Convert duration to centimeters
    float distance = (static_cast<float>(duration) * 0.0343f) / 2.0f;
    return distance;
}
