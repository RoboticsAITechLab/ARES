export type MissionState =
  | "DRAFT"
  | "PLANNED"
  | "READY"
  | "LAUNCHED"
  | "ACTIVE"
  | "PAUSED"
  | "COMPLETED"
  | "FAILED"
  | "ABORTED"
  | "ARCHIVED";

export type ObjectiveState = "PENDING" | "ACTIVE" | "COMPLETED" | "FAILED";

export interface MissionObjective {
  id: string;
  label: string;
  status: ObjectiveState;
  description?: string;
}

export interface MissionStateTransition {
  timestamp: string;
  state: MissionState;
  reason?: string;
}

export interface Mission {
  id: string;
  name: string;
  description: string;
  priority: "LOW" | "MEDIUM" | "HIGH";
  status: MissionState;
  duration: number; // in Sols or hours
  objectives: MissionObjective[];
  assignedRoverIds: string[];
  
  // Phase 2 architecture extensions
  stateHistory: MissionStateTransition[];
  creationTime: string;
  launchTime?: string;
  completionTime?: string;
  
  // Multiplayer readiness
  createdBy: string;
  assignedOperator: string;
  lastModifiedBy: string;
}

export function createMissionStateTransition(state: MissionState, reason?: string): MissionStateTransition {
  return {
    timestamp: new Date().toISOString().split("T")[1].slice(0, 8) + " UTC",
    state,
    reason,
  };
}

export function transitionMission(mission: Mission, newState: MissionState, reason?: string): Mission {
  const newTransition = createMissionStateTransition(newState, reason);
  const nowStr = new Date().toISOString().split("T")[1].slice(0, 8) + " UTC";
  
  return {
    ...mission,
    status: newState,
    stateHistory: [newTransition, ...mission.stateHistory],
    launchTime: (newState === "LAUNCHED" || newState === "ACTIVE") && !mission.launchTime ? nowStr : mission.launchTime,
    completionTime: newState === "COMPLETED" || newState === "FAILED" || newState === "ABORTED" ? nowStr : mission.completionTime,
  };
}
