import { Route } from "../domain/routes/types";

export const initialRoutes: Route[] = [
  {
    id: "route-1",
    name: "Western Delta Path",
    assignedMissionId: "mission-1",
    assignedRoverId: "mother-rover",
    waypoints: [
      {
        id: "wp-1",
        name: "Waypoint Delta-A",
        latitude: 18.6521,
        longitude: 226.2045,
        priority: "HIGH",
        type: "SCAN",
        description: "Initial scan waypoint",
        notes: "Perform radar sweep."
      },
      {
        id: "wp-2",
        name: "Clay Mineral deposits",
        latitude: 18.6700,
        longitude: 226.2200,
        priority: "HIGH",
        type: "COLLECT",
        description: "Clay drilling site",
        notes: "Gather drill samples."
      },
      {
        id: "wp-3",
        name: "DSN Relay Hilltop",
        latitude: 18.6845,
        longitude: 226.2512,
        priority: "MEDIUM",
        type: "RELAY",
        description: "Communications alignment site",
        notes: "Deploy relayer lock."
      }
    ]
  },
  {
    id: "route-2",
    name: "Valley Traversal",
    assignedMissionId: "mission-2",
    assignedRoverId: "scout-1",
    waypoints: [
      {
        id: "wp-2-1",
        name: "Valley Entryway",
        latitude: 18.6521,
        longitude: 226.2045,
        priority: "LOW",
        type: "OBSERVE",
        description: "Observe valley slopes",
        notes: "Assess boulder blockages."
      },
      {
        id: "wp-2-2",
        name: "Ridge Relayer",
        latitude: 18.6300,
        longitude: 226.1800,
        priority: "HIGH",
        type: "RELAY",
        description: "Antenna lock point",
        notes: "Check telemetry uplink."
      },
      {
        id: "wp-2-3",
        name: "Return Corridor",
        latitude: 18.6214,
        longitude: 226.1593,
        priority: "MEDIUM",
        type: "RETURN",
        description: "MotherShip return rendezvous",
        notes: "Return to base range."
      }
    ]
  }
];
