#ifndef WEBSOCKET_CLIENT_H
#define WEBSOCKET_CLIENT_H

#include <Arduino.h>
#include <WebSocketsClient.h>
#include "packet_protocol.h"

// Define a callback function signature for command handling
typedef void (*CommandCallback)(const RoverCommand&);

class WebsocketClient {
public:
    WebsocketClient(const char* host, uint16_t port, const char* path);
    
    void begin(CommandCallback callback);
    void update();
    
    // Send telemetry to the server
    void sendTelemetry(const String& payload);

private:
    WebSocketsClient m_webSocket;
    const char* m_host;
    uint16_t m_port;
    const char* m_path;
    CommandCallback m_commandCallback;

    static WebsocketClient* s_instance;
    static void webSocketEvent(WStype_t type, uint8_t * payload, size_t length);
};

#endif // WEBSOCKET_CLIENT_H
