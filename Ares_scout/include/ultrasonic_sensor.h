#ifndef ULTRASONIC_SENSOR_H
#define ULTRASONIC_SENSOR_H

#include <Arduino.h>
#include "config.h"

class UltrasonicSensor {
public:
    UltrasonicSensor();
    void begin();
    
    // Non-blocking trigger scheduler, filters data, computes stats (call in loop)
    void update();
    
    // Measurement accessors
    float getDistanceCm() const { return m_filteredDistance; }
    float getConfidenceScore() const { return m_confidence; }
    bool isHealthy() const { return m_healthy; }
    bool isDataValid() const { return m_dataValid; }

    // Interrupt handling helper
    static void handleEchoInterrupt();

private:
    float m_filteredDistance;
    float m_confidence;
    bool m_healthy;
    bool m_dataValid;
    unsigned long m_lastTriggerMs;
    unsigned long m_lastValidReadingMs;

    // Moving average filter definitions
    static const int FILTER_SIZE = 5;
    float m_history[FILTER_SIZE];
    int m_historyIndex;
    int m_validSampleCount;

    void triggerPulse();
    void processNewSample(float rawDistance);
};

#endif // ULTRASONIC_SENSOR_H
