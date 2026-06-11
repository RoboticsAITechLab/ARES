import { FleetPacket } from "../../types/FleetPacket";
import { MotherRoverPacket } from "../../types/MotherRoverPacket";

export class VirtualRover {
  private interval: NodeJS.Timeout | null = null;
  private battery = 98.5;
  private x = 45;
  private y = 35;
  private heading = 142;

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

  private tick(): void {
    // Simulated coordinate drift
    const dx = Math.floor(Math.random() * 3) - 1; // -1, 0, 1
    const dy = Math.floor(Math.random() * 3) - 1; // -1, 0, 1
    this.x = Math.max(10, Math.min(90, this.x + dx));
    this.y = Math.max(10, Math.min(90, this.y + dy));

    // Simulated battery discharge
    this.battery = parseFloat(Math.max(10, this.battery - (Math.random() * 0.1)).toFixed(2));

    // Simulated signal noise
    const signal = Math.max(50, Math.min(100, 92 + Math.floor(Math.random() * 9 - 4)));

    // Simulated temperature fluctuation
    const temperature = Math.floor(-15 + (Math.random() * 4 - 2));

    // Simulated speed
    const isMoving = dx !== 0 || dy !== 0;
    const speed = isMoving ? parseFloat((0.15 + Math.random() * 0.1).toFixed(2)) : 0.0;

    // Simulated heading drift
    if (isMoving) {
      this.heading = (this.heading + (Math.floor(Math.random() * 11) - 5) + 360) % 360;
    }

    const motherPacket: MotherRoverPacket = {
      id: "mother-rover",
      battery: this.battery,
      signal,
      temperature,
      speed,
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
}
