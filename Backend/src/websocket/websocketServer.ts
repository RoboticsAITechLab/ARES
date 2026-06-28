import { Server as HttpServer } from "http";
import { WebSocketServer as WsServer, WebSocket } from "ws";
import { WebSocketMessage } from "./websocketEvents";

export class WebSocketServerManager {
  private wss: WsServer | null = null;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private commandHandler: ((command: string, value: any) => void) | null = null;

  public onCommand(handler: (command: string, value: any) => void): void {
    this.commandHandler = handler;
  }

  public initialize(server: HttpServer): void {
    console.log("[ARES WebSocket] Initializing WebSocket Server Manager...");
    this.wss = new WsServer({ noServer: true });

    // Handle HTTP Upgrade requests
    server.on("upgrade", (request, socket, head) => {
      const urlObj = new URL(request.url || "", `http://${request.headers.host || "localhost"}`);
      const token = urlObj.searchParams.get("token");
      
      if (urlObj.pathname === "/ws" && token === "ares_auth_secret") {
        this.wss?.handleUpgrade(request, socket, head, (ws) => {
          this.wss?.emit("connection", ws, request);
        });
      } else {
        console.log(`[ARES WebSocket] Rejected upgrade request for invalid path or token. Path: ${urlObj.pathname}`);
        socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
        socket.destroy();
      }
    });

    // Handle incoming client connections
    this.wss.on("connection", (ws: WebSocket) => {
      console.log("[ARES WebSocket] Client connected successfully.");

      // Send initial connection message
      const connMessage: WebSocketMessage = {
        type: "connection",
        timestamp: Date.now(),
      };
      
      try {
        ws.send(JSON.stringify(connMessage));
      } catch (err) {
        console.error("[ARES WebSocket] Error sending initial connection payload:", err);
      }

      // Handle incoming messages from the client
      ws.on("message", (rawMessage) => {
        try {
          const message = JSON.parse(rawMessage.toString());
          if (message.type === "rover_command" && this.commandHandler) {
            this.commandHandler(message.command, message.value);
          }
        } catch (err) {
          console.error("[ARES WebSocket] Error parsing incoming client message:", err);
        }
      });

      // Handle socket closure
      ws.on("close", () => {
        console.log("[ARES WebSocket] Client disconnected.");
      });

      // Handle connection-level errors
      ws.on("error", (err) => {
        console.error("[ARES WebSocket] Socket connection error:", err);
      });
    });

    // Handle server-level errors
    this.wss.on("error", (err) => {
      console.error("[ARES WebSocket] Server-level WebSocket error:", err);
    });

    // Start heartbeat broadcast loop (every 5 seconds)
    this.startHeartbeatBroadcast();
  }

  private startHeartbeatBroadcast(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }

    this.heartbeatInterval = setInterval(() => {
      this.broadcast({
        type: "heartbeat",
        timestamp: Date.now(),
      });
    }, 5000); // 5 seconds interval
  }

  public broadcast(message: WebSocketMessage): void {
    if (!this.wss) return;

    const payload = JSON.stringify(message);

    this.wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        try {
          client.send(payload);
        } catch (err) {
          console.error("[ARES WebSocket] Error broadcasting to client:", err);
        }
      }
    });
  }

  public close(): void {
    console.log("[ARES WebSocket] Shutting down WebSocket server...");
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
    
    if (this.wss) {
      this.wss.clients.forEach((client) => {
        client.terminate();
      });
      this.wss.close(() => {
        console.log("[ARES WebSocket] Server shut down completed.");
      });
      this.wss = null;
    }
  }
}

