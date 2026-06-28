#include "battery_monitor.h"

BatteryMonitor::BatteryMonitor() {}

void BatteryMonitor::begin() {
    // Configure pin mode as analog input
    pinMode(BatteryPins::ADC_PIN, INPUT);
    
    // Set attenuation to 11dB (allows reading up to ~3.1V - 3.3V)
    analogSetPinAttenuation(BatteryPins::ADC_PIN, ADC_11db);
}

float BatteryMonitor::readVoltage() {
    // Average multiple readings to reduce noise
    int rawSum = 0;
    const int numSamples = 16;
    for (int i = 0; i < numSamples; i++) {
        rawSum += analogRead(BatteryPins::ADC_PIN);
        delayMicroseconds(50);
    }
    float rawAverage = static_cast<float>(rawSum) / numSamples;
    
    // Convert raw ADC output to voltage on the GPIO pin
    float pinVoltage = (rawAverage * ADC_REF_V) / ADC_RESOLUTION;
    
    // Convert pin voltage back to original battery voltage using the resistor divider ratio
    // Vpin = Vbatt * (R2 / (R1 + R2))  ==>  Vbatt = Vpin * (R1 + R2) / R2
    float dividerRatio = (R1 + R2) / R2;
    float batteryVoltage = pinVoltage * dividerRatio * CALIBRATION_FACTOR;
    
    return batteryVoltage;
}

float BatteryMonitor::getPercentage() {
    float voltage = readVoltage();
    
    // Li-ion 4S typical voltage curves:
    // Fully charged: 16.8V (4.2V/cell)
    // Fully discharged: 12.0V (3.0V/cell)
    const float maxVoltage = 16.8f;
    const float minVoltage = 12.0f;
    
    if (voltage >= maxVoltage) return 100.0f;
    if (voltage <= minVoltage) return 0.0f;
    
    // Simple linear approximation of battery capacity from voltage
    float percentage = ((voltage - minVoltage) / (maxVoltage - minVoltage)) * 100.0f;
    return percentage;
}

bool BatteryMonitor::isLow() {
    return readVoltage() < LOW_VOLTAGE_THRESHOLD;
}
