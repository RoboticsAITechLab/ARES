#include "wifi_manager.h"

WifiManager::WifiManager(const char* apSsid, const char* apPassword)
    : m_apSsid(apSsid),
      m_apPassword(apPassword),
      m_isApMode(false) {}

void WifiManager::begin(const char* stationSsid, const char* stationPassword) {
    // Config AP Mode first in dual STA+AP mode so it is always active
    Serial.println("Initializing Access Point mode (Dual AP+STA mode)...");
    WiFi.mode(WIFI_AP_STA);
    
    // Set custom AP IP subnet to avoid any conflict with router's DHCP range (e.g. 192.168.4.x)
    IPAddress apIP(192, 168, 4, 1);
    IPAddress gateway(192, 168, 4, 1);
    IPAddress subnet(255, 255, 255, 0);
    WiFi.softAPConfig(apIP, gateway, subnet);
    
    WiFi.softAP(m_apSsid, m_apPassword, 1, 0, 4);
    WiFi.setTxPower(WIFI_POWER_19_5dBm);
    
    Serial.print("AP SSID: ");
    Serial.println(m_apSsid);
    Serial.print("AP IP Address: ");
    Serial.println(WiFi.softAPIP());
    m_isApMode = true;

    // Check if station SSID is provided to connect to your router
    if (stationSsid && strlen(stationSsid) > 0) {
        Serial.print("Connecting to WiFi Station: ");
        Serial.println(stationSsid);
        
        WiFi.begin(stationSsid, stationPassword);
        
        // Wait up to 10 seconds for connection
        int retries = 20;
        while (WiFi.status() != WL_CONNECTED && retries > 0) {
            delay(500);
            Serial.print(".");
            retries--;
        }
        
        if (WiFi.status() == WL_CONNECTED) {
            Serial.println("\nWiFi Connected successfully to Router!");
            Serial.print("Station IP Address: ");
            Serial.println(WiFi.localIP());
            m_isApMode = false; // Successfully connected to local station
        } else {
            Serial.println("\nFailed to connect to Router WiFi. Running in Access Point only fallback mode.");
            WiFi.mode(WIFI_AP);
            m_isApMode = true;
        }
    }
}

bool WifiManager::isConnected() const {
    if (m_isApMode) {
        return WiFi.softAPgetStationNum() > 0; // In AP mode, 'connected' means we have clients
    }
    return WiFi.status() == WL_CONNECTED; // In station mode, connected to AP
}

IPAddress WifiManager::getLocalIP() const {
    if (m_isApMode) {
        return WiFi.softAPIP();
    }
    return WiFi.localIP();
}
