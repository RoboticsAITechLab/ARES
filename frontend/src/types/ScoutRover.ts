/**
 * @file ScoutRover.ts
 * @description Type definition representing nested scout rover telemetry details on the frontend.
 */

export interface ScoutRover {
  id: string;
  battery: number;
  signal: number;
  temperature: number;
  speed: number;
  heading: number;
  x: number;
  y: number;
  status: string;
  timestamp: number;
}
