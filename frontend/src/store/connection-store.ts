import { create } from "zustand";

export interface ConnectionStoreState {
  connectionStatus: "connecting" | "connected" | "disconnected";
  lastHeartbeat: number | null;
  setConnectionStatus: (status: "connecting" | "connected" | "disconnected") => void;
  setLastHeartbeat: (timestamp: number | null) => void;
}

export const useConnectionStore = create<ConnectionStoreState>((set) => ({
  connectionStatus: "disconnected",
  lastHeartbeat: null,
  setConnectionStatus: (status) => set({ connectionStatus: status }),
  setLastHeartbeat: (timestamp) => set({ lastHeartbeat: timestamp }),
}));
