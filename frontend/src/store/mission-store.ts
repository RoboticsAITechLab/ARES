import { create } from "zustand";
import { Fleet } from "../types/Fleet";
import { TelemetryData } from "../types/Telemetry";
import { MapState } from "../types/MapState";
import { MissionControlState } from "../types/MissionControlState";
import { MissionEvent, EventCategory, EventSeverity, createMissionEvent } from "../domain/events/types";
import { Rover } from "../domain/rovers/types";
import { initialFleetData, initialTelemetryData, initialMapData, initialMissionControlData } from "../data";

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

  // Settings
  layoutDensity: "comfortable" | "compact";
  theme: "dark" | "mars" | "matrix";
  setLayoutDensity: (density: "comfortable" | "compact") => void;
  setTheme: (theme: "dark" | "mars" | "matrix") => void;

  // Centralized Telemetry & Fleet State
  fleet: Fleet;
  telemetry: TelemetryData;
  map: MapState;
  missionControl: MissionControlState;
  events: MissionEvent[];

  // Compatibility Bindings for restored pages
  rovers: Rover[];
  scouts: Rover[];
  missions: any[];
  routes: any[];
  simulationConfig: { 
    speed: any; 
    isRunning: boolean; 
    status?: string; 
    refreshInterval?: number; 
    elapsedTime?: number; 
  };
  telemetryHistory: TelemetryData;

  // Setters
  setFleet: (fleet: Fleet) => void;
  updateFleet: (fleet: Fleet) => void;
  setTelemetry: (telemetry: TelemetryData) => void;
  setMap: (map: MapState) => void;
  setMissionControl: (missionControl: MissionControlState) => void;
  setEvents: (events: MissionEvent[]) => void;
  setSystemHealth: (systemHealth: SystemHealthState) => void;
  setEmergencyStop: (stop: boolean) => void;
  setConnected: (connected: boolean) => void;

  // Compatibility Actions
  startSimulation: () => void;
  pauseSimulation: () => void;
  resetSimulation: () => void;
  setSimulationSpeed: (speed: any) => void;
  addMission: (mission: any) => void;
  updateMissionStatus: (id: string, status: any, reason?: string) => void;
  addRoute: (name: string) => string;
  addWaypoint: (routeId: string, waypoint: any) => void;
  removeWaypoint: (routeId: string, waypointId: string) => void;
  reorderWaypoints: (routeId: string, waypoints: any[]) => void;
  deployScout: (id: string, missionId?: string, routeId?: string) => void;
  recoverScout: (id: string) => void;
  updateObjectiveStatus: (missionId: string, objectiveId: string, status: any) => void;

  // Manual actions / utilities
  addLog: (arg1: any, arg2: any, arg3?: any, arg4?: any) => void;
  clearLogs: () => void;
}

