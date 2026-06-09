/**
 * @file motherRover.adapter.ts
 * @description Adapter skeleton for managing UDP/TCP hardware connection sockets with the Mother Rover.
 */

import { MotherRoverConnectionConfig } from "./motherRover.types";
import { MotherRoverParser } from "./motherRover.parser";

export class MotherRoverAdapter {
  constructor(
    private readonly config: MotherRoverConnectionConfig,
    private readonly parser: MotherRoverParser
  ) {}

  public connect(): void {
    // Socket connection setup skeleton
  }

  public disconnect(): void {
    // Socket teardown skeleton
  }
}
