/**
 * @file FleetPacket.ts
 * @description Type definition representing the aggregated fleet state containing both Mother and Scout rovers.
 */

import { MotherRoverPacket } from "./MotherRoverPacket";
import { ScoutRoverPacket } from "./ScoutRoverPacket";

export interface FleetPacket {
  mother: MotherRoverPacket;
  scouts: ScoutRoverPacket[];
}
