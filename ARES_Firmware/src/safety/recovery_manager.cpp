#include "recovery_manager.h"
#include <Preferences.h>
#include <rom/rtc.h>

RTC_DATA_ATTR int rtc_crash_count = 0;
RTC_DATA_ATTR bool rtc_clean_boot = false;

RecoveryManager::RecoveryManager() : m_safeMode(false), m_rollbackCount(0) {}

RecoveryManager& RecoveryManager::getInstance() {
    static RecoveryManager instance;
    return instance;
}

void RecoveryManager::begin() {
    Preferences prefs;
    prefs.begin("ares_recovery", false);
    m_rollbackCount = prefs.getInt("rollback_cnt", 0);
    m_lastCrash = prefs.getString("last_crash", "None");
    m_bootReason = prefs.getString("boot_reason", "poweron");
    prefs.end();

    // Check reset reason
    esp_reset_reason_t reason = esp_reset_reason();
    switch (reason) {
        case ESP_RST_POWERON:
            m_bootReason = "poweron";
            break;
        case ESP_RST_SW:
            // Could be normal software reset or OTA reboot
            break;
        case ESP_RST_PANIC:
            m_bootReason = "watchdog";
            m_lastCrash = "CPU Panic/Core dump";
            break;
        case ESP_RST_INT_WDT:
        case ESP_RST_TASK_WDT:
        case ESP_RST_WDT:
            m_bootReason = "watchdog";
            m_lastCrash = "Watchdog Timer Exceeded";
            break;
        case ESP_RST_BROWNOUT:
            m_bootReason = "brownout";
            break;
        case ESP_RST_DEEPSLEEP:
            m_bootReason = "deep_sleep";
            break;
        default:
            m_bootReason = "poweron";
            break;
    }

    checkCrashCounter();
}

void RecoveryManager::checkCrashCounter() {
    if (!rtc_clean_boot) {
        rtc_crash_count++;
        Serial.printf("[Recovery] App did not shutdown cleanly last time. Crash Count: %d/3\n", rtc_crash_count);
    } else {
        rtc_clean_boot = false; // Reset clean flag for current run
    }

    if (rtc_crash_count >= 3) {
        m_safeMode = true;
        m_lastCrash = "Repeated Boot Crashes";
        Serial.println("[Recovery] CRITICAL: Too many failures. BOOTING IN SAFE MODE.");
    }
}

void RecoveryManager::markBootClean() {
    rtc_crash_count = 0;
    rtc_clean_boot = true;
    Serial.println("[Recovery] Boot marked clean. Crash counter reset.");
}

bool RecoveryManager::isSafeMode() const {
    return m_safeMode;
}

String RecoveryManager::getBootReason() const {
    return m_bootReason;
}

String RecoveryManager::getLastCrash() const {
    return m_lastCrash;
}

int RecoveryManager::getRollbackCount() const {
    return m_rollbackCount;
}

void RecoveryManager::incrementRollbackCount() {
    m_rollbackCount++;
    Preferences prefs;
    prefs.begin("ares_recovery", false);
    prefs.putInt("rollback_cnt", m_rollbackCount);
    prefs.end();
}

void RecoveryManager::setBootReason(const String& reason) {
    m_bootReason = reason;
    Preferences prefs;
    prefs.begin("ares_recovery", false);
    prefs.putString("boot_reason", m_bootReason);
    prefs.end();
}

void RecoveryManager::setLastCrash(const String& crash) {
    m_lastCrash = crash;
    Preferences prefs;
    prefs.begin("ares_recovery", false);
    prefs.putString("last_crash", m_lastCrash);
    prefs.end();
}

void RecoveryManager::resetCrashCounter() {
    rtc_crash_count = 0;
    rtc_clean_boot = true;
}

void RecoveryManager::forceReboot() {
    Serial.println("[System] Rebooting ESP32...");
    delay(100);
    ESP.restart();
}

void RecoveryManager::factoryReset() {
    Serial.println("[Recovery] Performing Factory Reset...");
    Preferences prefs;
    prefs.begin("ares_config", false);
    prefs.clear();
    prefs.end();

    prefs.begin("ares_recovery", false);
    prefs.clear();
    prefs.end();

    rtc_crash_count = 0;
    rtc_clean_boot = false;

    delay(200);
    ESP.restart();
}
