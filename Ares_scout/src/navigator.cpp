#include "navigator.h"

Navigator::Navigator(MotorController* motor, ImuManager* imu, UltrasonicSensor* sonar)
    : m_motor(motor), m_imu(imu), m_sonar(sonar),
      m_targetHeading(0.0f), m_stateTimerMs(0),
      m_scanStep(SCAN_STEP_INIT), m_initialHeading(0.0f),
      m_distL30(0.0f), m_distR30(0.0f), m_distR90(0.0f),
      m_confL30(0.0f), m_confR30(0.0f), m_confR90(0.0f),
      m_recStep(REC_STEP_BACKING) {}

void Navigator::begin() {
    lockCurrentHeading();
}

void Navigator::setTargetHeading(float heading) {
    m_targetHeading = normalizeAngle(heading);
}

void Navigator::lockCurrentHeading() {
    if (m_imu->isHealthy()) {
        m_targetHeading = m_imu->getData().yaw;
    } else {
        m_targetHeading = 0.0f;
    }
}

void Navigator::update(RoverState& currentState) {
    // 1. Terrain roughness adjustments
    float speedMultiplier = 1.0f;
    if (currentState == RoverState::TERRAIN_ALERT) {
        speedMultiplier = 0.5f; // Halve speed on rough terrain
    }

    // 2. State execution router
    switch (currentState) {
        case RoverState::MOVING_FORWARD:
            handleMovingForward(currentState);
            break;

        case RoverState::HEADING_LOCK:
            handleHeadingLock(currentState);
            break;

        case RoverState::AVOIDING_OBSTACLE:
            // Brake and transition to scanning
            m_motor->setTargetSpeeds(0.0f, 0.0f);
            m_scanStep = SCAN_STEP_INIT;
            currentState = RoverState::SCANNING;
            m_stateTimerMs = millis();
            Serial.println("[Nav] Transitioned to SCANNING. Commencing sweep.");
            break;

        case RoverState::SCANNING:
            handleScanning(currentState);
            break;

        case RoverState::TURNING:
            handleTurning(currentState);
            break;

        case RoverState::RECOVERING:
        case RoverState::COLLISION_RECOVERY:
            handleRecovering(currentState);
            break;

        default:
            // Idle or Safety stop: make sure motors are stopped
            m_motor->setTargetSpeeds(0.0f, 0.0f);
            break;
    }
}

void Navigator::handleMovingForward(RoverState& currentState) {
    // Check safety zones first
    float distance = m_sonar->getDistanceCm();
    if (m_sonar->isDataValid() && distance < ObstacleConfig::ZONE_DANGER) {
        currentState = RoverState::AVOIDING_OBSTACLE;
        return;
    }

    if (m_sonar->isDataValid() && distance >= ObstacleConfig::ZONE_DANGER && distance < ObstacleConfig::ZONE_CAUTION) {
        // Slow down and steer slightly away, or immediately lock heading
        currentState = RoverState::HEADING_LOCK;
        return;
    }

    // Default forward
    m_motor->setTargetSpeeds(NavConfig::BASE_SPEED, NavConfig::BASE_SPEED);
}

void Navigator::handleHeadingLock(RoverState& currentState) {
    float distance = m_sonar->getDistanceCm();
    if (m_sonar->isDataValid() && distance < ObstacleConfig::ZONE_DANGER) {
        currentState = RoverState::AVOIDING_OBSTACLE;
        return;
    }

    driveWithHeadingLock();
}

