/**
 * @file ScoutRoverPacket.ts
 * @description Type definition representing nested scout rover telemetry details collected by the Mother Rover.
 */

export interface ScoutRoverPacket {
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
