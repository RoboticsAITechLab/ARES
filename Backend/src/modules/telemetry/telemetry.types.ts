/**
 * @file telemetry.types.ts
 * @description Type definitions for tracking historical telemetry logs and connection status.
 */

export interface TelemetryPoint {
  sol: number;
  battery: number;
  signal: number;
  temperature: number;
  speed: number;
  timestamp: number;
}

export interface TelemetryState {
  roverId: string;
  history: TelemetryPoint[];
}
