/**
 * @file liveMap.store.ts
 * @description Data store skeleton for tracking live map waypoints and geofences.
 */

import { Waypoint, GeofenceZone } from "./liveMap.types";

export class LiveMapStore {
  private waypoints: Waypoint[] = [];
  private geofences: GeofenceZone[] = [];

  public getWaypoints(): Waypoint[] {
    return this.waypoints;
  }

  public setWaypoints(wps: Waypoint[]): void {
    this.waypoints = wps;
  }
}
