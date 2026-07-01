#ifndef NAVIGATOR_H
#define NAVIGATOR_H

#include "config.h"
#include "motor_controller.h"
#include "imu_manager.h"
#include "ultrasonic_sensor.h"

class Navigator {
public:
    Navigator(MotorController* motor, ImuManager* imu, UltrasonicSensor* sonar);
    void begin();
    
    // Core loop: executes steering lock, checks sonar zones, handles avoidance routines.
    void update(RoverState& currentState);
    
    // Commands target steering angle
    void setTargetHeading(float heading);
    
    // Reset heading lock target to current yaw
    void lockCurrentHeading();

private:
    MotorController* m_motor;
    ImuManager* m_imu;
    UltrasonicSensor* m_sonar;

    float m_targetHeading;
    unsigned long m_stateTimerMs;
    
    // Scanning sub-states for the multi-stage sweep
    enum ScanStep {
        SCAN_STEP_INIT,
        SCAN_STEP_PIVOT_L30,
        SCAN_STEP_PIVOT_R30,
        SCAN_STEP_PIVOT_R90,
        SCAN_STEP_PIVOT_FINAL
    };
    ScanStep m_scanStep;
    float m_initialHeading;
    float m_distL30, m_distR30, m_distR90;
    float m_confL30, m_confR30, m_confR90;
    
    // Recovery sub-states
    enum RecoveryStep {
        REC_STEP_BACKING,
        REC_STEP_PIVOTING,
        REC_STEP_DONE
    };
    RecoveryStep m_recStep;

    void handleMovingForward(RoverState& currentState);
    void handleHeadingLock(RoverState& currentState);
    void handleScanning(RoverState& currentState);
    void handleTurning(RoverState& currentState);
    void handleRecovering(RoverState& currentState);
    
    // Utility navigation steering methods
    void driveWithHeadingLock();
    bool pivotToAngle(float targetAngle, float tolerance = 3.0f);
    float normalizeAngle(float angle);
};

#endif // NAVIGATOR_H
