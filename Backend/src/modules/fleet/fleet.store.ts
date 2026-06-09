/**
 * @file fleet.store.ts
 * @description Data store skeleton for tracking registered rover nodes in the fleet.
 */

import { RoverIdentity } from "./fleet.types";

export class FleetStore {
  private activeRovers: Map<string, RoverIdentity> = new Map();

  public getRovers(): RoverIdentity[] {
    return Array.from(this.activeRovers.values());
  }

  public registerRover(rover: RoverIdentity): void {
    this.activeRovers.set(rover.id, rover);
  }
}
