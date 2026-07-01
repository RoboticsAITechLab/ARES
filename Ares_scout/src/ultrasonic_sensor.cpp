#include "ultrasonic_sensor.h"

// Global volatile variables for interrupt tracking
volatile unsigned long g_pulseStartMicros = 0;
volatile unsigned long g_pulseEndMicros = 0;
volatile bool g_pulseReady = false;

// Edge-triggered Echo Pin Interrupt Handler
void IRAM_ATTR echoISR() {
    if (digitalRead(UltrasonicPins::ECHO) == HIGH) {
        g_pulseStartMicros = micros();
    } else {
        g_pulseEndMicros = micros();
        g_pulseReady = true;
    }
}

UltrasonicSensor::UltrasonicSensor()
    : m_filteredDistance(999.0f), m_confidence(0.0f), m_healthy(true),
      m_dataValid(false), m_lastTriggerMs(0), m_lastValidReadingMs(0),
      m_historyIndex(0), m_validSampleCount(0) {
    for (int i = 0; i < FILTER_SIZE; i++) {
        m_history[i] = 999.0f;
    }
}

void UltrasonicSensor::begin() {
    pinMode(UltrasonicPins::TRIG, OUTPUT);
    pinMode(UltrasonicPins::ECHO, INPUT);
    
    digitalWrite(UltrasonicPins::TRIG, LOW);

    // Attach echo ISR for CHANGE transitions
    attachInterrupt(digitalPinToInterrupt(UltrasonicPins::ECHO), echoISR, CHANGE);

    m_lastTriggerMs = millis();
    m_lastValidReadingMs = millis();
}

void UltrasonicSensor::update() {
    unsigned long now = millis();

    // 1. Trigger next pulse periodically
    if (now - m_lastTriggerMs >= ObstacleConfig::TRIGGER_PERIOD) {
        triggerPulse();
        m_lastTriggerMs = now;
    }

    // 2. Check for new interrupt samples
    if (g_pulseReady) {
        // Capture volatile values atomically
        noInterrupts();
        unsigned long start = g_pulseStartMicros;
        unsigned long end = g_pulseEndMicros;
        g_pulseReady = false;
        interrupts();

        if (end > start) {
            unsigned long duration = end - start;
            // Convert to Cm: distance = (duration * 0.0343) / 2
            float rawDistance = (static_cast<float>(duration) * 0.0343f) / 2.0f;
            
            // Validate realistic physical constraints (2cm to 400cm)
            if (rawDistance >= 2.0f && rawDistance <= 400.0f) {
                processNewSample(rawDistance);
                m_lastValidReadingMs = now;
                m_healthy = true;
            }
        }
    }

    // 3. Sensor timeout/failure checks (no echo received in 2 seconds)
    if (now - m_lastValidReadingMs > 2000) {
        m_healthy = false;
        m_filteredDistance = 999.0f;
        m_confidence = 0.0f;
        m_dataValid = false;
    }
}

void UltrasonicSensor::triggerPulse() {
    digitalWrite(UltrasonicPins::TRIG, LOW);
    delayMicroseconds(2);
    digitalWrite(UltrasonicPins::TRIG, HIGH);
    delayMicroseconds(10);
    digitalWrite(UltrasonicPins::TRIG, LOW);
}

void UltrasonicSensor::processNewSample(float rawDistance) {
    m_history[m_historyIndex] = rawDistance;
    m_historyIndex = (m_historyIndex + 1) % FILTER_SIZE;
    if (m_validSampleCount < FILTER_SIZE) m_validSampleCount++;

    // Calculate average and reject outliers
    float sum = 0.0f;
    int count = 0;
    for (int i = 0; i < m_validSampleCount; i++) {
        sum += m_history[i];
        count++;
    }

    m_filteredDistance = sum / count;
    m_dataValid = true;

    // Confidence score based on variance of readings
    float varianceSum = 0.0f;
    for (int i = 0; i < m_validSampleCount; i++) {
        float diff = m_history[i] - m_filteredDistance;
        varianceSum += diff * diff;
    }
    float variance = varianceSum / m_validSampleCount;

    // Normalizing confidence score between 0.0 and 1.0 (lower variance = higher confidence)
    if (variance < 1.0f) {
        m_confidence = 1.0f;
    } else if (variance > 25.0f) {
        m_confidence = 0.2f;
    } else {
        m_confidence = 1.0f - (variance / 30.0f);
    }
}
