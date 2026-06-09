import { create } from "zustand";
import { Rover, transitionRover, RoverState } from "../domain/rovers/types";
import { Mission, transitionMission, MissionState, MissionObjective } from "../domain/missions/types";
import { Route, Waypoint } from "../domain/routes/types";
import { Scout, transitionScout, ScoutState } from "../domain/scouts/types";
import { MissionEvent, createMissionEvent, EventCategory, EventSeverity } from "../domain/events/types";
import { SimulationConfig, runSimulationTick } from "../domain/simulation/simulation";

import { initialRovers } from "../data/rovers";
import { initialMissions } from "../data/missions";
import { initialRoutes } from "../data/routes";
import { initialEvents } from "../data/events";
import { initialTelemetryHistory, TelemetryHistoryPoint } from "../data/telemetry";

export type HealthStatus = "ONLINE" | "DEGRADED" | "OFFLINE" | "UNKNOWN";

export interface SystemHealthState {
  missionServer: HealthStatus;
  telemetryFeed: HealthStatus;
  webSocketConnection: HealthStatus;
  scoutNetwork: HealthStatus;
  motherRoverLink: HealthStatus;
}

interface MissionStoreState {
  // UI states
  isSidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;

  // Connection & Emergency states
  isConnected: boolean;
  isEmergencyStop: boolean;
  systemHealth: SystemHealthState;

  // Simulation Configurations
  simulationConfig: SimulationConfig;

  // Settings
  layoutDensity: "comfortable" | "compact";
  theme: "dark" | "mars" | "matrix";
  setLayoutDensity: (density: "comfortable" | "compact") => void;
  setTheme: (theme: "dark" | "mars" | "matrix") => void;
  
  // Dynamic Telemetry Data Streams
  rovers: Rover[];
  missions: Mission[];
  routes: Route[];
  scouts: Scout[];
  events: MissionEvent[];
  telemetryHistory: Record<string, TelemetryHistoryPoint[]>;

  // Actions
  addLog: (source: string, category: EventCategory, severity: EventSeverity, description: string) => void;
  addMission: (mission: Omit<Mission, "id" | "status" | "stateHistory" | "creationTime" | "createdBy" | "lastModifiedBy" | "assignedOperator">) => void;
  updateMissionStatus: (missionId: string, status: MissionState, reason?: string) => void;
  updateObjectiveStatus: (missionId: string, objectiveId: string, status: "PENDING" | "ACTIVE" | "COMPLETED" | "FAILED") => void;
  
  // Route planning actions
  addRoute: (name: string, roverId?: string, missionId?: string) => string;
  addWaypoint: (routeId: string, wp: Omit<Waypoint, "id">) => void;
  removeWaypoint: (routeId: string, wpId: string) => void;
  reorderWaypoints: (routeId: string, waypoints: Waypoint[]) => void;

  // Scout actions
  deployScout: (scoutId: string, missionId: string, routeId: string) => void;
  recoverScout: (scoutId: string) => void;

  // Simulation controls
  startSimulation: () => void;
  pauseSimulation: () => void;
  resetSimulation: () => void;
  setSimulationSpeed: (speed: "SLOW" | "NORMAL" | "FAST") => void;
  triggerEmergencyStop: () => void;
}

// Module-level interval reference for simulation loop
let simTimer: any = null;

const getIntervalDuration = (speed: "SLOW" | "NORMAL" | "FAST") => {
  if (speed === "SLOW") return 5000;
  if (speed === "FAST") return 500;
  return 2000; // NORMAL
};

