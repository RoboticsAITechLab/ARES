import { prisma } from "./prisma";

export class Logger {
  public static async log(severity: "INFO" | "WARNING" | "CRITICAL", category: string, message: string) {
    console.log(`[${severity}] [${category}] ${message}`);
    try {
      await prisma.missionLog.create({
        data: {
          severity,
          category,
          message
        }
      });
    } catch (err) {
      console.error("Failed to write log to database:", err);
    }
  }
}
