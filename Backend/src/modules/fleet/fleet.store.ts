/**
 * @file fleet.store.ts
 * @description Data store tracking registered rover nodes in the fleet using SQLite via Prisma.
 */

import { RoverIdentity } from "./fleet.types";
import { prisma } from "../../prisma";

export class FleetStore {
  public async getRovers(): Promise<RoverIdentity[]> {
    const rovers = await prisma.rover.findMany();
    return rovers.map(r => ({
      id: r.id,
      name: r.name,
      type: r.type as "mother" | "scout"
    }));
  }

  public async registerRover(rover: RoverIdentity): Promise<void> {
    await prisma.rover.upsert({
      where: { id: rover.id },
      update: {
        name: rover.name,
        type: rover.type,
        status: "READY",
        lastContact: new Date()
      },
      create: {
        id: rover.id,
        name: rover.name,
        type: rover.type,
        status: "READY",
        lastContact: new Date()
      }
    });
  }
}
