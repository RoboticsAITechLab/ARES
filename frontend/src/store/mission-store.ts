import { create } from "zustand";
import { Fleet } from "../types/Fleet";
import { TelemetryData } from "../types/Telemetry";
import { MapState } from "../types/MapState";
import { MissionControlState } from "../types/MissionControlState";
import { MissionEvent, EventCategory, EventSeverity, createMissionEvent } from "../domain/events/types";
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

  // Setters
  setFleet: (fleet: Fleet) => void;
  setTelemetry: (telemetry: TelemetryData) => void;
  setMap: (map: MapState) => void;
  setMissionControl: (missionControl: MissionControlState) => void;
  setEvents: (events: MissionEvent[]) => void;
  setSystemHealth: (health: SystemHealthState) => void;
  setEmergencyStop: (stop: boolean) => void;
  setConnected: (connected: boolean) => void;

  // Manual actions / utilities
  addLog: (source: string, category: EventCategory, severity: EventSeverity, description: string) => void;
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

  setFleet: (fleet) => set({ fleet }),
  setTelemetry: (telemetry) => set({ telemetry }),
  setMap: (map) => set({ map }),
  setMissionControl: (missionControl) => set({ missionControl }),
  setEvents: (events) => set({ events }),
  setSystemHealth: (systemHealth) => set({ systemHealth }),
  setEmergencyStop: (isEmergencyStop) => set({ isEmergencyStop }),
  setConnected: (isConnected) => set({ isConnected }),

  addLog: (source, category, severity, description) => {
    const newEvent = createMissionEvent(source, category, severity, description);
    set((state) => ({
      events: [newEvent, ...state.events]
    }));
  },
  clearLogs: () => set({ events: [] })
}));
