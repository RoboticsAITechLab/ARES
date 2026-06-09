/**
 * @file MissionControlState.ts
 * @description Type definition representing mission control operation metadata and current active mission context.
 */

import { Mission } from "../domain/missions/types";

export interface MissionControlState {
  currentMission: Mission | null;
  missions: Mission[];
}
