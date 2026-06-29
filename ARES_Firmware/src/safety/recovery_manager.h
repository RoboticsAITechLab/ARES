#ifndef RECOVERY_MANAGER_H
#define RECOVERY_MANAGER_H

#include <Arduino.h>

class RecoveryManager {
public:
    static RecoveryManager& getInstance();

    void begin();
    void markBootClean();
    
    bool isSafeMode() const;
    String getBootReason() const;
    String getLastCrash() const;
    int getRollbackCount() const;
    void incrementRollbackCount();
    
    void setBootReason(const String& reason);
    void setLastCrash(const String& crash);

    void resetCrashCounter();
    void forceReboot();
    void factoryReset();

private:
    RecoveryManager();
    void checkCrashCounter();
    
    bool m_safeMode;
    String m_bootReason;
    String m_lastCrash;
    int m_rollbackCount;
};

#endif // RECOVERY_MANAGER_H
