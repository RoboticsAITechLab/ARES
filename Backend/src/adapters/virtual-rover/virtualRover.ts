import { FleetPacket } from "../../types/FleetPacket";
import { MotherRoverPacket } from "../../types/MotherRoverPacket";

export class VirtualRover {
  private interval: NodeJS.Timeout | null = null;
  private battery = 98.5;
  private x = 45;
  private y = 35;
  private heading = 142;
  private speed = 0.0;

  // Scout Rover simulation state
  private scoutBattery = 95.0;
  private scoutX = 40;
  private scoutY = 30;
  private scoutHeading = 180;
  private scoutSpeed = 0.0;
  private scoutStatus = "DOCKED"; // DOCKED, ACTIVE, EMERGENCY_STOP

  constructor(private readonly onUpdate: (packet: FleetPacket) => void) {}

  public startSimulator(): void {
    console.log("[ARES Virtual Rover] Starting simulation loops...");
    this.interval = setInterval(() => {
      this.tick();
    }, 5000); // Ticks every 5 seconds
  }

  public stopSimulator(): void {
    console.log("[ARES Virtual Rover] Stopping simulation loops...");
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }

  public handleCommand(command: string, value?: any, target?: string): void {
    console.log(`[ARES Virtual Rover] Executing command targeting ${target || "mother"}: ${command} with value:`, value);
    let updated = false;

    // Handle Mother vs Scout selection
    const isScout = target === "ARES-SCOUT-01";

    if (command === "deploy") {
      if (value === "deployScout") {
        this.scoutStatus = "ACTIVE";
        this.scoutBattery = 95.0;
        this.scoutX = this.x - 2; // deploy near mother rover
        this.scoutY = this.y - 2;
        updated = true;
      } else if (value === "retractScout") {
        this.scoutStatus = "DOCKED";
        this.scoutSpeed = 0.0;
        updated = true;
      }
    } else if (command === "SET_STATE" && value === "ACTIVE" && isScout) {
      this.scoutStatus = "ACTIVE";
      updated = true;
    } else if (command === "estop") {
      if (isScout) {
        this.scoutStatus = "EMERGENCY_STOP";
        this.scoutSpeed = 0.0;
      } else {
        // Mother rover is not stopped by scout commands
      }
      updated = true;
    } else if (command === "move") {
      const dir = value;
      let targetHeading = isScout ? this.scoutHeading : this.heading;
      let targetX = isScout ? this.scoutX : this.x;
      let targetY = isScout ? this.scoutY : this.y;
      let targetSpeed = isScout ? this.scoutSpeed : this.speed;

      if (dir === "forward") {
        if (targetSpeed === 0.0) targetSpeed = 0.5;
        const rad = (targetHeading * Math.PI) / 180;
        targetX = Math.max(10, Math.min(90, targetX + Math.round(Math.cos(rad) * 2)));
        targetY = Math.max(10, Math.min(90, targetY + Math.round(Math.sin(rad) * 2)));
      } else if (dir === "backward") {
        if (targetSpeed === 0.0) targetSpeed = 0.5;
        const rad = (targetHeading * Math.PI) / 180;
        targetX = Math.max(10, Math.min(90, targetX - Math.round(Math.cos(rad) * 2)));
        targetY = Math.max(10, Math.min(90, targetY - Math.round(Math.sin(rad) * 2)));
      } else if (dir === "left") {
        targetHeading = (targetHeading - 15 + 360) % 360;
      } else if (dir === "right") {
        targetHeading = (targetHeading + 15) % 360;
      } else if (dir === "forward-left") {
        if (targetSpeed === 0.0) targetSpeed = 0.5;
        targetHeading = (targetHeading - 10 + 360) % 360;
        const rad = (targetHeading * Math.PI) / 180;
        targetX = Math.max(10, Math.min(90, targetX + Math.round(Math.cos(rad) * 2)));
        targetY = Math.max(10, Math.min(90, targetY + Math.round(Math.sin(rad) * 2)));
      } else if (dir === "forward-right") {
        if (targetSpeed === 0.0) targetSpeed = 0.5;
        targetHeading = (targetHeading + 10) % 360;
        const rad = (targetHeading * Math.PI) / 180;
        targetX = Math.max(10, Math.min(90, targetX + Math.round(Math.cos(rad) * 2)));
        targetY = Math.max(10, Math.min(90, targetY + Math.round(Math.sin(rad) * 2)));
      } else if (dir === "backward-left") {
        if (targetSpeed === 0.0) targetSpeed = 0.5;
        targetHeading = (targetHeading - 10 + 360) % 360;
        const rad = (targetHeading * Math.PI) / 180;
        targetX = Math.max(10, Math.min(90, targetX - Math.round(Math.cos(rad) * 2)));
        targetY = Math.max(10, Math.min(90, targetY - Math.round(Math.sin(rad) * 2)));
      } else if (dir === "backward-right") {
        if (targetSpeed === 0.0) targetSpeed = 0.5;
        targetHeading = (targetHeading + 10) % 360;
        const rad = (targetHeading * Math.PI) / 180;
        targetX = Math.max(10, Math.min(90, targetX - Math.round(Math.cos(rad) * 2)));
        targetY = Math.max(10, Math.min(90, targetY - Math.round(Math.sin(rad) * 2)));
      }

      if (isScout) {
        this.scoutHeading = targetHeading;
        this.scoutX = targetX;
        this.scoutY = targetY;
        this.scoutSpeed = targetSpeed;
      } else {
        this.heading = targetHeading;
        this.x = targetX;
        this.y = targetY;
        this.speed = targetSpeed;
      }
      updated = true;
    } else if (command === "stop") {
      if (isScout) {
        this.scoutSpeed = 0.0;
      } else {
        this.speed = 0.0;
      }
      updated = true;
    } else if (command === "speed") {
      const percentage = parseFloat(value);
      // Map percentage (0-100) back to 0.0-2.0 speed for virtual simulation
      const speedVal = (percentage / 100) * 2.0;
      if (isScout) {
        this.scoutSpeed = Math.max(0.0, Math.min(2.0, speedVal));
      } else {
        this.speed = Math.max(0.0, Math.min(2.0, speedVal));
      }
      updated = true;
    }

    if (updated) {
      this.triggerUpdate();
    }
  }

