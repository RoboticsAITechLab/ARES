/**
 * @file missionControl.store.ts
 * @description Data store skeleton for ARES Mission Control states.
 */

import { MissionState } from "./missionControl.types";

export class MissionControlStore {
  private activeMissions: Map<string, MissionState> = new Map();

  public getMission(id: string): MissionState | undefined {
    return this.activeMissions.get(id);
  }

  public setMission(id: string, mission: MissionState): void {
    this.activeMissions.set(id, mission);
  }
}
