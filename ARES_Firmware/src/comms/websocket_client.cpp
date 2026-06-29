#include "websocket_client.h"

WebsocketClient* WebsocketClient::s_instance = nullptr;

WebsocketClient::WebsocketClient(const char* host, uint16_t port, const char* path)
    : m_host(host), m_port(port), m_path(path), m_commandCallback(nullptr) {
    s_instance = this;
}

void WebsocketClient::begin(CommandCallback callback) {
    m_commandCallback = callback;
    
    // Initialize WebSocket connection (Use SSL WSS protocol on port 443)
    if (m_port == 443) {
        m_webSocket.beginSSL(m_host, m_port, m_path);
    } else {
        m_webSocket.begin(m_host, m_port, m_path);
    }
    m_webSocket.onEvent(webSocketEvent);
    
    // Reconnect after 5 seconds if connection is lost
    m_webSocket.setReconnectInterval(5000);
    
    Serial.printf("[WS] Connecting to cloud gateway (SSL=%s): %s:%d%s\n", (m_port == 443 ? "Yes" : "No"), m_host, m_port, m_path);
}

void WebsocketClient::update() {
    m_webSocket.loop();
}

void WebsocketClient::sendTelemetry(const String& payload) {
    if (m_webSocket.isConnected()) {
        m_webSocket.sendTXT(payload.c_str());
    }
}

void WebsocketClient::webSocketEvent(WStype_t type, uint8_t * payload, size_t length) {
    if (!s_instance) return;

    switch (type) {
        case WStype_DISCONNECTED:
            Serial.println("[WS] Disconnected from Cloud Gateway Server!");
            break;
            
        case WStype_CONNECTED:
            Serial.println("[WS] Connected to Cloud Gateway Server successfully.");
            break;
            
        case WStype_TEXT: {
            Serial.printf("[WS] Received text: %s\n", payload);
            
            // Check for server ping
            if (length >= 13 && strstr((const char*)payload, "\"type\":\"ping\"") != nullptr) {
                // Heartbeat ping, no action needed or reply with pong
                break;
            }

            RoverCommand cmd;
            if (PacketProtocol::parseCommand(payload, length, cmd)) {
                if (s_instance->m_commandCallback) {
                    s_instance->m_commandCallback(cmd);
                }
            } else {
                Serial.println("[WS] Failed to parse incoming command JSON");
            }
            break;
        }
            
        default:
            break;
    }
}
