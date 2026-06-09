/**
 * @file MotherRoverPacket.ts
 * @description Type definition representing the telemetry data packet received from the Mother Rover.
 */

export interface MotherRoverPacket {
  id: string;
  battery: number;
  signal: number;
  temperature: number;
  speed: number;
  heading: number;
  x: number;
  y: number;
  status: "online" | "offline";
  connectedScouts: number;
  timestamp: number;
}
