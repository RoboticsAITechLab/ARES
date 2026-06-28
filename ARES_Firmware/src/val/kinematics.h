#ifndef KINEMATICS_H
#define KINEMATICS_H

#include <Arduino.h>

struct WheelSpeeds {
    float lf; // Left-Front speed (-1.0 to 1.0)
    float lr; // Left-Rear speed (-1.0 to 1.0)
    float rf; // Right-Front speed (-1.0 to 1.0)
    float rr; // Right-Rear speed (-1.0 to 1.0)
};

class Kinematics {
public:
    Kinematics();
    
    // Convert linear (x) and angular (z) command inputs to 4 wheel speeds
    WheelSpeeds resolve(float linearVelocity, float angularVelocity);
};

#endif // KINEMATICS_H
