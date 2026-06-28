import { Server as HttpServer } from "http";
import { WebSocketServer as WsServer, WebSocket } from "ws";
import { WebSocketMessage } from "./websocketEvents";

export class WebSocketServerManager {
  private wss: WsServer | null = null;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private commandHandler: ((command: string, value: any) => void) | null = null;
  private telemetryHandler: ((data: any) => void) | null = null;

  private controllers: Set<WebSocket> = new Set();
  private roverSocket: WebSocket | null = null;

  public onCommand(handler: (command: string, value: any) => void): void {
    this.commandHandler = handler;
  }

  public onTelemetry(handler: (data: any) => void): void {
    this.telemetryHandler = handler;
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
    this.wss.on("connection", (ws: WebSocket, request: any) => {
      const urlObj = new URL(request.url || "", `http://${request.headers.host || "localhost"}`);
      const role = urlObj.searchParams.get("role") || "controller";

      if (role === "rover") {
        console.log("[ARES WebSocket] Physical Rover client connected successfully.");
        this.roverSocket = ws;

        ws.on("message", (rawMessage) => {
          try {
            const message = JSON.parse(rawMessage.toString());
            if (this.telemetryHandler) {
              this.telemetryHandler(message);
            }
          } catch (err) {
            console.error("[ARES WebSocket] Error parsing incoming rover message:", err);
          }
        });

        ws.on("close", () => {
          console.log("[ARES WebSocket] Physical Rover disconnected.");
          if (this.roverSocket === ws) {
            this.roverSocket = null;
          }
        });

        ws.on("error", (err) => {
          console.error("[ARES WebSocket] Rover socket connection error:", err);
        });
      } else {
        console.log("[ARES WebSocket] Ground Control Controller client connected successfully.");
        this.controllers.add(ws);

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

        // Handle incoming messages from controller (browser)
        ws.on("message", (rawMessage) => {
          try {
            const message = JSON.parse(rawMessage.toString());
            if (message.type === "rover_command" && this.commandHandler) {
              this.commandHandler(message.command, message.value);
            }
          } catch (err) {
            console.error("[ARES WebSocket] Error parsing incoming controller message:", err);
          }
        });

        ws.on("close", () => {
          console.log("[ARES WebSocket] Controller client disconnected.");
          this.controllers.delete(ws);
        });

        ws.on("error", (err) => {
          console.error("[ARES WebSocket] Controller socket connection error:", err);
        });
      }
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
      // Also ping the rover if connected to keep connection alive
      if (this.roverSocket && this.roverSocket.readyState === WebSocket.OPEN) {
        try {
          this.roverSocket.send(JSON.stringify({ type: "ping" }));
        } catch (err) {
          console.error("[ARES WebSocket] Error sending ping to rover:", err);
        }
      }
    }, 5000); // 5 seconds interval
  }

  public broadcast(message: WebSocketMessage): void {
    const payload = JSON.stringify(message);

    this.controllers.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        try {
          client.send(payload);
        } catch (err) {
          console.error("[ARES WebSocket] Error broadcasting to controller:", err);
        }
      }
    });
  }

  public isRoverConnected(): boolean {
    return this.roverSocket !== null && this.roverSocket.readyState === WebSocket.OPEN;
  }

  public sendCommandToRover(command: string, value: any): void {
    if (this.roverSocket && this.roverSocket.readyState === WebSocket.OPEN) {
      try {
        const payload = JSON.stringify({
          type: "rover_command",
          command,
          value,
          token: "ares_auth_secret",
          timestamp: Date.now()
        });
        this.roverSocket.send(payload);
      } catch (err) {
        console.error("[ARES WebSocket] Failed to send command to rover socket:", err);
      }
    } else {
      console.warn("[ARES WebSocket] Cannot send command: Rover socket is not connected.");
    }
  }

  public close(): void {
    console.log("[ARES WebSocket] Shutting down WebSocket server...");
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
    
    if (this.wss) {
      this.controllers.forEach((client) => {
        client.terminate();
      });
      this.controllers.clear();

      if (this.roverSocket) {
        this.roverSocket.terminate();
        this.roverSocket = null;
      }

      this.wss.close(() => {
        console.log("[ARES WebSocket] Server shut down completed.");
      });
      this.wss = null;
    }
  }
}

