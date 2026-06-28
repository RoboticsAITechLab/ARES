/**
 * @file app.ts
 * @description Core Express application setup, registering CORS, telemetry DB endpoints, and OTA firmware receiver.
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

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "ares-backend",
    timestamp: Date.now()
  });
});

// Friendly redirect/explanation for browser /goal path hits
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

// OTA Firmware Upload Endpoint
app.post("/upload-firmware", express.raw({ type: "application/octet-stream", limit: "8mb" }), async (req: any, res: any) => {
  const version = req.headers["x-firmware-version"] as string;
  const authSecret = req.headers["authorization"] as string;

  // Simple token authorization check
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
      update: { checksum, filePath },
      create: { version, checksum, filePath, description: `Uploaded release version ${version}` }
    });

    await Logger.log("INFO", "SYSTEM", `Registered new firmware release version: ${version} (checksum: ${checksum})`);
    res.json({ status: "success", version, checksum, release });
  } catch (err: any) {
    await Logger.log("CRITICAL", "SYSTEM", `Failed storing firmware release: ${err.message}`);
    res.status(500).json({ error: err.message });
  }
});

export default app;
