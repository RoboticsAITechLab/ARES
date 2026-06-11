/**
 * @file server.ts
 * @description Entry bootstrap file creating the HTTP server and listening on the configured environment port.
 */

import { createServer } from "http";
import dotenv from "dotenv";
import app from "./app";
import { WebSocketServerManager } from "./websocket";
import { VirtualRover } from "./adapters/virtual-rover";

// Load environment configurations
dotenv.config();

const port = process.env.PORT || 3001;

const server = createServer(app);

// Initialize WebSocket server upgrade binder
const wsManager = new WebSocketServerManager();
wsManager.initialize(server);

// Initialize and start Virtual Rover simulation
const virtualRover = new VirtualRover((packet) => {
  wsManager.broadcast({
    type: "fleet_update",
    data: packet,
    timestamp: Date.now()
  });
});
virtualRover.startSimulator();

server.listen(port, () => {
  console.log(`[ARES Ground Operations Server] Initialization complete. Listening on port ${port} in ${process.env.NODE_ENV || "development"} mode.`);
});

// Handle graceful shutdown
const gracefulShutdown = () => {
  console.log("[ARES Server] Received shutdown signal. Cleaning up resources...");
  virtualRover.stopSimulator();
  wsManager.close();
  server.close(() => {
    console.log("[ARES Server] Server HTTP server closed. Exiting process.");
    process.exit(0);
  });
};


process.on("SIGINT", gracefulShutdown);
process.on("SIGTERM", gracefulShutdown);