export const useMissionStore = create<MissionStoreState>((set, get) => {
  // Extract initial scouts from scout rovers
  const getInitialScouts = (): Scout[] => {
    return initialRovers
      .filter((r) => r.type === "scout")
      .map((r) => ({
        id: r.id,
        name: r.name,
        battery: r.battery,
        signal: r.signal,
        status: (r.status === "EXPLORING" ? "ACTIVE" : "DOCKED") as ScoutState,
        temperature: r.temperature,
        cpu: r.cpu,
        memory: r.memory,
        health: r.health,
        lastContact: r.lastContact,
        assignedMissionId: r.currentMissionId,
        assignedRouteId: r.currentMissionId ? "route-1" : undefined, // mock default
        returnDistance: r.status === "EXPLORING" ? 180 : undefined,
        returnHeading: r.status === "EXPLORING" ? 280 : undefined,
        recoveryState: "NONE" as const
      }));
  };

  return {
    isSidebarOpen: false,
    setSidebarOpen: (open) => set({ isSidebarOpen: open }),
    toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),

    isConnected: true,
    isEmergencyStop: false,
    systemHealth: {
      missionServer: "ONLINE",
      telemetryFeed: "ONLINE",
      webSocketConnection: "ONLINE",
      scoutNetwork: "ONLINE",
      motherRoverLink: "ONLINE"
    },

    simulationConfig: {
      speed: "NORMAL",
      status: "STOPPED",
      elapsedTime: 0,
      refreshInterval: 2000
    },

    layoutDensity: "comfortable",
    theme: "dark",
    setLayoutDensity: (density) => set({ layoutDensity: density }),
    setTheme: (theme) => set({ theme }),

    rovers: initialRovers,
    missions: initialMissions,
    routes: initialRoutes,
    scouts: getInitialScouts(),
    events: initialEvents,
    telemetryHistory: initialTelemetryHistory,

    addLog: (source, category, severity, description) => {
      const newEvent = createMissionEvent(source, category, severity, description);
      set((state) => ({
        events: [newEvent, ...state.events]
      }));
    },

    addMission: (missionInput) => {
      const nowStr = new Date().toISOString().split("T")[1].slice(0, 8) + " UTC";
      const newMission: Mission = {
        ...missionInput,
        id: `mission-${Date.now()}`,
        status: "PLANNED",
        creationTime: nowStr,
        stateHistory: [{ timestamp: nowStr, state: "PLANNED", reason: "Mission created" }],
        createdBy: "FlightDirector_A",
        assignedOperator: "Operator_Beta",
        lastModifiedBy: "FlightDirector_A"
      };

      set((state) => ({
        missions: [newMission, ...state.missions]
      }));

      get().addLog("Ground Ops", "MISSION", "INFO", `New mission created: "${newMission.name}"`);
    },

    updateMissionStatus: (missionId, status, reason) => {
      set((state) => ({
        missions: state.missions.map((m) =>
          m.id === missionId ? transitionMission(m, status, reason) : m
        )
      }));
      const m = get().missions.find((m) => m.id === missionId);
      if (m) {
        get().addLog(m.name, "MISSION", status === "FAILED" || status === "ABORTED" ? "CRITICAL" : "INFO", `Mission transitioned to ${status}. Reason: ${reason || "N/A"}`);
      }
    },

    updateObjectiveStatus: (missionId, objectiveId, status) => {
      set((state) => ({
        missions: state.missions.map((m) => {
          if (m.id !== missionId) return m;
          const updatedObjectives = m.objectives.map((o) =>
            o.id === objectiveId ? { ...o, status } : o
          );
          return { ...m, objectives: updatedObjectives };
        })
      }));
      const m = get().missions.find(m => m.id === missionId);
      const o = m?.objectives.find(o => o.id === objectiveId);
      if (m && o) {
        get().addLog(m.name, "MISSION", "INFO", `Objective "${o.label}" updated to ${status}`);
      }
    },

    addRoute: (name, roverId, missionId) => {
      const newId = `route-${Date.now()}`;
      const newRoute: Route = {
        id: newId,
        name,
        assignedRoverId: roverId,
        assignedMissionId: missionId,
        waypoints: []
      };
      set((state) => ({
        routes: [...state.routes, newRoute]
      }));
      get().addLog("Ground Ops", "SYSTEM", "INFO", `New route planning asset registered: "${name}"`);
      return newId;
    },

    addWaypoint: (routeId, wpInput) => {
      const newWp: Waypoint = {
        ...wpInput,
        id: `wp-${Date.now()}`
      };
      set((state) => ({
        routes: state.routes.map((r) =>
          r.id === routeId ? { ...r, waypoints: [...r.waypoints, newWp] } : r
        )
      }));
      const r = get().routes.find(r => r.id === routeId);
      if (r) {
        get().addLog(r.name, "SYSTEM", "INFO", `Added waypoint "${newWp.name}" to route.`);
      }
    },

    removeWaypoint: (routeId, wpId) => {
      set((state) => ({
        routes: state.routes.map((r) =>
          r.id === routeId ? { ...r, waypoints: r.waypoints.filter(wp => wp.id !== wpId) } : r
        )
      }));
    },

    reorderWaypoints: (routeId, waypoints) => {
      set((state) => ({
        routes: state.routes.map((r) =>
          r.id === routeId ? { ...r, waypoints } : r
        )
      }));
    },

    deployScout: (scoutId, missionId, routeId) => {
      // 1. Transition Scout to ACTIVE
      set((state) => ({
        scouts: state.scouts.map(s => 
          s.id === scoutId 
            ? { ...s, status: "ACTIVE", assignedMissionId: missionId, assignedRouteId: routeId, returnDistance: 200, returnHeading: 90, recoveryState: "NONE" }
            : s
        ),
        // 2. Transition Rover unit to EXPLORING
        rovers: state.rovers.map(r => 
          r.id === scoutId 
            ? transitionRover({ ...r, currentMissionId: missionId }, "EXPLORING", "Deploy sequence initiated")
            : r
        )
      }));

      const scout = get().scouts.find(s => s.id === scoutId);
      const mission = get().missions.find(m => m.id === missionId);
      if (scout && mission) {
        get().addLog(scout.name, "SCOUT", "INFO", `Scout successfully launched and deployed to mission: ${mission.name}`);
      }
    },

    recoverScout: (scoutId) => {
      set((state) => ({
        scouts: state.scouts.map(s => 
          s.id === scoutId 
            ? { ...s, status: "RECOVERING", recoveryState: "RETRIEVING" }
            : s
        ),
        rovers: state.rovers.map(r => 
          r.id === scoutId 
            ? transitionRover(r, "RETURNING", "Recovery command received")
            : r
        )
      }));
      const scout = get().scouts.find(s => s.id === scoutId);
      if (scout) {
        get().addLog(scout.name, "SCOUT", "INFO", `Recovery command sent. Vehicle homing coordinates locked.`);
      }
    },

    startSimulation: () => {
      if (simTimer) clearInterval(simTimer);
      
      set((state) => ({
        simulationConfig: { ...state.simulationConfig, status: "RUNNING" }
      }));

      const runTick = () => {
        const simResult = runSimulationTick({
          rovers: get().rovers,
          missions: get().missions,
          events: get().events,
          routes: get().routes,
          scouts: get().scouts,
          isEmergencyStop: get().isEmergencyStop,
          simulationConfig: get().simulationConfig
        });

        // Update historical telemetry chart database (Battery depletion / Signal history)
        const nextTelemetryHistory = { ...get().telemetryHistory };
        simResult.rovers.forEach(rover => {
          const points = nextTelemetryHistory[rover.id] || [];
          const lastPointSol = points[points.length - 1]?.sol || 136;
          const nextSol = lastPointSol + 1;
          
          const newPoint: TelemetryHistoryPoint = {
            sol: nextSol,
            battery: rover.battery,
            signal: rover.signal,
            temperature: rover.temperature,
            speed: rover.speed
          };

          nextTelemetryHistory[rover.id] = [...points.slice(-10), newPoint]; // keep last 10 points
        });

        set({
          rovers: simResult.rovers,
          missions: simResult.missions,
          scouts: simResult.scouts,
          events: simResult.events,
          simulationConfig: simResult.simulationConfig,
          telemetryHistory: nextTelemetryHistory
        });
      };

      const intervalMs = getIntervalDuration(get().simulationConfig.speed);
      simTimer = setInterval(runTick, intervalMs);

      get().addLog("Simulation Engine", "SYSTEM", "INFO", `Mission Simulation loop initialized. Speed: ${get().simulationConfig.speed}`);
    },

    pauseSimulation: () => {
      if (simTimer) {
        clearInterval(simTimer);
        simTimer = null;
      }
      set((state) => ({
        simulationConfig: { ...state.simulationConfig, status: "PAUSED" }
      }));
      get().addLog("Simulation Engine", "SYSTEM", "INFO", "Mission Simulation loop paused.");
    },

    resetSimulation: () => {
      if (simTimer) {
        clearInterval(simTimer);
        simTimer = null;
      }
      set({
        rovers: initialRovers,
        missions: initialMissions,
        routes: initialRoutes,
        scouts: getInitialScouts(),
        events: initialEvents,
        telemetryHistory: initialTelemetryHistory,
        isEmergencyStop: false,
        systemHealth: {
          missionServer: "ONLINE",
          telemetryFeed: "ONLINE",
          webSocketConnection: "ONLINE",
          scoutNetwork: "ONLINE",
          motherRoverLink: "ONLINE"
        },
        simulationConfig: {
          speed: "NORMAL",
          status: "STOPPED",
          elapsedTime: 0,
          refreshInterval: 2000
        }
      });
      get().addLog("Simulation Engine", "SYSTEM", "INFO", "Mission Simulation loop reset to nominal baseline state.");
    },

    setSimulationSpeed: (speed) => {
      set((state) => ({
        simulationConfig: { 
          ...state.simulationConfig, 
          speed, 
          refreshInterval: getIntervalDuration(speed) 
        }
      }));

      // If running, restart with the new duration
      if (get().simulationConfig.status === "RUNNING") {
        get().startSimulation();
      }
    },

    triggerEmergencyStop: () => {
      const nextState = !get().isEmergencyStop;
      
      set((state) => {
        const updatedRovers = state.rovers.map((rover) => ({
          ...rover,
          speed: 0,
          status: (nextState ? "ERROR" : "READY") as RoverState,
          health: nextState ? Math.floor(rover.health * 0.7) : 95
        }));

        return {
          isEmergencyStop: nextState,
          rovers: updatedRovers,
          systemHealth: {
            missionServer: nextState ? "DEGRADED" : "ONLINE",
            telemetryFeed: nextState ? "DEGRADED" : "ONLINE",
            webSocketConnection: "ONLINE",
            scoutNetwork: nextState ? "DEGRADED" : "ONLINE",
            motherRoverLink: nextState ? "OFFLINE" : "ONLINE"
          }
        };
      });

      if (nextState) {
        get().addLog("Ground Ops", "SYSTEM", "CRITICAL", "EMERGENCY VEHICLE STOP SEQUENCE INITIATED.");
      } else {
        get().addLog("Ground Ops", "SYSTEM", "INFO", "Emergency safe mode released. Re-establishing telemetry streams.");
      }
    }
  };
});
