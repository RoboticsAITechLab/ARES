/**
 * @file websocketEvents.ts
 * @description Shared type definitions representing the structured messages transmitted over the WebSocket channel.
 */

import { FleetPacket } from "../types/FleetPacket";

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
      data: FleetPacket;
      timestamp: number;
    };


