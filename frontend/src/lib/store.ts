import { create } from "zustand";
import { Rover, Alert } from "./types";
import { mockRovers, mockAlerts, mockEventLogs } from "./mock-data";

export type HealthStatus = "ONLINE" | "DEGRADED" | "OFFLINE" | "UNKNOWN";

export interface SystemHealthState {
  missionServer: HealthStatus;
  telemetryFeed: HealthStatus;
  webSocketConnection: HealthStatus;
  scoutNetwork: HealthStatus;
  motherRoverLink: HealthStatus;
}

interface MissionState {
  // UI states
  isSidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;

  // Simulator / Action states
  isConnected: boolean;
  isSyncing: boolean;
  isRefreshing: boolean;
  isEmergencyStop: boolean;

  // Telemetry data streams
  rovers: Rover[];
  alerts: Alert[];
  logs: { timestamp: string; level: string; category: string; message: string }[];
  systemHealth: SystemHealthState;

  // Actions
  refreshTelemetry: () => Promise<void>;
  syncData: () => Promise<void>;
  triggerEmergencyStop: () => void;
  addLog: (level: string, category: string, message: string) => void;
  addAlert: (alert: Omit<Alert, "id" | "timestamp">) => void;
  setRoverCoords: (id: string, lat: number, lon: number) => void;
}

