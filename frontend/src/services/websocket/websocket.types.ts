export type WebSocketMessage =
  | {
      type: "connection";
      timestamp: number;
    }
  | {
      type: "heartbeat";
      timestamp: number;
    };
