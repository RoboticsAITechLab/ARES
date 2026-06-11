/**
 * @file server.ts
 * @description Entry bootstrap file creating the HTTP server and listening on the configured environment port.
 */

import { createServer } from "http";
import dotenv from "dotenv";
import app from "./app";
import { WebSocketServerManager } from "./websocket";

// Load environment configurations
dotenv.config();

const port = process.env.PORT || 3001;

const server = createServer(app);

// Initialize WebSocket server upgrade binder
const wsManager = new WebSocketServerManager();
wsManager.initialize(server);

server.listen(port, () => {
  console.log(`[ARES Ground Operations Server] Initialization complete. Listening on port ${port} in ${process.env.NODE_ENV || "development"} mode.`);
});

// Handle graceful shutdown
const gracefulShutdown = () => {
  console.log("[ARES Server] Received shutdown signal. Cleaning up resources...");
  wsManager.close();
  server.close(() => {
    console.log("[ARES Server] Server HTTP server closed. Exiting process.");
    process.exit(0);
  });
};

process.on("SIGINT", gracefulShutdown);
process.on("SIGTERM", gracefulShutdown);