export const useMissionStore = create<MissionState>((set, get) => ({
  isSidebarOpen: false,
  setSidebarOpen: (open) => set({ isSidebarOpen: open }),
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),

  isConnected: true,
  isSyncing: false,
  isRefreshing: false,
  isEmergencyStop: false,

  rovers: mockRovers,
  alerts: mockAlerts,
  logs: mockEventLogs,
  systemHealth: {
    missionServer: "ONLINE",
    telemetryFeed: "ONLINE",
    webSocketConnection: "ONLINE",
    scoutNetwork: "ONLINE",
    motherRoverLink: "ONLINE",
  },

  addLog: (level, category, message) => {
    const timeStr = new Date().toISOString().split("T")[1].slice(0, 8) + " UTC";
    set((state) => ({
      logs: [{ timestamp: timeStr, level, category, message }, ...state.logs],
    }));
  },

  addAlert: (alertInput) => {
    const timeStr = new Date().toISOString().split("T")[1].slice(0, 8) + " UTC";
    const newAlert: Alert = {
      ...alertInput,
      id: `alert-${Date.now()}`,
      timestamp: timeStr,
    };
    set((state) => ({
      alerts: [newAlert, ...state.alerts],
    }));
  },

  setRoverCoords: (id, lat, lon) => {
    set((state) => ({
      rovers: state.rovers.map((r) =>
        r.id === id ? { ...r, latitude: lat, longitude: lon } : r
      ),
    }));
  },

  refreshTelemetry: async () => {
    if (get().isRefreshing) return;
    set({ isRefreshing: true });

    // Simulate minor network latency
    await new Promise((resolve) => setTimeout(resolve, 600));

    const isEmergency = get().isEmergencyStop;

    set((state) => {
      const updatedRovers = state.rovers.map((rover) => {
        if (isEmergency) {
          // In emergency mode, speeds drop to 0 and battery depletes slightly
          return {
            ...rover,
            speed: 0,
            battery: Math.max(0, rover.battery - 0.5),
            cpu: Math.min(100, Math.floor(rover.cpu * 0.9)),
            temperature: Math.max(-50, Math.min(80, rover.temperature + (Math.random() * 2 - 1))),
          };
        }

        // Normal random jitter simulation
        const speedDelta = (Math.random() * 0.4 - 0.2);
        const newSpeed = Math.max(0, parseFloat((rover.speed + speedDelta).toFixed(2)));
        
        // Minor telemetry updates
        const batDelta = Math.random() > 0.7 ? -1 : 0;
        const newBat = Math.max(0, rover.battery + batDelta);
        
        const sigDelta = Math.floor(Math.random() * 5 - 2);
        const newSig = Math.max(10, Math.min(100, rover.signal + sigDelta));

        // Coordinate adjustments based on velocity
        const latJitter = (Math.random() * 0.001 - 0.0005) * (newSpeed > 0 ? 1 : 0.1);
        const lonJitter = (Math.random() * 0.001 - 0.0005) * (newSpeed > 0 ? 1 : 0.1);
        const newLat = parseFloat((rover.latitude + latJitter).toFixed(5));
        const newLon = parseFloat((rover.longitude + lonJitter).toFixed(5));

        return {
          ...rover,
          speed: newSpeed,
          battery: newBat,
          signal: newSig,
          latitude: newLat,
          longitude: newLon,
          cpu: Math.max(5, Math.min(99, rover.cpu + Math.floor(Math.random() * 11 - 5))),
          memory: Math.max(10, Math.min(99, rover.memory + Math.floor(Math.random() * 5 - 2))),
          linkQuality: Math.max(10, Math.min(100, newSig + Math.floor(Math.random() * 5 - 2))),
          temperature: Math.max(-100, Math.min(150, rover.temperature + Math.floor(Math.random() * 3 - 1))),
        };
      });

      return { rovers: updatedRovers };
    });

    const timeStr = new Date().toISOString().split("T")[1].slice(0, 8) + " UTC";
    get().addLog(
      isEmergency ? "critical" : "nominal",
      "SYS",
      `Active telemetry packet parsed. Rover coordinates sync complete at ${timeStr}`
    );

    set({ isRefreshing: false });
  },

  syncData: async () => {
    if (get().isSyncing) return;
    set({ isSyncing: true });

    get().addLog("nominal", "COM", "Initiating Deep Space Network (DSN) uplink synchronization...");

    // Simulate orbital relay handshake latency
    await new Promise((resolve) => setTimeout(resolve, 1200));

    const isEmergency = get().isEmergencyStop;

    set((state) => ({
      isSyncing: false,
      systemHealth: {
        missionServer: "ONLINE",
        telemetryFeed: "ONLINE",
        webSocketConnection: "ONLINE",
        scoutNetwork: isEmergency ? "DEGRADED" : "ONLINE",
        motherRoverLink: isEmergency ? "OFFLINE" : "ONLINE",
      },
    }));

    get().addLog("nominal", "COM", "DSN connection synchronised. Ephemeris database synced. Frame lock: SECURE.");
  },

  triggerEmergencyStop: () => {
    const nextState = !get().isEmergencyStop;
    
    set((state) => {
      const updatedRovers = state.rovers.map((rover) => ({
        ...rover,
        speed: 0,
        status: nextState ? "critical" : rover.id === "scout-1" ? "warning" : "online",
        health: nextState ? Math.floor(rover.health * 0.8) : rover.id === "scout-1" ? 89 : 98,
      }));

      return {
        isEmergencyStop: nextState,
        rovers: updatedRovers,
        systemHealth: {
          missionServer: nextState ? "DEGRADED" : "ONLINE",
          telemetryFeed: nextState ? "DEGRADED" : "ONLINE",
          webSocketConnection: "ONLINE",
          scoutNetwork: nextState ? "DEGRADED" : "ONLINE",
          motherRoverLink: nextState ? "OFFLINE" : "ONLINE",
        },
      };
    });

    if (nextState) {
      get().addLog("critical", "SYS", "EMERGENCY ABORT SEQUENCE ENGAGED BY MANUAL OVERRIDE!");
      get().addAlert({
        roverId: "mother-rover",
        roverName: "ARES MotherShip",
        severity: "critical",
        message: "MANUAL OVERRIDE: Emergency abort sequence engaged. Fleet kinetic drive systems locked.",
      });
    } else {
      get().addLog("nominal", "SYS", "Emergency abort sequence reset. Diagnostics nominal. Directives re-enabled.");
      get().addAlert({
        roverId: "mother-rover",
        roverName: "ARES MotherShip",
        severity: "nominal",
        message: "Directives re-enabled. Fleet system lock released. Awaiting instructions.",
      });
    }
  },
}));
