import { Rover, Alert } from "./types";

export const mockRovers: Rover[] = [
  {
    id: "mother-rover",
    name: "ARES MotherShip",
    battery: 94,
    signal: 92,
    status: "online",
    temperature: -14,
    latitude: 18.6521,
    longitude: 226.2045,
    speed: 0.25,
    lastContact: "1.2s ago",
    type: "mother"
  },
  {
    id: "scout-1",
    name: "Scout-Alpha",
    battery: 38,
    signal: 68,
    status: "warning",
    temperature: 12, // slightly higher temperature in drive gear
    latitude: 18.6845,
    longitude: 226.2512,
    speed: 1.82,
    lastContact: "0.8s ago",
    type: "scout"
  },
  {
    id: "scout-2",
    name: "Scout-Beta",
    battery: 82,
    signal: 88,
    status: "online",
    temperature: -18,
    latitude: 18.6214,
    longitude: 226.1593,
    speed: 0.0,
    lastContact: "2.4s ago",
    type: "scout"
  }
];

export const mockAlerts: Alert[] = [
  {
    id: "alert-1",
    timestamp: "13:52:10 UTC",
    roverId: "scout-1",
    roverName: "Scout-Alpha",
    severity: "warning",
    message: "Battery level below 40% threshold."
  },
  {
    id: "alert-2",
    timestamp: "13:48:32 UTC",
    roverId: "scout-1",
    roverName: "Scout-Alpha",
    severity: "warning",
    message: "Sensor enclosure temperature exceeded nominal threshold (12°C)."
  },
  {
    id: "alert-3",
    timestamp: "13:45:01 UTC",
    roverId: "mother-rover",
    roverName: "ARES MotherShip",
    severity: "nominal",
    message: "Primary radio transceiver locked. Signal link stable."
  },
  {
    id: "alert-4",
    timestamp: "13:30:15 UTC",
    roverId: "scout-2",
    roverName: "Scout-Beta",
    severity: "nominal",
    message: "Completed autonomous drill sampling profile."
  },
  {
    id: "alert-5",
    timestamp: "13:12:44 UTC",
    roverId: "scout-1",
    roverName: "Scout-Alpha",
    severity: "critical",
    message: "Dust accumulation warning on auxiliary power array."
  }
];

export const mockEventLogs = [
  { timestamp: "13:52:10 UTC", level: "warning", category: "SYS", message: "Scout-Alpha: Battery reserve warning - 38%" },
  { timestamp: "13:51:04 UTC", level: "nominal", category: "NAV", message: "ARES MotherShip: Adjusting heading to 142.4° SE" },
  { timestamp: "13:48:32 UTC", level: "warning", category: "TEM", message: "Scout-Alpha: Temperature spike detected in wheel gear-set B" },
  { timestamp: "13:45:01 UTC", level: "nominal", category: "COM", message: "ARES MotherShip: High-gain antenna tracking aligned with Mars Express Orbiter" },
  { timestamp: "13:42:15 UTC", level: "nominal", category: "SYS", message: "Scout-Beta: Scientific payload diagnostic check: PASS" },
  { timestamp: "13:30:15 UTC", level: "nominal", category: "SCI", message: "Scout-Beta: Core drilling complete at sector 84-K" },
  { timestamp: "13:25:00 UTC", level: "nominal", category: "NAV", message: "Scout-Alpha: Transiting to waypoint Sector 89-L" },
  { timestamp: "13:12:44 UTC", level: "critical", category: "PWR", message: "Scout-Alpha: Solar array generation drop below 50% (Dust accumulation)" },
  { timestamp: "13:00:00 UTC", level: "nominal", category: "SYS", message: "ARES Mission: MET (Mission Elapsed Time) Day 142 synchronization complete" }
];
