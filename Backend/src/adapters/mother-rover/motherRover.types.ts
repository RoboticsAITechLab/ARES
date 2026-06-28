/**
 * @file motherRover.types.ts
 * @description Connection settings and config types for the Mother Rover hardware communication link.
 */

export interface MotherRoverConnectionConfig {
  host: string;
  port: number;
  protocol: "tcp" | "udp" | "ws" | "wss";
}
