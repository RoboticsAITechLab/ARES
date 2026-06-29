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
    }
  | {
      type: "rover_log";
      level: "INFO" | "WARNING" | "ERROR" | "DEBUG";
      message: string;
      timestamp: number;
    }
  | {
      type: "command_ack";
      command: string;
      status: "acknowledged" | "completed" | "failed";
      value?: any;
      timestamp: number;
    }
  | {
      type: "ota_status";
      status: string;
      progress: number;
      version: string;
    };
