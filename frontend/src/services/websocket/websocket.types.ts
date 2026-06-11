import { Fleet } from "../../types/Fleet";

export type WebSocketMessage =
  | {
      type: "connection";
      timestamp: number;
    }
  | {
      type: "heartbeat";
      timestamp: number;
    }
  | {
      type: "fleet_update";
      data: Fleet;
      timestamp: number;
    };

