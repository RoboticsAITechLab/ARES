/**
 * @file server.ts
 * @description Entry bootstrap file creating the HTTP server and listening on the configured environment port.
 */

import { createServer } from "http";
import dotenv from "dotenv";
import app from "./app";

// Load environment configurations
dotenv.config();

const port = process.env.PORT || 3001;

const server = createServer(app);

server.listen(port, () => {
  console.log(`[ARES Ground Operations Server] Initialization complete. Listening on port ${port} in ${process.env.NODE_ENV || "development"} mode.`);
});
