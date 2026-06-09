export type WaypointType = "SCAN" | "OBSERVE" | "COLLECT" | "RELAY" | "RETURN";

export interface Waypoint {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  priority: "LOW" | "MEDIUM" | "HIGH";
  type: WaypointType;
  description: string;
  notes?: string;
}

export interface Route {
  id: string;
  name: string;
  assignedMissionId?: string;
  assignedRoverId?: string;
  waypoints: Waypoint[];
}
