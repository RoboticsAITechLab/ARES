/**
 * @file Fleet.ts
 * @description Type definition representing the aggregated fleet state containing both Mother and Scout rovers.
 */

import { MotherRover } from "./MotherRover";
import { ScoutRover } from "./ScoutRover";

export interface Fleet {
  mother: MotherRover | null;
  scouts: ScoutRover[];
}
