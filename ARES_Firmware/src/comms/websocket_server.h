#ifndef WEBSOCKET_SERVER_H
#define WEBSOCKET_SERVER_H

#include <Arduino.h>
#include <WebSocketsServer.h>
#include "packet_protocol.h"

// Define a callback function signature for command handling
typedef void (*CommandCallback)(const RoverCommand&);

class WebsocketServer {
public:
    WebsocketServer(uint16_t port = 3002);
    
    void begin(CommandCallback callback);
    void update();
    
    // Broadcast telemetry to all connected clients
    void broadcastTelemetry(const String& payload);

private:
    WebSocketsServer m_webSocket;
    uint16_t m_port;
    CommandCallback m_commandCallback;

    static WebsocketServer* s_instance;
    static void webSocketEvent(uint8_t num, WStype_t type, uint8_t * payload, size_t length);
};

#endif // WEBSOCKET_SERVER_H
