/**
 * @file MotherRover.ts
 * @description Type definition representing the frontend Mother Rover state.
 */

export interface MotherRover {
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
