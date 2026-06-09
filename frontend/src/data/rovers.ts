import { Rover } from "../domain/rovers/types";

export const initialRovers: Rover[] = [
  {
    id: "mother-rover",
    name: "ARES MotherShip",
    battery: 94,
    signal: 92,
    status: "EXPLORING",
    temperature: -14,
    latitude: 18.6521,
    longitude: 226.2045,
    speed: 0.25,
    lastContact: "1.2s ago",
    type: "mother",
    cpu: 28,
    memory: 44,
    linkQuality: 98,
    health: 97,
    stateHistory: [
      { timestamp: "12:00:00 UTC", state: "READY", reason: "Pre-launch checks OK" },
      { timestamp: "12:05:00 UTC", state: "EXPLORING", reason: "Surface mission active" }
    ],
    currentMissionId: "mission-1",
    lastHeartbeat: "12:05:00 UTC",
    healthScore: 97
  },
  {
    id: "scout-1",
    name: "Scout-Alpha",
    battery: 38,
    signal: 68,
    status: "READY",
    temperature: 12,
    latitude: 18.6845,
    longitude: 226.2512,
    speed: 0.0,
    lastContact: "0.8s ago",
    type: "scout",
    cpu: 10,
    memory: 24,
    linkQuality: 82,
    health: 89,
    stateHistory: [
      { timestamp: "12:00:00 UTC", state: "IDLE", reason: "Telemetry synced" },
      { timestamp: "12:15:00 UTC", state: "READY", reason: "Scout deployment checklist complete" }
    ],
    lastHeartbeat: "12:15:00 UTC",
    healthScore: 89
  },
  {
    id: "scout-2",
    name: "Scout-Beta",
    battery: 82,
    signal: 88,
    status: "EXPLORING",
    temperature: -18,
    latitude: 18.6214,
    longitude: 226.1593,
    speed: 0.0,
    lastContact: "2.4s ago",
    type: "scout",
    cpu: 12,
    memory: 36,
    linkQuality: 92,
    health: 99,
    stateHistory: [
      { timestamp: "12:00:00 UTC", state: "READY", reason: "Node online" },
      { timestamp: "12:10:00 UTC", state: "EXPLORING", reason: "Surveying Jezero slopes" }
    ],
    currentMissionId: "mission-1",
    lastHeartbeat: "12:10:00 UTC",
    healthScore: 99
  },
  {
    id: "scout-3",
    name: "Scout-Gamma",
    battery: 100,
    signal: 95,
    status: "IDLE",
    temperature: -24,
    latitude: 18.6521,
    longitude: 226.2045,
    speed: 0.0,
    lastContact: "10.5s ago",
    type: "scout",
    cpu: 2,
    memory: 15,
    linkQuality: 95,
    health: 100,
    stateHistory: [
      { timestamp: "11:50:00 UTC", state: "IDLE", reason: "RTG charged" }
    ],
    lastHeartbeat: "11:50:00 UTC",
    healthScore: 100
  }
];
