#include "kinematics.h"

Kinematics::Kinematics() {}

WheelSpeeds Kinematics::resolve(float linearVelocity, float angularVelocity) {
    // Basic skid-steering kinematics:
    // Left-side wheels spin at (Linear - Angular)
    // Right-side wheels spin at (Linear + Angular)
    float leftTarget = linearVelocity - angularVelocity;
    float rightTarget = linearVelocity + angularVelocity;

    // Saturation resolver: if either wheel speed exceeds the physical maximum (1.0),
    // proportionally scale down both speeds to maintain the intended turning ratio.
    float maxMagnitude = max(fabs(leftTarget), fabs(rightTarget));
    if (maxMagnitude > 1.0f) {
        leftTarget /= maxMagnitude;
        rightTarget /= maxMagnitude;
    }

    // Return individual wheel speeds
    WheelSpeeds speeds;
    speeds.lf = leftTarget;
    speeds.lr = leftTarget;
    speeds.rf = rightTarget;
    speeds.rr = rightTarget;

    return speeds;
}
