/**
 * @file motherRover.adapter.ts
 * @description Adapter managing the WebSocket client connection with the physical Mother Rover ESP32.
 */

import WebSocket from "ws";
import { MotherRoverConnectionConfig } from "./motherRover.types";
import { MotherRoverParser } from "./motherRover.parser";
import { FleetPacket } from "../../types/FleetPacket";
import { Logger } from "../../logger";

export class MotherRoverAdapter {
  private ws: WebSocket | null = null;
  private isConnecting = false;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private shouldConnect = false;

  constructor(
    private readonly config: MotherRoverConnectionConfig,
    private readonly parser: MotherRoverParser,
    private readonly onUpdate: (packet: FleetPacket) => void
  ) {}

  public connect(): void {
    this.shouldConnect = true;
    if (this.isConnecting || (this.ws && this.ws.readyState === WebSocket.OPEN)) {
      return;
    }

    const url = `${this.config.protocol}://${this.config.host}:${this.config.port}/`;
    Logger.log("INFO", "COMMS", `Establishing link to Mother Rover: ${url}`);
    
    this.isConnecting = true;
    try {
      this.ws = new WebSocket(url);
      this.setupHandlers();
    } catch (err) {
      Logger.log("CRITICAL", "COMMS", `Failed to instantiate WebSocket to ESP32: ${err}`);
      this.handleClose();
    }
  }

  private setupHandlers(): void {
    if (!this.ws) return;

    this.ws.on("open", () => {
      this.isConnecting = false;
      Logger.log("INFO", "COMMS", "Mother Rover LINK ESTABLISHED.");
      this.startHeartbeat();
    });

    this.ws.on("message", (data) => {
      const packet = this.parser.parsePacket(data.toString());
      if (packet) {
        this.onUpdate(packet);
      }
    });

    this.ws.on("close", () => {
      Logger.log("WARNING", "COMMS", "Mother Rover link closed.");
      this.handleClose();
    });

    this.ws.on("error", (err) => {
      Logger.log("CRITICAL", "COMMS", `Mother Rover socket error: ${err.message}`);
    });
  }

  private startHeartbeat(): void {
    if (this.heartbeatInterval) clearInterval(this.heartbeatInterval);
    
    this.heartbeatInterval = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: "ping" }));
      }
    }, 5000); // 5 seconds interval
  }

  private handleClose(): void {
    this.isConnecting = false;
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }

    // Broadcast offline state
    this.onUpdate({
      mother: {
        id: "mother-rover",
        battery: 0,
        signal: 0,
        temperature: 0,
        speed: 0,
        heading: 0,
        x: 45,
        y: 35,
        status: "offline",
        connectedScouts: 0,
        timestamp: Date.now()
      },
      scouts: []
    });

    if (this.shouldConnect) {
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimeout) return;

    this.reconnectTimeout = setTimeout(() => {
      this.reconnectTimeout = null;
      this.connect();
    }, 3000);
  }

  public sendCommand(command: string, value: any): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const payload = JSON.stringify({
        type: "rover_command",
        command,
        value,
        token: "ares_auth_secret",
        timestamp: Date.now()
      });
      this.ws.send(payload);
    } else {
      Logger.log("WARNING", "COMMS", "Cannot send command: Mother Rover is offline.");
    }
  }

  public disconnect(): void {
    this.shouldConnect = false;
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}
