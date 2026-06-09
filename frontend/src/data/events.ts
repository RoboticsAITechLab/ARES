import { MissionEvent } from "../domain/events/types";

export const initialEvents: MissionEvent[] = [
  {
    id: "evt-1",
    timestamp: "13:52:10 UTC",
    source: "Scout-Alpha",
    category: "ROVER",
    severity: "WARNING",
    description: "Battery reserve drop warning: currently at 38% capacity."
  },
  {
    id: "evt-2",
    timestamp: "13:51:04 UTC",
    source: "ARES MotherShip",
    category: "MISSION",
    severity: "INFO",
    description: "Adjusting heading alignment to 142.4° SE towards waypoint 2."
  },
  {
    id: "evt-3",
    timestamp: "13:48:32 UTC",
    source: "Scout-Alpha",
    category: "SYSTEM",
    severity: "WARNING",
    description: "Temperature spike detected in wheel gear-set B core."
  },
  {
    id: "evt-4",
    timestamp: "13:45:01 UTC",
    source: "Ground Command",
    category: "COMMS",
    severity: "INFO",
    description: "High-gain antenna tracking aligned with Mars Express Orbiter."
  },
  {
    id: "evt-5",
    timestamp: "13:30:15 UTC",
    source: "Scout-Beta",
    category: "SCOUT",
    severity: "INFO",
    description: "Completed autonomous drill core sampling at Sector 84-K."
  },
  {
    id: "evt-6",
    timestamp: "13:12:44 UTC",
    source: "Scout-Alpha",
    category: "SYSTEM",
    severity: "CRITICAL",
    description: "Solar array generation dropped below 50% due to dust accumulation."
  }
];
