#ifndef OTA_MANAGER_H
#define OTA_MANAGER_H

#include <Arduino.h>

class OtaManager {
public:
    static OtaManager& getInstance();
    
    void begin(const String& backendHost, int backendPort, const String& roverId, const String& apiKey);
    
    // Periodically checks and runs updates
    void update();
    
    // Manually trigger an update check/run
    void triggerUpdate(const String& version = "");

    bool isUpdating() const { return m_isUpdating; }
    int getProgress() const { return m_progress; }
    String getOtaStatus() const { return m_otaStatus; }

private:
    OtaManager();
    
    bool checkUpdate(String& outVersion, String& outUrl, String& outChecksum, String& outSignature);
    bool runOtaDownload(const String& url, const String& version, const String& expectedChecksum, const String& expectedSignature);
    bool verifyFirmwareSignature(const uint8_t* sha256Hash, const String& signatureHex);
    bool isWithinUpdateWindow(const String& window);

    String m_backendHost;
    int m_backendPort;
    String m_roverId;
    String m_apiKey;

    bool m_isUpdating;
    int m_progress;
    String m_otaStatus; // "idle", "downloading", "verifying", "completed", "failed"
    unsigned long m_lastCheckTime;
    const unsigned long m_checkInterval = 60000; // Check every 60 seconds
};

#endif // OTA_MANAGER_H
