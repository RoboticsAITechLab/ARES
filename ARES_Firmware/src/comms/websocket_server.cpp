#include "websocket_server.h"

WebsocketServer* WebsocketServer::s_instance = nullptr;

WebsocketServer::WebsocketServer(uint16_t port)
    : m_webSocket(port), m_port(port), m_commandCallback(nullptr) {
    s_instance = this;
}

void WebsocketServer::begin(CommandCallback callback) {
    m_commandCallback = callback;
    
    m_webSocket.begin();
    m_webSocket.onEvent(webSocketEvent);
    
    Serial.print("WebSocket Server started on port ");
    Serial.println(m_port);
}

void WebsocketServer::update() {
    m_webSocket.loop();
}

void WebsocketServer::broadcastTelemetry(const String& payload) {
    String tempPayload = payload;
    m_webSocket.broadcastTXT(tempPayload);
}

void WebsocketServer::webSocketEvent(uint8_t num, WStype_t type, uint8_t * payload, size_t length) {
    if (!s_instance) return;

    switch (type) {
        case WStype_DISCONNECTED:
            Serial.printf("[%u] Disconnected!\n", num);
            break;
            
        case WStype_CONNECTED: {
            IPAddress ip = s_instance->m_webSocket.remoteIP(num);
            Serial.printf("[%u] Connected from %d.%d.%d.%d url: %s\n", num, ip[0], ip[1], ip[2], ip[3], payload);
            
            // Send connection acknowledgement
            s_instance->m_webSocket.sendTXT(num, "{\"type\":\"connection\",\"status\":\"connected\"}");
            break;
        }
            
        case WStype_TEXT: {
            Serial.printf("[%u] Received text: %s\n", num, payload);
            
            RoverCommand cmd;
            if (PacketProtocol::parseCommand(payload, length, cmd)) {
                if (s_instance->m_commandCallback) {
                    s_instance->m_commandCallback(cmd);
                }
            } else {
                Serial.println("Failed to parse incoming command JSON");
            }
            break;
        }
            
        case WStype_BIN:
            // Binary frames not handled in current MVR specification
            break;
            
        default:
            break;
    }
}
