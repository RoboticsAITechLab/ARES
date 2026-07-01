/**
 * @file motherRover.parser.ts
 * @description Parser for converting raw JSON bytes from the physical ESP32 to internal FleetPacket structures.
 */

import { FleetPacket } from "../../types/FleetPacket";

export class MotherRoverParser {
  public parsePacket(rawBuffer: Buffer | string): FleetPacket | null {
    try {
      const data = JSON.parse(rawBuffer.toString());
      
      // Calculate signal percentage from RSSI/wifiRssi if available
      const rssi = data.wifiRssi ?? data.signalRssi ?? -50;
      let signal = Math.max(0, Math.min(100, 2 * (rssi + 100)));

      return {
        mother: {
          id: data.roverId || "mother-rover",
          battery: data.batteryPercent ?? data.battery ?? 100,
          signal,
          temperature: data.cpuTemp ?? data.temperature ?? 24,
          speed: data.speed ?? 0.0,
          heading: data.yaw ?? 0,
          x: data.x ?? 45,
          y: data.y ?? 35,
          status: "online",
          connectedScouts: 0,
          timestamp: Date.now(),
          pitch: data.pitch ?? 0,
          roll: data.roll ?? 0,
          obstacleDistance: data.obstacleDistance ?? 150,

          // Hardened Extra Fields passed inside mother object
          firmwareVersion: data.firmwareVersion || "1.0.0",
          targetVersion: data.targetVersion || null,
          bootReason: data.bootReason || "poweron",
          lastCrash: data.lastCrash || "",
          rollbackCount: data.rollbackCount || 0,
          otaStatus: data.otaStatus || "idle",
          safeMode: data.safeMode || false,
          heapFree: data.heapFree || 0,
          uptime: data.uptime || 0
        } as any,
        scouts: Array.isArray(data.scouts) ? data.scouts.map((s: any) => ({
          id: s.id || "scout-rover",
          battery: s.battery ?? 100,
          signal: s.signal ?? 100,
          temperature: s.temperature ?? 25,
          speed: s.speed ?? 0,
          heading: s.heading ?? 0,
          x: s.x ?? 45,
          y: s.y ?? 35,
          status: s.status || "ACTIVE",
          timestamp: Date.now()
        })) : []
      };
    } catch (err) {
      console.error("[Parser] Failed to parse telemetry JSON packet:", err);
      return null;
    }
  }
}
