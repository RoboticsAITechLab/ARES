#ifndef WIFI_MANAGER_H
#define WIFI_MANAGER_H

#include <Arduino.h>
#include <WiFi.h>

class WifiManager {
public:
    WifiManager(const char* apSsid = "ARES_Rover", const char* apPassword = "aresroverpassword");
    
    // Try to connect to Station (router) first. If it fails or if ssid is null, configures AP mode.
    void begin(const char* stationSsid = nullptr, const char* stationPassword = nullptr);
    
    // Check connection status
    bool isConnected() const;
    
    // Get current IP address
    IPAddress getLocalIP() const;

private:
    const char* m_apSsid;
    const char* m_apPassword;
    bool m_isApMode;
};

#endif // WIFI_MANAGER_H
