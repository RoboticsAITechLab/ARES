/**
 * @file missionControl.types.ts
 * @description Type definitions for ARES Mission Control state and objective metadata.
 */

export interface MissionObjective {
  id: string;
  label: string;
  status: "PENDING" | "ACTIVE" | "COMPLETED" | "FAILED";
  description?: string;
}

export interface MissionState {
  id: string;
  name: string;
  description: string;
  status: "DRAFT" | "PLANNED" | "READY" | "LAUNCHED" | "ACTIVE" | "PAUSED" | "COMPLETED" | "FAILED" | "ABORTED" | "ARCHIVED";
  priority: "LOW" | "MEDIUM" | "HIGH";
  duration: number;
  objectives: MissionObjective[];
  assignedRoverIds: string[];
}
