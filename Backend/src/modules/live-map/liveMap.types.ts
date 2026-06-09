/**
 * @file liveMap.types.ts
 * @description Type definitions for mapping coordinates, waypoints, geofences, and routes on the ARES tactical view.
 */

export interface Coordinate {
  latitude: number;
  longitude: number;
}

export interface GeofenceZone {
  id: string;
  name: string;
  points: Coordinate[];
}

export interface Waypoint {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  type: "SCAN" | "COLLECT" | "RELAY" | "OBSERVE" | "RETURN";
}
