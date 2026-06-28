/**
 * @file telemetry.store.ts
 * @description Data store mapping historical telemetry logs to SQLite via Prisma.
 */

import { TelemetryPoint } from "./telemetry.types";
import { prisma } from "../../prisma";

export class TelemetryStore {
  public async getHistory(roverId: string): Promise<TelemetryPoint[]> {
    const logs = await prisma.telemetry.findMany({
      where: { roverId },
      orderBy: { timestamp: "desc" },
      take: 100
    });
    return logs.reverse().map((log) => ({
      sol: 142,
      battery: log.batteryPercent,
      signal: log.signalRssi,
      temperature: 24, // Approximation
      speed: log.speed,
      timestamp: log.timestamp.getTime()
    }));
  }

  public async appendHistory(roverId: string, point: any): Promise<void> {
    await prisma.telemetry.create({
      data: {
        roverId,
        batteryPercent: point.batteryPercent ?? point.battery ?? 0,
        batteryVoltage: point.batteryVoltage ?? 12.0,
        signalRssi: point.signalRssi ?? point.signal ?? 0,
        obstacleDistance: point.obstacleDistance ?? 100.0,
        pitch: point.pitch ?? 0,
        roll: point.roll ?? 0,
        yaw: point.yaw ?? 0,
        speed: point.speed ?? 0,
        timestamp: new Date(point.timestamp ?? Date.now())
      }
    });
  }
}
