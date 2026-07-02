import { useConnectionStore } from "../../store/connection-store";
import { useMissionStore } from "../../store/mission-store";
import { WebSocketMessage } from "./websocket.types";

export class AresWebSocketClient {
  private static instance: AresWebSocketClient | null = null;
  private ws: WebSocket | null = null;
  private url: string;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private reconnectInterval = 3000; // Attempt reconnect every 3 seconds
  private shouldReconnect = true;

  private constructor(url: string) {
    this.url = url;
  }

  public static getInstance(): AresWebSocketClient {
    if (!AresWebSocketClient.instance) {
      let url = "ws://127.0.0.1:3001/ws?token=ares_auth_secret&role=controller";
      if (typeof window !== "undefined") {
        const hostname = window.location.hostname;
        if (hostname !== "localhost" && hostname !== "127.0.0.1") {
          url = "wss://ares-mk3j.onrender.com/ws?token=ares_auth_secret&role=controller";
        }
      }
      AresWebSocketClient.instance = new AresWebSocketClient(url);
      if (typeof window !== "undefined") {
        (window as any).__aresWsClient = AresWebSocketClient.instance;
      }
    }
    return AresWebSocketClient.instance;
  }

  public connect(): void {
    if (this.ws && (this.ws.readyState === WebSocket.CONNECTING || this.ws.readyState === WebSocket.OPEN)) {
      return;
    }

    console.log(`[ARES WS Client] Connecting to Ground Operations Server: ${this.url}`);
    
    const store = useConnectionStore.getState();
    store.setConnectionStatus("connecting");

    this.shouldReconnect = true;

    try {
      this.ws = new WebSocket(this.url);
      this.setupEventHandlers();
    } catch (err) {
      console.error("[ARES WS Client] Failed to instantiate WebSocket:", err);
      this.handleDisconnect();
    }
  }

  private setupEventHandlers(): void {
    if (!this.ws) return;

    this.ws.onopen = () => {
      console.log("[ARES WS Client] WebSocket connection opened successfully.");
      const store = useConnectionStore.getState();
      store.setConnectionStatus("connected");
      
      if (this.reconnectTimeout) {
        clearTimeout(this.reconnectTimeout);
        this.reconnectTimeout = null;
      }
    };

    this.ws.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);
        this.handleMessage(message);
      } catch (err) {
        console.error("[ARES WS Client] Error parsing incoming WebSocket message:", err, event.data);
      }
    };

    this.ws.onclose = (event) => {
      console.log(`[ARES WS Client] WebSocket connection closed. Code: ${event.code}, Reason: ${event.reason}`);
      this.handleDisconnect();
    };

    this.ws.onerror = (err) => {
      console.error("[ARES WS Client] WebSocket connection error:", err);
    };
  }

  private handleMessage(message: WebSocketMessage): void {
    const store = useConnectionStore.getState();
    
    switch (message.type) {
      case "connection":
        console.log(`[ARES WS Client] Received connection acknowledgement from backend. Server timestamp: ${message.timestamp}`);
        store.setConnectionStatus("connected");
        break;
      case "heartbeat":
        console.log(`[ARES WS Client] Heartbeat sync: Sol 142 synchronization complete. timestamp: ${message.timestamp}`);
        store.setLastHeartbeat(message.timestamp);
        break;
      case "fleet_update":
        useMissionStore.getState().updateFleet(message.data);
        break;
      case "rover_log":
      case "command_ack":
      case "ota_status":
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent(message.type, { detail: message }));
        }
        break;
      default:
        console.warn("[ARES WS Client] Unhandled message type:", message);
    }
  }

  private handleDisconnect(): void {
    const store = useConnectionStore.getState();
    store.setConnectionStatus("disconnected");
    store.setLastHeartbeat(null);

    if (this.shouldReconnect) {
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimeout) return;

    console.log(`[ARES WS Client] Scheduling automatic reconnect in ${this.reconnectInterval}ms...`);
    this.reconnectTimeout = setTimeout(() => {
      this.reconnectTimeout = null;
      this.connect();
    }, this.reconnectInterval);
  }

  public send(message: any): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      try {
        this.ws.send(JSON.stringify(message));
      } catch (err) {
        console.error("[ARES WS Client] Failed to send message:", err);
      }
    } else {
      console.warn("[ARES WS Client] WebSocket is not open. Cannot send message.");
    }
  }

  public disconnect(): void {
    console.log("[ARES WS Client] Manually disconnecting WebSocket client...");
    this.shouldReconnect = false;
    
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    const store = useConnectionStore.getState();
    store.setConnectionStatus("disconnected");
    store.setLastHeartbeat(null);
  }
}
