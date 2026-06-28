#ifndef BATTERY_MONITOR_H
#define BATTERY_MONITOR_H

#include <Arduino.h>

namespace BatteryPins {
    const int ADC_PIN = 34; // Dedicated Analog ADC pin for battery level sensing
}

class BatteryMonitor {
public:
    BatteryMonitor();
    void begin();
    
    // Read raw ADC voltage and compute actual battery pack voltage
    float readVoltage();
    
    // Compute battery capacity percentage (approximate mapping for 4S Li-ion)
    float getPercentage();
    
    // Check if the battery is dangerously low (below threshold)
    bool isLow();

private:
    const float R1 = 100000.0f; // 100k Ohm resistor
    const float R2 = 10000.0f;  // 10k Ohm resistor
    const float ADC_REF_V = 3.3f; // ADC Reference Voltage
    const float ADC_RESOLUTION = 4095.0f; // 12-bit ADC (0 to 4095)
    
    // Calibration factor to adjust for resistor tolerances and ADC non-linearity
    const float CALIBRATION_FACTOR = 1.042f; 
    
    // Low voltage threshold for 4S (3.2V per cell * 4 cells = 12.8V)
    const float LOW_VOLTAGE_THRESHOLD = 12.8f;
};

#endif // BATTERY_MONITOR_H
