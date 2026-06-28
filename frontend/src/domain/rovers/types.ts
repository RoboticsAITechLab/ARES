export type RoverState = 
  | "IDLE" 
  | "READY" 
  | "DEPLOYED" 
  | "EXPLORING" 
  | "RETURNING" 
  | "CHARGING" 
  | "OFFLINE" 
  | "ERROR"
  | "DOCKED"
  | "ACTIVE"
  | "DEPLOYING"
  | "RECOVERING";

export interface RoverStateTransition {
  timestamp: string;
  state: RoverState;
  reason?: string;
}

export interface Rover {
  id: string;
  name: string;
  battery: number;
  signal: number;
  status: RoverState;
  temperature: number; // in Celsius
  latitude: number;
  longitude: number;
  speed: number; // in m/s
  lastContact: string;
  type: "mother" | "scout";
  cpu: number; // in %
  memory: number; // in %
  linkQuality: number; // in %
  health: number; // in %
  
  // Phase 2 architecture extensions
  stateHistory: RoverStateTransition[];
  currentMissionId?: string;
  lastHeartbeat: string;
  healthScore: number;
  
  assignedMissionId?: string;
  returnDistance?: number;
  returnHeading?: number;
  recoveryState?: string;
}

export function createRoverStateTransition(state: RoverState, reason?: string): RoverStateTransition {
  return {
    timestamp: new Date().toISOString().split("T")[1].slice(0, 8) + " UTC",
    state,
    reason,
  };
}

export function transitionRover(rover: Rover, newState: RoverState, reason?: string): Rover {
  const newTransition = createRoverStateTransition(newState, reason);
  return {
    ...rover,
    status: newState,
    stateHistory: [newTransition, ...rover.stateHistory],
    lastHeartbeat: newTransition.timestamp,
  };
}
