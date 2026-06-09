export type ScoutState =
  | "DOCKED"
  | "PREPARING"
  | "DEPLOYING"
  | "ACTIVE"
  | "RETURNING"
  | "RECOVERING"
  | "OFFLINE"
  | "ERROR";

export interface Scout {
  id: string;
  name: string;
  battery: number;
  signal: number;
  status: ScoutState;
  temperature: number;
  cpu: number;
  memory: number;
  health: number;
  lastContact: string;
  
  // Phase 2 operational links
  assignedMissionId?: string;
  assignedRouteId?: string;
  returnDistance?: number; // in meters
  returnHeading?: number; // in degrees (0-360)
  recoveryState?: "PENDING" | "STANDBY" | "RETRIEVING" | "SECURED" | "NONE";
}

export function transitionScout(scout: Scout, newState: ScoutState): Scout {
  return {
    ...scout,
    status: newState,
    lastContact: new Date().toISOString().split("T")[1].slice(0, 8) + " UTC",
  };
}
