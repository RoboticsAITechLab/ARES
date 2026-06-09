/**
 * @file Telemetry.ts
 * @description Type definition representing historical telemetry point data.
 */

export interface TelemetryPoint {
  sol: number;
  battery: number;
  signal: number;
  temperature: number;
  speed: number;
}

export type TelemetryData = Record<string, TelemetryPoint[]>;
