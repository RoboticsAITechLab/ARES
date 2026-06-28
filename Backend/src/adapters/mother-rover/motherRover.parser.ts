/**
 * @file motherRover.parser.ts
 * @description Parser for converting raw JSON bytes from the physical ESP32 to internal FleetPacket structures.
 */

import { FleetPacket } from "../../types/FleetPacket";

export class MotherRoverParser {
  public parsePacket(rawBuffer: Buffer | string): FleetPacket | null {
    try {
      const data = JSON.parse(rawBuffer.toString());
      
      // Calculate signal percentage from RSSI if available
      let signal = data.signalRssi ? Math.max(0, Math.min(100, 2 * (data.signalRssi + 100))) : 100;

      return {
        mother: {
          id: "mother-rover",
          battery: data.batteryPercent ?? 100,
          signal,
          temperature: data.temperature ?? 24,
          speed: data.speed ?? 0.0,
          heading: data.yaw ?? 0,
          x: data.x ?? 45,
          y: data.y ?? 35,
          status: "online",
          connectedScouts: 0,
          timestamp: Date.now()
        },
        scouts: []
      };
    } catch (err) {
      console.error("[Parser] Failed to parse telemetry JSON packet:", err);
      return null;
    }
  }
}
