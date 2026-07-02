/**
 * @file server.ts
 * @description Bootstrap gateway manager resolving configuration modes, database persistence, and client relays.
 */

import { createServer } from "http";
import dotenv from "dotenv";
import app from "./app";
import { WebSocketServerManager } from "./websocket";
import { VirtualRover } from "./adapters/virtual-rover";
import { MotherRoverParser } from "./adapters/mother-rover/motherRover.parser";
import { TelemetryStore } from "./modules/telemetry/telemetry.store";
import { FleetStore } from "./modules/fleet/fleet.store";
import { FleetPacket } from "./types/FleetPacket";
import { Logger } from "./logger";
import { prisma } from "./prisma";

dotenv.config();

const port = process.env.PORT || 3001;
const isPhysical = process.env.ROVER_MODE === "physical";

const server = createServer(app);

const wsManager = new WebSocketServerManager();
wsManager.initialize(server);

// Share wsManager instance with HTTP API router
(app as any).wsManager = wsManager;

const telemetryStore = new TelemetryStore();
const fleetStore = new FleetStore();

const handleTelemetryUpdate = async (packet: FleetPacket) => {
  try {
    if (packet.mother) {
      const m = packet.mother as any;
      // Upsert the detailed rover telemetry fields into the DB
      await prisma.rover.upsert({
        where: { id: m.id },
        update: {
          battery: m.battery,
          signal: m.signal,
          temperature: m.temperature,
          speed: m.speed,
          lastContact: new Date(),
          firmwareVersion: m.firmwareVersion || "1.0.0",
          bootReason: m.bootReason || "poweron",
          lastCrash: m.lastCrash || "",
          rollbackCount: m.rollbackCount || 0,
          otaStatus: m.otaStatus || "idle",
          safeMode: m.safeMode || false
        },
        create: {
          id: m.id,
          name: m.id === "mother-rover" ? "Mother Rover" : m.id,
          type: m.id.toLowerCase().includes("scout") ? "scout" : "mother",
          status: "READY",
          battery: m.battery,
          signal: m.signal,
          temperature: m.temperature,
          speed: m.speed,
          firmwareVersion: m.firmwareVersion || "1.0.0",
          bootReason: m.bootReason || "poweron",
          lastCrash: m.lastCrash || "",
          rollbackCount: m.rollbackCount || 0,
          otaStatus: m.otaStatus || "idle",
          safeMode: m.safeMode || false
        }
      });

      // Append standard historical data
      await telemetryStore.appendHistory(packet.mother.id, packet.mother);
    }
    
    if (packet.scouts && Array.isArray(packet.scouts)) {
      for (const s of packet.scouts) {
        await prisma.rover.upsert({
          where: { id: s.id },
          update: {
            battery: s.battery,
            signal: s.signal,
            temperature: s.temperature,
            speed: s.speed,
            lastContact: new Date()
          },
          create: {
            id: s.id,
            name: s.id,
            type: "scout",
            status: s.status || "ACTIVE",
            battery: s.battery,
            signal: s.signal,
            temperature: s.temperature,
            speed: s.speed
          }
        });
        await telemetryStore.appendHistory(s.id, s);
      }
    }
  } catch (err) {
    console.error("[Database] Failed to persist telemetry packet:", err);
  }

  wsManager.broadcast({
    type: "fleet_update",
    data: packet,
    timestamp: Date.now()
  });
};

let virtualRover: VirtualRover | null = null;
const parser = new MotherRoverParser();

// Always setup telemetry parser to route physical telemetry if it is received
wsManager.onTelemetry((data) => {
  const packet = parser.parsePacket(JSON.stringify(data));
  if (packet) {
    handleTelemetryUpdate(packet);
    // If we receive actual telemetry from the physical rover, stop the virtual simulator
    if (virtualRover) {
      console.log("[SYSTEM] Physical telemetry received. Stopping virtual simulator.");
      virtualRover.stopSimulator();
      virtualRover = null;
    }
  }
});

if (isPhysical) {
  Logger.log("INFO", "SYSTEM", "Starting in PHYSICAL Rover mode (Cloud Router).");
} else {
  Logger.log("INFO", "SYSTEM", "Starting in VIRTUAL Rover mode.");
  virtualRover = new VirtualRover(handleTelemetryUpdate);
  virtualRover.startSimulator();
}

wsManager.onCommand((command, value, target) => {
  // If the target physical rover is connected, prioritize sending commands to it
  if (wsManager.isRoverConnected(target)) {
    wsManager.sendCommandToRover(command, value, target);
  } else if (isPhysical) {
    wsManager.sendCommandToRover(command, value, target);
  } else if (virtualRover) {
    virtualRover.handleCommand(command, value, target);
  }
});

server.listen(port, () => {
  console.log(`[ARES Ground Operations Server] Initialization complete. Listening on port ${port} in ${process.env.NODE_ENV || "development"} mode.`);
});

const gracefulShutdown = () => {
  console.log("[ARES Server] Received shutdown signal. Cleaning up resources...");
  if (virtualRover) virtualRover.stopSimulator();
  wsManager.close();
  server.close(() => {
    console.log("[ARES Server] HTTP server closed. Exiting process.");
    process.exit(0);
  });
};

process.on("SIGINT", gracefulShutdown);
process.on("SIGTERM", gracefulShutdown);
