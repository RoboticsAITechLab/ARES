#ifndef DIAGNOSTICS_H
#define DIAGNOSTICS_H

#include <Arduino.h>
#include "../drivers/motor_driver.h"
#include "../drivers/servo_driver.h"
#include "../drivers/imu_driver.h"
#include "../drivers/ultrasonic_driver.h"

struct SelfTestReport {
    bool motor;
    bool servo;
    bool imu;
    bool ultrasonic;
    bool camera;
    bool wifi;
    bool memory;
    String summary;
};

class Diagnostics {
public:
    static Diagnostics& getInstance();
    
    SelfTestReport runSelfTests(
        MotorDriver& motor,
        ServoDriver& servo,
        ImuDriver& imu,
        UltrasonicDriver& ultrasonic
    );

private:
    Diagnostics();
};

#endif // DIAGNOSTICS_H
