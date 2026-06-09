import { Mission } from "../domain/missions/types";

export const initialMissions: Mission[] = [
  {
    id: "mission-1",
    name: "Jezero Crater Survey IV",
    description: "Map and sample Martian delta deposits along the Jezero Crater western edge.",
    priority: "HIGH",
    status: "ACTIVE",
    duration: 120, // 120 Sols
    assignedRoverIds: ["mother-rover", "scout-2"],
    stateHistory: [
      { timestamp: "12:00:00 UTC", state: "DRAFT", reason: "Initial mission scope defined" },
      { timestamp: "12:05:00 UTC", state: "PLANNED", reason: "Route planning complete" },
      { timestamp: "12:10:00 UTC", state: "READY", reason: "Vehicles initialized" },
      { timestamp: "12:15:00 UTC", state: "ACTIVE", reason: "Launch sequence confirmed by Ground Ops" }
    ],
    creationTime: "12:00:00 UTC",
    launchTime: "12:15:00 UTC",
    createdBy: "FlightDirector_A",
    assignedOperator: "Operator_Beta",
    lastModifiedBy: "SystemAuto",
    objectives: [
      { id: "obj-1", label: "Perform terrain laser scan", status: "COMPLETED", description: "Completed delta scan." },
      { id: "obj-2", label: "Collect drill core samples", status: "ACTIVE", description: "Collect 10 core drills." },
      { id: "obj-3", label: "Deploy Scout communications relay", status: "PENDING", description: "Deploy relayer scout." }
    ]
  },
  {
    id: "mission-2",
    name: "Scout Relay Setup",
    description: "Launch Scout relays to secure communications grid for delta valley traversal.",
    priority: "MEDIUM",
    status: "READY",
    duration: 48,
    assignedRoverIds: ["scout-1"],
    stateHistory: [
      { timestamp: "09:00:00 UTC", state: "DRAFT", reason: "Mission draft complete" },
      { timestamp: "09:30:00 UTC", state: "READY", reason: "DSN band sync verified" }
    ],
    creationTime: "09:00:00 UTC",
    createdBy: "FlightDirector_A",
    assignedOperator: "Operator_Alpha",
    lastModifiedBy: "FlightDirector_A",
    objectives: [
      { id: "obj-2-1", label: "Transit Scout to relay Sector 5", status: "PENDING", description: "Position Scout." },
      { id: "obj-2-2", label: "Broadside communications lock", status: "PENDING", description: "Deploy HGA array." }
    ]
  }
];