  private triggerUpdate(): void {
    // Simulated signal noise
    const signal = Math.max(50, Math.min(100, 92 + Math.floor(Math.random() * 9 - 4)));
    // Simulated temperature fluctuation
    const temperature = Math.floor(-15 + (Math.random() * 4 - 2));

    const pitch = parseFloat((Math.sin(Date.now() / 4000) * 8 + Math.random() * 2).toFixed(1));
    const roll = parseFloat((Math.cos(Date.now() / 3000) * 5 + Math.random() * 2).toFixed(1));

    const motherPacket: MotherRoverPacket = {
      id: "mother-rover",
      battery: this.battery,
      signal,
      temperature,
      speed: this.speed,
      heading: this.heading,
      x: this.x,
      y: this.y,
      status: "online",
      connectedScouts: this.scoutStatus === "ACTIVE" ? 1 : 0,
      timestamp: Date.now(),
      pitch,
      roll,
      obstacleDistance: 150
    };

    const scoutPacket = {
      id: "ARES-SCOUT-01",
      name: "ARES-SCOUT-01",
      battery: Math.round(this.scoutBattery),
      signal: this.scoutStatus === "DOCKED" ? 0 : Math.max(40, Math.min(100, 85 + Math.floor(Math.random() * 15 - 7))),
      temperature: this.scoutStatus === "DOCKED" ? 0 : Math.floor(-18 + (Math.random() * 6 - 3)),
      x: this.scoutX,
      y: this.scoutY,
      heading: this.scoutHeading,
      speed: this.scoutSpeed,
      status: this.scoutStatus,
      type: "scout" as const,
      lastContact: new Date().toISOString(),
      cpu: this.scoutStatus === "DOCKED" ? 0 : Math.floor(20 + Math.random() * 15),
      memory: this.scoutStatus === "DOCKED" ? 0 : 38,
      linkQuality: this.scoutStatus === "DOCKED" ? 0 : Math.max(50, Math.min(100, 80 + Math.floor(Math.random() * 10))),
      health: 100,
      stateHistory: [],
      lastHeartbeat: new Date().toISOString(),
      healthScore: 100,
      timestamp: Date.now()
    };

    const fleetPacket: FleetPacket = {
      mother: motherPacket,
      scouts: [scoutPacket]
    };

    this.onUpdate(fleetPacket);
  }

  private tick(): void {
    // If moving, we advance the coordinates slightly based on heading and speed
    if (this.speed > 0) {
      const rad = (this.heading * Math.PI) / 180;
      const dx = Math.round(Math.cos(rad) * this.speed * 2);
      const dy = Math.round(Math.sin(rad) * this.speed * 2);
      this.x = Math.max(10, Math.min(90, this.x + dx));
      this.y = Math.max(10, Math.min(90, this.y + dy));
      
      // Simulated minor heading drift when moving
      this.heading = (this.heading + (Math.floor(Math.random() * 7) - 3) + 360) % 360;
    } else {
      // Simulated coordinate drift when stationary (very minimal)
      const dx = Math.floor(Math.random() * 3) - 1; // -1, 0, 1
      const dy = Math.floor(Math.random() * 3) - 1; // -1, 0, 1
      this.x = Math.max(10, Math.min(90, this.x + dx));
      this.y = Math.max(10, Math.min(90, this.y + dy));
    }

    // Advance scout coordinate if active and moving
    if (this.scoutStatus === "ACTIVE") {
      if (this.scoutSpeed > 0) {
        const rad = (this.scoutHeading * Math.PI) / 180;
        const dx = Math.round(Math.cos(rad) * this.scoutSpeed * 2);
        const dy = Math.round(Math.sin(rad) * this.scoutSpeed * 2);
        this.scoutX = Math.max(10, Math.min(90, this.scoutX + dx));
        this.scoutY = Math.max(10, Math.min(90, this.scoutY + dy));
        this.scoutHeading = (this.scoutHeading + (Math.floor(Math.random() * 7) - 3) + 360) % 360;
      } else {
        const dx = Math.floor(Math.random() * 3) - 1;
        const dy = Math.floor(Math.random() * 3) - 1;
        this.scoutX = Math.max(10, Math.min(90, this.scoutX + dx));
        this.scoutY = Math.max(10, Math.min(90, this.scoutY + dy));
      }
      this.scoutBattery = parseFloat(Math.max(10, this.scoutBattery - (this.scoutSpeed > 0 ? 0.08 : 0.02) - (Math.random() * 0.05)).toFixed(2));
    }

    // Simulated battery discharge
    this.battery = parseFloat(Math.max(10, this.battery - (this.speed > 0 ? 0.05 : 0.01) - (Math.random() * 0.05)).toFixed(2));

    this.triggerUpdate();
  }
}