export const useMissionStore = create<MissionStoreState>((set) => ({
  isSidebarOpen: false,
  setSidebarOpen: (open) => set({ isSidebarOpen: open }),
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),

  isConnected: false,
  isEmergencyStop: false,
  systemHealth: {
    missionServer: "OFFLINE",
    telemetryFeed: "OFFLINE",
    webSocketConnection: "OFFLINE",
    scoutNetwork: "OFFLINE",
    motherRoverLink: "OFFLINE"
  },

  layoutDensity: "comfortable",
  theme: "dark",
  setLayoutDensity: (density) => set({ layoutDensity: density }),
  setTheme: (theme) => set({ theme }),

  fleet: initialFleetData,
  telemetry: initialTelemetryData,
  map: initialMapData,
  missionControl: initialMissionControlData,
  events: [],

  // Initial compat bindings
  rovers: [],
  scouts: [],
  missions: [],
  routes: [],
  simulationConfig: { speed: "NORMAL", isRunning: false, status: "idle", refreshInterval: 5000, elapsedTime: 0 },
  telemetryHistory: {},

  setFleet: (fleet) => set((state) => {
    const hasMother = !!fleet.mother;
    return { 
      fleet, 
      rovers: [fleet.mother, ...fleet.scouts].filter(Boolean) as any[] as Rover[],
      scouts: fleet.scouts as any[] as Rover[],
      systemHealth: {
        ...state.systemHealth,
        missionServer: "ONLINE",
        webSocketConnection: "ONLINE",
        telemetryFeed: hasMother ? "ONLINE" : "OFFLINE",
        motherRoverLink: hasMother ? "ONLINE" : "OFFLINE"
      }
    };
  }),
  updateFleet: (fleet) => set((state) => {
    const hasMother = !!fleet.mother;
    return { 
      fleet, 
      rovers: [fleet.mother, ...fleet.scouts].filter(Boolean) as any[] as Rover[],
      scouts: fleet.scouts as any[] as Rover[],
      systemHealth: {
        ...state.systemHealth,
        missionServer: "ONLINE",
        webSocketConnection: "ONLINE",
        telemetryFeed: hasMother ? "ONLINE" : "OFFLINE",
        motherRoverLink: hasMother ? "ONLINE" : "OFFLINE"
      }
    };
  }),
  setTelemetry: (telemetry) => set({ telemetry, telemetryHistory: telemetry }),
  setMap: (map) => set({ map, routes: map.routes }),
  setMissionControl: (missionControl) => set({ missionControl, missions: missionControl.missions }),
  setEvents: (events) => set({ events }),
  setSystemHealth: (systemHealth) => set({ systemHealth }),
  setEmergencyStop: (isEmergencyStop) => set({ isEmergencyStop }),
  setConnected: (isConnected) => set({ isConnected }),

  // Compat action implementations
  startSimulation: () => set((state) => ({ simulationConfig: { ...state.simulationConfig, isRunning: true } })),
  pauseSimulation: () => set((state) => ({ simulationConfig: { ...state.simulationConfig, isRunning: false } })),
  resetSimulation: () => set((state) => ({ simulationConfig: { speed: "NORMAL", isRunning: false, status: "idle", refreshInterval: 5000, elapsedTime: 0 } })),
  setSimulationSpeed: (speed) => set((state) => ({ simulationConfig: { ...state.simulationConfig, speed } })),
  
  addMission: (mission) => set((state) => ({ 
    missions: [...state.missions, mission],
    missionControl: { ...state.missionControl, missions: [...state.missionControl.missions, mission] }
  })),
  updateMissionStatus: (id, status, reason) => set((state) => {
    const updated = state.missions.map(m => m.id === id ? { ...m, status } : m);
    return {
      missions: updated,
      missionControl: { ...state.missionControl, missions: updated }
    };
  }),

  addRoute: (name) => {
    const newId = `route-${Date.now()}`;
    const newRoute = { id: newId, name, waypoints: [] };
    set((state) => ({ 
      routes: [...state.routes, newRoute],
      map: { ...state.map, routes: [...state.map.routes, newRoute] }
    }));
    return newId;
  },
  addWaypoint: (routeId, waypoint) => set((state) => {
    const updatedRoutes = state.map.routes.map(r => {
      if (r.id === routeId) {
        const wpWithId = { ...waypoint, id: `wp-${Date.now()}` };
        return { ...r, waypoints: [...r.waypoints, wpWithId] };
      }
      return r;
    });
    return {
      routes: updatedRoutes,
      map: { ...state.map, routes: updatedRoutes }
    };
  }),
  removeWaypoint: (routeId, waypointId) => set((state) => {
    const updatedRoutes = state.map.routes.map(r => {
      if (r.id === routeId) {
        return { ...r, waypoints: r.waypoints.filter((w: any) => w.id !== waypointId) };
      }
      return r;
    });
    return {
      routes: updatedRoutes,
      map: { ...state.map, routes: updatedRoutes }
    };
  }),
  reorderWaypoints: (routeId, waypoints) => set((state) => {
    const updatedRoutes = state.map.routes.map(r => {
      if (r.id === routeId) {
        return { ...r, waypoints };
      }
      return r;
    });
    return {
      routes: updatedRoutes,
      map: { ...state.map, routes: updatedRoutes }
    };
  }),

  deployScout: (id, missionId, routeId) => set((state) => {
    const updatedScouts = state.fleet.scouts.map(s => s.id === id ? { ...s, status: "DEPLOYED" as const } : s);
    const updatedFleet = { ...state.fleet, scouts: updatedScouts };
    return {
      fleet: updatedFleet,
      rovers: [updatedFleet.mother, ...updatedFleet.scouts].filter(Boolean) as any[] as Rover[],
      scouts: updatedFleet.scouts as any[] as Rover[]
    };
  }),
  recoverScout: (id) => set((state) => {
    const updatedScouts = state.fleet.scouts.map(s => s.id === id ? { ...s, status: "READY" as const } : s);
    const updatedFleet = { ...state.fleet, scouts: updatedScouts };
    return {
      fleet: updatedFleet,
      rovers: [updatedFleet.mother, ...updatedFleet.scouts].filter(Boolean) as any[] as Rover[],
      scouts: updatedFleet.scouts as any[] as Rover[]
    };
  }),

  updateObjectiveStatus: (missionId, objectiveId, status) => set((state) => {
    const updatedMissions = state.missions.map(m => {
      if (m.id === missionId) {
        const updatedObjectives = m.objectives.map((o: any) => o.id === objectiveId ? { ...o, status } : o);
        return { ...m, objectives: updatedObjectives };
      }
      return m;
    });
    return {
      missions: updatedMissions,
      missionControl: { ...state.missionControl, missions: updatedMissions }
    };
  }),

  addLog: (arg1, arg2, arg3, arg4) => {
    let source = "SYSTEM";
    let category = "COMMS" as EventCategory;
    let severity = "INFO" as EventSeverity;
    let description = "";

    if (arg4 !== undefined) {
      source = arg1;
      category = arg2;
      severity = arg3;
      description = arg4;
    } else if (arg3 !== undefined) {
      source = "SYSTEM";
      category = arg1;
      severity = arg2;
      description = arg3;
    } else {
      description = arg2 || arg1;
    }

    const newEvent = createMissionEvent(source, category, severity, description);
    set((state) => ({
      events: [newEvent, ...state.events]
    }));
  },
  clearLogs: () => set({ events: [] })
}));
