/**
 * @file server.ts
 * @description Boostrap gateway manager resolving configuration modes, database persistence, and client relays.
 */

import { createServer } from "http";
import dotenv from "dotenv";
import app from "./app";
import { WebSocketServerManager } from "./websocket";
import { VirtualRover } from "./adapters/virtual-rover";
import { MotherRoverAdapter } from "./adapters/mother-rover/motherRover.adapter";
import { MotherRoverParser } from "./adapters/mother-rover/motherRover.parser";
import { TelemetryStore } from "./modules/telemetry/telemetry.store";
import { FleetStore } from "./modules/fleet/fleet.store";
import { FleetPacket } from "./types/FleetPacket";
import { Logger } from "./logger";

dotenv.config();

const port = process.env.PORT || 3001;
const isPhysical = process.env.ROVER_MODE === "physical";

const server = createServer(app);

const wsManager = new WebSocketServerManager();
wsManager.initialize(server);

const telemetryStore = new TelemetryStore();
const fleetStore = new FleetStore();

const handleTelemetryUpdate = async (packet: FleetPacket) => {
  try {
    if (packet.mother) {
      await fleetStore.registerRover({
        id: packet.mother.id,
        name: "Mother Rover",
        type: "mother"
      });
      await telemetryStore.appendHistory(packet.mother.id, packet.mother);
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
let motherAdapter: MotherRoverAdapter | null = null;

if (isPhysical) {
  Logger.log("INFO", "SYSTEM", "Starting in PHYSICAL Rover mode.");
  const parser = new MotherRoverParser();
  motherAdapter = new MotherRoverAdapter(
    {
      host: process.env.ROVER_HOST || "192.168.4.1",
      port: parseInt(process.env.ROVER_PORT || "3002"),
      protocol: "ws"
    },
    parser,
    handleTelemetryUpdate
  );
  motherAdapter.connect();
} else {
  Logger.log("INFO", "SYSTEM", "Starting in VIRTUAL Rover mode.");
  virtualRover = new VirtualRover(handleTelemetryUpdate);
  virtualRover.startSimulator();
}

wsManager.onCommand((command, value) => {
  if (isPhysical && motherAdapter) {
    motherAdapter.sendCommand(command, value);
  } else if (virtualRover) {
    virtualRover.handleCommand(command, value);
  }
});

server.listen(port, () => {
  console.log(`[ARES Ground Operations Server] Initialization complete. Listening on port ${port} in ${process.env.NODE_ENV || "development"} mode.`);
});

const gracefulShutdown = () => {
  console.log("[ARES Server] Received shutdown signal. Cleaning up resources...");
  if (virtualRover) virtualRover.stopSimulator();
  if (motherAdapter) motherAdapter.disconnect();
  wsManager.close();
  server.close(() => {
    console.log("[ARES Server] HTTP server closed. Exiting process.");
    process.exit(0);
  });
};

process.on("SIGINT", gracefulShutdown);
process.on("SIGTERM", gracefulShutdown);
