/**
 * @file websocketEvents.ts
 * @description Enum events list and payload structure definitions for the WebSocket client-server channel.
 */

export enum WebSocketClientEvent {
  CONNECT = "connect",
  DISCONNECT = "disconnect",
  OVERRIDE_ABORT = "override_abort",
}

export enum WebSocketServerEvent {
  TELEMETRY_STREAM = "telemetry_stream",
  MAP_COORDINATES_UPDATE = "map_coordinates_update",
  ALERT_TRIGGERED = "alert_triggered",
}

export interface WebSocketEventPayload<T = any> {
  event: WebSocketClientEvent | WebSocketServerEvent;
  data: T;
  timestamp: number;
}
