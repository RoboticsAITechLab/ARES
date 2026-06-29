/**
 * @file app.ts
 * @description Core Express application setup, registering CORS, telemetry DB endpoints, and ARES OTA/fleet APIs.
 */

import express from "express";
import cors from "cors";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import { prisma } from "./prisma";
import { Logger } from "./logger";

const app = express();

app.use(cors());
app.use(express.json());

// API Key / Device Secret middleware for Rover API endpoints
const authenticateRover = async (req: express.Request, res: express.Response, next: express.NextFunction): Promise<any> => {
  const roverId = req.headers["x-rover-id"] as string;
  const apiKey = req.headers["x-api-key"] as string;

  if (!roverId || !apiKey) {
    return res.status(401).json({ error: "Missing x-rover-id or x-api-key header authentication credentials." });
  }

  try {
    const rover = await prisma.rover.findUnique({
      where: { id: roverId }
    });

    if (!rover || rover.apiKey !== apiKey) {
      console.warn(`[AUTH] Unauthorized access attempt for rover ID: ${roverId}`);
      await prisma.roverEvent.create({
        data: {
          roverId: roverId || "unknown",
          eventType: "Crash",
          message: `Failed authentication attempt from IP: ${req.ip}`
        }
      });
      return res.status(401).json({ error: "Unauthorized: Invalid Rover ID or API Key." });
    }

    (req as any).rover = rover;
    next();
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// Ground control authorization check
const authorizeController = (req: express.Request, res: express.Response, next: express.NextFunction): any => {
  const authHeader = req.headers["authorization"];
  if (authHeader !== "Bearer ares_auth_secret") {
    return res.status(401).json({ error: "Unauthorized: Invalid ground control authorization credentials." });
  }
  next();
};

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "ares-backend",
    timestamp: Date.now()
  });
});

app.get("/goal", (req, res) => {
  res.send(`
    <html>
      <body style="font-family: monospace; background: #050811; color: #a5f3fc; padding: 40px; text-align: center; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 80vh;">
        <h1 style="color: #f43f5e; font-size: 24px; letter-spacing: 2px;">ARES SYSTEM HUB</h1>
        <p style="color: #94a3b8; font-size: 13px; max-width: 500px; line-height: 1.6;">
          <strong>Notice:</strong> <code>/goal</code> is a Chat Slash Command designed for the IDE chat interface, not a web endpoint. 
          To execute overnight runs, type <code>/goal</code> directly in your agent chat window.
        </p>
        <br/>
        <a href="http://localhost:3000" style="color: #06b6d4; text-decoration: none; border: 1px solid rgba(6,182,212,0.4); padding: 8px 16px; border-radius: 4px; font-weight: bold; background: rgba(6,182,212,0.05); font-size: 11px; letter-spacing: 1px;">RETURN TO OPERATIONS DASHBOARD</a>
      </body>
    </html>
  `);
});

