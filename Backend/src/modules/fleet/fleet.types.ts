/**
 * @file fleet.types.ts
 * @description Type definitions for tracking fleet connection states and registration logs.
 */

export interface RoverIdentity {
  id: string;
  name: string;
  type: "mother" | "scout";
}

export interface FleetState {
  onlineNodes: string[];
  lastDiscoveryTimestamp: number;
}
