import { FleetPacket } from "../../types/FleetPacket";
import { MotherRoverPacket } from "../../types/MotherRoverPacket";

export class VirtualRover {
  private interval: NodeJS.Timeout | null = null;
  private battery = 98.5;
  private x = 45;
  private y = 35;
  private heading = 142;
  private speed = 0.0;

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

  public handleCommand(command: string, value?: any): void {
    console.log(`[ARES Virtual Rover] Executing command: ${command} with value:`, value);
    let updated = false;

    if (command === "move") {
      const dir = value;
      if (dir === "forward") {
        if (this.speed === 0.0) this.speed = 0.5;
        const rad = (this.heading * Math.PI) / 180;
        this.x = Math.max(10, Math.min(90, this.x + Math.round(Math.cos(rad) * 2)));
        this.y = Math.max(10, Math.min(90, this.y + Math.round(Math.sin(rad) * 2)));
        updated = true;
      } else if (dir === "backward") {
        if (this.speed === 0.0) this.speed = 0.5;
        const rad = (this.heading * Math.PI) / 180;
        this.x = Math.max(10, Math.min(90, this.x - Math.round(Math.cos(rad) * 2)));
        this.y = Math.max(10, Math.min(90, this.y - Math.round(Math.sin(rad) * 2)));
        updated = true;
      } else if (dir === "left") {
        this.heading = (this.heading - 15 + 360) % 360;
        updated = true;
      } else if (dir === "right") {
        this.heading = (this.heading + 15) % 360;
        updated = true;
      }
    } else if (command === "stop") {
      this.speed = 0.0;
      updated = true;
    } else if (command === "speed") {
      this.speed = Math.max(0.0, Math.min(2.0, parseFloat(value)));
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
      connectedScouts: 0,
      timestamp: Date.now()
    };

    const fleetPacket: FleetPacket = {
      mother: motherPacket,
      scouts: []
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

    // Simulated battery discharge
    this.battery = parseFloat(Math.max(10, this.battery - (this.speed > 0 ? 0.05 : 0.01) - (Math.random() * 0.05)).toFixed(2));

    this.triggerUpdate();
  }
}