// Original endpoint kept for backward compatibility
app.post("/upload-firmware", express.raw({ type: "application/octet-stream", limit: "8mb" }), async (req: any, res: any) => {
  const version = req.headers["x-firmware-version"] as string;
  const authSecret = req.headers["authorization"] as string;

  if (authSecret !== "Bearer ares_auth_secret") {
    return res.status(401).json({ error: "Unauthorized: Invalid authorization header credentials." });
  }

  if (!version) {
    return res.status(400).json({ error: "Missing x-firmware-version header" });
  }

  const binary = req.body as Buffer;
  if (!binary || binary.length === 0) {
    return res.status(400).json({ error: "Empty binary payload" });
  }

  const checksum = crypto.createHash("sha256").update(binary).digest("hex");
  const uploadDir = path.join(__dirname, "../uploads");
  
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const filePath = path.join(uploadDir, `firmware-${version}.bin`);
  
  try {
    fs.writeFileSync(filePath, binary);
    
    const release = await prisma.firmwareRelease.upsert({
      where: { version },
      update: { checksum, filePath, signature: "" },
      create: { version, checksum, filePath, signature: "", description: `Uploaded release version ${version}` }
    });

    await Logger.log("INFO", "SYSTEM", `Registered new firmware release version: ${version} (checksum: ${checksum})`);
    res.json({ status: "success", version, checksum, release });
  } catch (err: any) {
    await Logger.log("CRITICAL", "SYSTEM", `Failed storing firmware release: ${err.message}`);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/ota/latest
app.get("/api/ota/latest", async (req, res): Promise<any> => {
  const channel = (req.query.channel as string) || "stable";
  try {
    const latest = await prisma.firmwareRelease.findFirst({
      where: { channel },
      orderBy: { uploadedAt: "desc" }
    });
    if (!latest) {
      return res.status(404).json({ error: `No firmware found for channel: ${channel}` });
    }
    res.json(latest);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/ota/check (Used by rovers to check for updates)
app.get("/api/ota/check", authenticateRover, async (req: any, res: any) => {
  const rover = req.rover;
  try {
    // If targetVersion is locked specifically for this rover, prioritize it
    let target = rover.targetVersion;
    let release = null;

    if (target) {
      release = await prisma.firmwareRelease.findUnique({
        where: { version: target }
      });
    } else {
      // Find latest release on rover's updateChannel
      release = await prisma.firmwareRelease.findFirst({
        where: { channel: rover.updateChannel },
        orderBy: { uploadedAt: "desc" }
      });
    }

    if (!release) {
      return res.json({ updateAvailable: false, message: "No compatible releases found" });
    }

    const updateAvailable = release.version !== rover.firmwareVersion;
    res.json({
      updateAvailable,
      version: release.version,
      checksum: release.checksum,
      signature: release.signature,
      url: `/uploads/${path.basename(release.filePath)}`,
      updateWindow: rover.updateWindow,
      allowMissionUpdate: rover.allowMissionUpdate
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Serve firmware files statically
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// POST /api/ota/upload (Signed & Channeled Upload)
app.post("/api/ota/upload", authorizeController, async (req: any, res: any) => {
  const { version, checksum, signature, filePath, description, channel } = req.body;
  if (!version || !checksum || !signature || !filePath) {
    return res.status(400).json({ error: "Missing required fields: version, checksum, signature, filePath" });
  }

  try {
    const release = await prisma.firmwareRelease.upsert({
      where: { version },
      update: { checksum, signature, filePath, description, channel: channel || "stable" },
      create: { version, checksum, signature, filePath, description, channel: channel || "stable" }
    });
    res.json({ status: "success", release });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Helper command trigger
const triggerRoverCommand = (appInstance: any, roverId: string, command: string, value: any): boolean => {
  const wsManager = appInstance.wsManager;
  if (!wsManager) return false;
  
  if (roverId === "all") {
    wsManager.broadcast({
      type: "rover_command",
      command,
      value,
      token: "ares_auth_secret",
      timestamp: Date.now()
    } as any);
    return true;
  }

  wsManager.sendCommandToRover(command, value);
  return true;
};

// POST /api/ota/rollback
app.post("/api/ota/rollback", authorizeController, async (req: any, res: any) => {
  const { roverId } = req.body;
  if (!roverId) return res.status(400).json({ error: "Missing roverId" });
  
  try {
    await prisma.roverEvent.create({
      data: { roverId, eventType: "OTA Rollback", message: "Rollback command triggered from dashboard" }
    });
    triggerRoverCommand(req.app, roverId, "rollback", "");
    res.json({ status: "acknowledged" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/ota/reboot
app.post("/api/ota/reboot", authorizeController, async (req: any, res: any) => {
  const { roverId } = req.body;
  if (!roverId) return res.status(400).json({ error: "Missing roverId" });

  try {
    await prisma.roverEvent.create({
      data: { roverId, eventType: "Reboot", message: "Reboot command triggered from dashboard" }
    });
    triggerRoverCommand(req.app, roverId, "reboot", "");
    res.json({ status: "acknowledged" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/ota/factory-reset
app.post("/api/ota/factory-reset", authorizeController, async (req: any, res: any) => {
  const { roverId } = req.body;
  if (!roverId) return res.status(400).json({ error: "Missing roverId" });

  try {
    await prisma.roverEvent.create({
      data: { roverId, eventType: "Factory Reset", message: "Factory reset command triggered from dashboard" }
    });
    triggerRoverCommand(req.app, roverId, "factory_reset", "");
    res.json({ status: "acknowledged" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/ota/config
app.post("/api/ota/config", authorizeController, async (req: any, res: any) => {
  const { roverId, updateWindow, allowMissionUpdate, motorSpeed, servoLimits, cameraQuality, sensorEnable } = req.body;
  if (!roverId) return res.status(400).json({ error: "Missing roverId" });

  try {
    const updatedRover = await prisma.rover.update({
      where: { id: roverId },
      data: {
        updateWindow,
        allowMissionUpdate,
        speed: motorSpeed !== undefined ? parseFloat(motorSpeed) : undefined
      }
    });

    await prisma.roverEvent.create({
      data: { 
        roverId, 
        eventType: "Configuration Change", 
        message: `Config updated: speed=${motorSpeed}, window=${updateWindow}` 
      }
    });

    triggerRoverCommand(req.app, roverId, "config_update", {
      updateWindow,
      allowMissionUpdate,
      motorSpeed,
      servoLimits,
      cameraQuality,
      sensorEnable
    });

    res.json({ status: "acknowledged", rover: updatedRover });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/ota/diagnostics
app.post("/api/ota/diagnostics", authorizeController, async (req: any, res: any) => {
  const { roverId } = req.body;
  if (!roverId) return res.status(400).json({ error: "Missing roverId" });

  try {
    await prisma.roverEvent.create({
      data: { roverId, eventType: "Diagnostics Result", message: "Triggered remote self-diagnostics" }
    });
    triggerRoverCommand(req.app, roverId, "diagnostics", "");
    res.json({ status: "acknowledged" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/ota/history
app.get("/api/ota/history", async (req, res) => {
  const roverId = req.query.roverId as string;
  try {
    const history = await prisma.roverEvent.findMany({
      where: roverId ? { roverId } : undefined,
      orderBy: { timestamp: "desc" }
    });
    res.json(history);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/ota/rovers (Fleet query for dashboard)
app.get("/api/ota/rovers", async (req, res) => {
  try {
    const rovers = await prisma.rover.findMany({
      include: {
        telemetries: {
          orderBy: { timestamp: "desc" },
          take: 1
        }
      }
    });
    res.json(rovers);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/ota/rollout
app.post("/api/ota/rollout", authorizeController, async (req, res): Promise<any> => {
  const { mode, target, version } = req.body; // mode: 'single' | 'group' | 'fleet'
  if (!mode || !target || !version) {
    return res.status(400).json({ error: "Missing mode, target, or version" });
  }

  try {
    let updateFilter = {};
    if (mode === "single") {
      updateFilter = { id: target };
    } else if (mode === "group") {
      updateFilter = { group: target };
    } else if (mode === "fleet") {
      updateFilter = {};
    }

    await prisma.rover.updateMany({
      where: updateFilter,
      data: { targetVersion: version }
    });

    // Notify rovers that update is ready
    triggerRoverCommand(req.app, "all", "ota_trigger", { version });

    res.json({ status: "success", message: `Rollout initiated to ${mode}: ${target} for version ${version}` });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default app;
