#ifndef CONFIG_H
#define CONFIG_H

#include <Arduino.h>

// --- Pin Configurations ---

// TB6612FNG Motor Driver GPIO Pins
namespace MotorPins {
    const int PWMA = 25;
    const int AIN1 = 26;
    const int AIN2 = 27;
    const int STBY = 14;
    const int BIN1 = 13;
    const int BIN2 = 12;
    const int PWMB = 33;
}

// LEDC PWM Configurations (Core v2.x and v3.x compatible)
namespace PWMConfig {
    const int FREQ = 20000;          // 20 kHz
    const int RESOLUTION = 10;       // 10-bit (0-1023)
    const int CHANNEL_A = 0;
    const int CHANNEL_B = 1;
}

// MPU9250 I2C & Interrupt Pins
namespace ImuPins {
    const int SDA = 21;
    const int SCL = 22;
    const int INT = 4;
    const uint8_t ADDR = 0x68;
}

// HC-SR04 Ultrasonic Pins
namespace UltrasonicPins {
    const int TRIG = 18;
    const int ECHO = 19;
}

// --- ESP-NOW Comms Config ---
namespace CommsConfig {
    const uint8_t MOTHER_MAC[] = {0x3C, 0x61, 0x05, 0x0D, 0xCE, 0x90}; // Mother ESP32 MAC
    const uint8_t BROADCAST_MAC[] = {0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF};
}

// --- Navigation & Control Constants ---
namespace NavConfig {
    const float BASE_SPEED = 0.5f;          // Default base speed factor (0.0 to 1.0)
    const float KP_HEADING = 0.02f;         // Proportional steering gain
    const float RAMP_RATE = 0.05f;          // Speed ramp rate per control cycle
    const unsigned long NAV_PERIOD = 20;    // 20ms navigation update period (50Hz)
}

// --- Ultrasonic Safety Zones ---
namespace ObstacleConfig {
    const float ZONE_SAFE = 40.0f;          // > 40 cm
    const float ZONE_CAUTION = 20.0f;       // 20 to 40 cm
    const float ZONE_DANGER = 15.0f;        // < 15 cm (Emergency scan/turn trigger)
    const unsigned long TRIGGER_PERIOD = 60;// Trigger sonar measurement every 60ms
}

// --- Safety & Watchdog Thresholds ---
namespace SafetyConfig {
    const float ROLLOVER_THRESHOLD = 45.0f; // Roll or Pitch limit in degrees
    const float SHOCK_THRESHOLD = 24.5f;    // Shock limit in m/s^2 (~2.5 G)
    const float TERRAIN_VARIANCE_ROUGH = 0.5f; // Rough terrain classification limit
    const unsigned long WATCHDOG_TIMEOUT = 5000; // Watchdog feed threshold (5s)
}

// --- Telemetry Interval ---
const unsigned long TELEMETRY_PERIOD = 500; // 500ms

// --- Rover States ---
enum class RoverState {
    BOOT,
    CALIBRATION,
    IDLE,
    SCANNING,
    HEADING_LOCK,
    MOVING_FORWARD,
    AVOIDING_OBSTACLE,
    TURNING,
    RECOVERING,
    TERRAIN_ALERT,
    COLLISION_RECOVERY,
    SENSOR_FAILURE,
    EMERGENCY_STOP,
    DOCKED,
    READY_FOR_DEPLOYMENT,
    ACTIVE,
    LOST_LINK,
    OFFLINE
};

// Convert state enum to human readable string
inline String stateToString(RoverState state) {
    switch (state) {
        case RoverState::BOOT: return "BOOT";
        case RoverState::CALIBRATION: return "CALIBRATION";
        case RoverState::IDLE: return "IDLE";
        case RoverState::SCANNING: return "SCANNING";
        case RoverState::HEADING_LOCK: return "HEADING_LOCK";
        case RoverState::MOVING_FORWARD: return "MOVING_FORWARD";
        case RoverState::AVOIDING_OBSTACLE: return "AVOIDING_OBSTACLE";
        case RoverState::TURNING: return "TURNING";
        case RoverState::RECOVERING: return "RECOVERING";
        case RoverState::TERRAIN_ALERT: return "TERRAIN_ALERT";
        case RoverState::COLLISION_RECOVERY: return "COLLISION_RECOVERY";
        case RoverState::SENSOR_FAILURE: return "SENSOR_FAILURE";
        case RoverState::EMERGENCY_STOP: return "EMERGENCY_STOP";
        case RoverState::DOCKED: return "DOCKED";
        case RoverState::READY_FOR_DEPLOYMENT: return "READY_FOR_DEPLOYMENT";
        case RoverState::ACTIVE: return "ACTIVE";
        case RoverState::LOST_LINK: return "LOST_LINK";
        case RoverState::OFFLINE: return "OFFLINE";
        default: return "UNKNOWN";
    }
}

#endif // CONFIG_H