void Navigator::handleScanning(RoverState& currentState) {
    m_motor->setStandby(false);
    
    switch (m_scanStep) {
        case SCAN_STEP_INIT:
            m_initialHeading = m_imu->getData().yaw;
            m_scanStep = SCAN_STEP_PIVOT_L30;
            m_stateTimerMs = millis();
            Serial.println("[Nav] Scan: Pivoting left 30 degrees...");
            break;

        case SCAN_STEP_PIVOT_L30: {
            float target = normalizeAngle(m_initialHeading - 30.0f);
            if (pivotToAngle(target)) {
                if (millis() - m_stateTimerMs > 400) { // Wait for sonar settling
                    m_distL30 = m_sonar->getDistanceCm();
                    m_confL30 = m_sonar->getConfidenceScore();
                    m_scanStep = SCAN_STEP_PIVOT_R30;
                    m_stateTimerMs = millis();
                    Serial.printf("[Nav] Scan L30 distance: %.2f cm (Confidence: %.2f). Pivoting to R30...\n", m_distL30, m_confL30);
                }
            } else {
                m_stateTimerMs = millis(); // Reset stabilizer timer while turning
            }
            break;
        }

        case SCAN_STEP_PIVOT_R30: {
            float target = normalizeAngle(m_initialHeading + 30.0f);
            if (pivotToAngle(target)) {
                if (millis() - m_stateTimerMs > 400) {
                    m_distR30 = m_sonar->getDistanceCm();
                    m_confR30 = m_sonar->getConfidenceScore();
                    m_scanStep = SCAN_STEP_PIVOT_R90;
                    m_stateTimerMs = millis();
                    Serial.printf("[Nav] Scan R30 distance: %.2f cm (Confidence: %.2f). Pivoting to R90...\n", m_distR30, m_confR30);
                }
            } else {
                m_stateTimerMs = millis();
            }
            break;
        }

        case SCAN_STEP_PIVOT_R90: {
            float target = normalizeAngle(m_initialHeading + 90.0f);
            if (pivotToAngle(target)) {
                if (millis() - m_stateTimerMs > 400) {
                    m_distR90 = m_sonar->getDistanceCm();
                    m_confR90 = m_sonar->getConfidenceScore();
                    
                    // Evaluate choices
                    Serial.printf("[Nav] Scan R90 distance: %.2f cm (Confidence: %.2f). Evaluating safest direction...\n", m_distR90, m_confR90);
                    
                    float bestDist = -1.0f;
                    float selectedHeading = m_initialHeading;

                    // Evaluate Left 30
                    if (m_distL30 > 25.0f && m_confL30 > 0.5f && m_distL30 > bestDist) {
                        bestDist = m_distL30;
                        selectedHeading = normalizeAngle(m_initialHeading - 30.0f);
                    }
                    // Evaluate Right 30
                    if (m_distR30 > 25.0f && m_confR30 > 0.5f && m_distR30 > bestDist) {
                        bestDist = m_distR30;
                        selectedHeading = normalizeAngle(m_initialHeading + 30.0f);
                    }
                    // Evaluate Right 90
                    if (m_distR90 > 25.0f && m_confR90 > 0.5f && m_distR90 > bestDist) {
                        bestDist = m_distR90;
                        selectedHeading = normalizeAngle(m_initialHeading + 90.0f);
                    }

                    if (bestDist < 25.0f) {
                        // All sweeps blocked. Trigger collision/stall recovery.
                        Serial.println("[Nav] All sweeps blocked! Initiating RECOVERING sequence.");
                        currentState = RoverState::RECOVERING;
                        m_recStep = REC_STEP_BACKING;
                        m_stateTimerMs = millis();
                    } else {
                        m_targetHeading = selectedHeading;
                        m_scanStep = SCAN_STEP_PIVOT_FINAL;
                        m_stateTimerMs = millis();
                        Serial.printf("[Nav] Selected target heading: %.2f (Path distance: %.2f cm)\n", m_targetHeading, bestDist);
                    }
                }
            } else {
                m_stateTimerMs = millis();
            }
            break;
        }

        case SCAN_STEP_PIVOT_FINAL:
            if (pivotToAngle(m_targetHeading)) {
                Serial.println("[Nav] Sweep navigation correction complete.");
                currentState = RoverState::HEADING_LOCK;
            }
            break;
    }
}

void Navigator::handleTurning(RoverState& currentState) {
    if (pivotToAngle(m_targetHeading)) {
        currentState = RoverState::HEADING_LOCK;
    }
}

void Navigator::handleRecovering(RoverState& currentState) {
    unsigned long now = millis();
    m_motor->setStandby(false);

    switch (m_recStep) {
        case REC_STEP_BACKING:
            // Reverse straight back slowly
            m_motor->setTargetSpeeds(-0.4f, -0.4f);
            if (now - m_stateTimerMs > 1500) { // Back up for 1.5s
                m_motor->setTargetSpeeds(0.0f, 0.0f);
                m_recStep = REC_STEP_PIVOTING;
                m_stateTimerMs = now;
                // Plan to pivot 90 degrees left
                m_targetHeading = normalizeAngle(m_imu->getData().yaw - 90.0f);
                Serial.println("[Nav] Recovery: Backing done. Pivoting 90 deg left...");
            }
            break;

        case REC_STEP_PIVOTING:
            if (pivotToAngle(m_targetHeading)) {
                m_recStep = REC_STEP_DONE;
                m_stateTimerMs = now;
                Serial.println("[Nav] Recovery: Pivot done.");
            }
            break;

        case REC_STEP_DONE:
            m_motor->setTargetSpeeds(0.0f, 0.0f);
            lockCurrentHeading();
            currentState = RoverState::HEADING_LOCK;
            break;
    }
}

void Navigator::driveWithHeadingLock() {
    float currentYaw = m_imu->getData().yaw;
    float error = m_targetHeading - currentYaw;

    // Wrap error to [-180, 180]
    if (error > 180.0f) error -= 360.0f;
    if (error < -180.0f) error += 360.0f;

    float correction = NavConfig::KP_HEADING * error;
    correction = constrain(correction, -0.3f, 0.3f); // limit correction steer power

    float leftSpeed = NavConfig::BASE_SPEED + correction;
    float rightSpeed = NavConfig::BASE_SPEED - correction;

    m_motor->setTargetSpeeds(leftSpeed, rightSpeed);
}

bool Navigator::pivotToAngle(float targetAngle, float tolerance) {
    float currentYaw = m_imu->getData().yaw;
    float error = targetAngle - currentYaw;

    // Wrap error to [-180, 180]
    if (error > 180.0f) error -= 360.0f;
    if (error < -180.0f) error += 360.0f;

    if (fabs(error) < tolerance) {
        m_motor->setTargetSpeeds(0.0f, 0.0f);
        return true; // Target reached
    }

    // Proportional turning speed
    float steerSpeed = (error > 0.0f) ? 0.35f : -0.35f;
    m_motor->setTargetSpeeds(steerSpeed, -steerSpeed);
    return false;
}

float Navigator::normalizeAngle(float angle) {
    while (angle >= 360.0f) angle -= 360.0f;
    while (angle < 0.0f) angle += 360.0f;
    return angle;
}
