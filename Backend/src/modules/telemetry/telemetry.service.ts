/**
 * @file telemetry.service.ts
 * @description Business logic service skeleton for processing telemetry packets.
 */

import { TelemetryStore } from "./telemetry.store";
import { TelemetryPoint } from "./telemetry.types";

export class TelemetryService {
  constructor(private readonly store: TelemetryStore) {}

  public processTelemetry(roverId: string, point: TelemetryPoint): void {
    this.store.appendHistory(roverId, point);
  }
}
