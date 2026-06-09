export type EventSeverity = "INFO" | "WARNING" | "CRITICAL";

export type EventCategory = "MISSION" | "ROVER" | "SCOUT" | "COMMS" | "SYSTEM";

export interface MissionEvent {
  id: string;
  timestamp: string;
  source: string; // e.g. Scout-Alpha, ARES MotherShip, Ground Command
  category: EventCategory;
  severity: EventSeverity;
  description: string;
}

export function createMissionEvent(
  source: string,
  category: EventCategory,
  severity: EventSeverity,
  description: string
): MissionEvent {
  return {
    id: `event-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    timestamp: new Date().toISOString().split("T")[1].slice(0, 8) + " UTC",
    source,
    category,
    severity,
    description,
  };
}
