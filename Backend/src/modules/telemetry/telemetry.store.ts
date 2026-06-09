/**
 * @file telemetry.store.ts
 * @description Data store skeleton for keeping buffers of historical telemetry data.
 */

import { TelemetryState, TelemetryPoint } from "./telemetry.types";

export class TelemetryStore {
  private historyLogs: Map<string, TelemetryPoint[]> = new Map();

  public getHistory(roverId: string): TelemetryPoint[] {
    return this.historyLogs.get(roverId) || [];
  }

  public appendHistory(roverId: string, point: TelemetryPoint): void {
    const logs = this.getHistory(roverId);
    logs.push(point);
    this.historyLogs.set(roverId, logs.slice(-100)); // Buffer limit
  }
}
