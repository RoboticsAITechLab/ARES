import { Rover } from "../rovers/types";
import { Mission, MissionState } from "../missions/types";
import { MissionEvent, createMissionEvent } from "../events/types";
import { Route } from "../routes/types";
import { Scout, ScoutState } from "../scouts/types";

export interface SimulationConfig {
  speed: "SLOW" | "NORMAL" | "FAST";
  status: "RUNNING" | "PAUSED" | "STOPPED";
  elapsedTime: number; // tick index
  refreshInterval: number;
}

export function runSimulationTick(state: {
  rovers: Rover[];
  missions: Mission[];
  events: MissionEvent[];
  routes: Route[];
  scouts: Scout[];
  isEmergencyStop: boolean;
  simulationConfig: SimulationConfig;
}) {
  const { rovers, missions, events, routes, scouts, isEmergencyStop, simulationConfig } = state;

  if (isEmergencyStop || simulationConfig.status !== "RUNNING") {
    return { rovers, missions, events, scouts, simulationConfig };
  }

  const newEvents: MissionEvent[] = [];
  const nextElapsed = simulationConfig.elapsedTime + 1;

  // 1. Rover movement and battery depletion simulation
  const nextRovers = rovers.map((rover) => {
    if (rover.status === "OFFLINE" || rover.status === "ERROR") {
      return rover;
    }

    // Battery depletion
    let nextBat = rover.battery;
    if (rover.status === "EXPLORING" || rover.status === "DEPLOYED") {
      nextBat = Math.max(0, rover.battery - parseFloat((Math.random() * 0.3 + 0.1).toFixed(2)));
    } else if (rover.status === "CHARGING") {
      nextBat = Math.min(100, rover.battery + parseFloat((Math.random() * 1.5 + 0.5).toFixed(2)));
    }

    // Battery alarm thresholds
    if (rover.battery >= 40 && nextBat < 40) {
      newEvents.push(
        createMissionEvent(
          rover.name,
          "ROVER",
          "WARNING",
          `Power warning: capacity dropped to ${nextBat.toFixed(1)}%. Deploy solar panels.`
        )
      );
    }

    // Signal fluctuation
    const sigDelta = Math.floor(Math.random() * 7 - 3);
    const nextSig = Math.max(10, Math.min(100, rover.signal + sigDelta));

    // Nav coordinate progression towards target waypoints
    let nextLat = rover.latitude;
    let nextLon = rover.longitude;
    let nextSpeed = rover.speed;

    if (rover.status === "EXPLORING" && rover.currentMissionId) {
      const activeMission = missions.find(m => m.id === rover.currentMissionId);
      const activeRoute = routes.find(r => r.assignedMissionId === activeMission?.id && r.assignedRoverId === rover.id);

      if (activeRoute && activeRoute.waypoints.length > 0) {
        // Find next target waypoint that the rover hasn't reached yet
        const targetWp = activeRoute.waypoints.find(wp => {
          const latDiff = Math.abs(rover.latitude - wp.latitude);
          const lonDiff = Math.abs(rover.longitude - wp.longitude);
          return latDiff > 0.001 || lonDiff > 0.001;
        });

        if (targetWp) {
          nextSpeed = parseFloat((Math.random() * 0.15 + 0.15).toFixed(2));
          // Interpolate coordinate steps
          const latStep = (targetWp.latitude - rover.latitude) * 0.05;
          const lonStep = (targetWp.longitude - rover.longitude) * 0.05;
          nextLat = parseFloat((rover.latitude + latStep).toFixed(5));
          nextLon = parseFloat((rover.longitude + lonStep).toFixed(5));
        } else {
          nextSpeed = 0.0;
        }
      }
    }

    return {
      ...rover,
      battery: parseFloat(nextBat.toFixed(2)),
      signal: nextSig,
      latitude: nextLat,
      longitude: nextLon,
      speed: nextSpeed,
      cpu: Math.max(5, Math.min(99, rover.cpu + Math.floor(Math.random() * 9 - 4))),
      memory: Math.max(10, Math.min(99, rover.memory + Math.floor(Math.random() * 5 - 2))),
      linkQuality: Math.max(10, Math.min(100, nextSig + Math.floor(Math.random() * 5 - 2))),
      temperature: Math.max(-100, Math.min(150, rover.temperature + Math.floor(Math.random() * 3 - 1))),
    };
  });

  // 2. Mission milestones / objectives checklist progression
  const nextMissions = missions.map((mission) => {
    if (mission.status !== "ACTIVE") return mission;

    let objectivesUpdated = false;
    const nextObjectives = mission.objectives.map(obj => {
      // 5% chance of objective completion per tick
      if (obj.status === "ACTIVE" && Math.random() > 0.95) {
        objectivesUpdated = true;
        newEvents.push(
          createMissionEvent(
            mission.name,
            "MISSION",
            "INFO",
            `Task completed: "${obj.label}" successfully verified.`
          )
        );
        return { ...obj, status: "COMPLETED" as const };
      }
      if (obj.status === "PENDING" && !mission.objectives.some(o => o.status === "ACTIVE" || o.status === "PENDING" && o.id < obj.id)) {
        objectivesUpdated = true;
        return { ...obj, status: "ACTIVE" as const };
      }
      return obj;
    });

    const allDone = nextObjectives.every(o => o.status === "COMPLETED");
    let nextStatus: MissionState = mission.status;
    if (allDone) {
      nextStatus = "COMPLETED";
      newEvents.push(
        createMissionEvent(
          mission.name,
          "MISSION",
          "INFO",
          `Mission complete: all objectives achieved for "${mission.name}".`
        )
      );
    }

    return {
      ...mission,
      objectives: nextObjectives,
      status: nextStatus,
    };
  });

  // 3. Scout state updates
  const nextScouts = scouts.map(scout => {
    if (scout.status === "ACTIVE") {
      let nextDist = Math.max(0, (scout.returnDistance || 240) - Math.floor(Math.random() * 15 + 5));
      let nextState: ScoutState = scout.status;
      if (nextDist === 0) {
        nextState = "RETURNING";
        newEvents.push(
          createMissionEvent(
            scout.name,
            "SCOUT",
            "INFO",
            `Scout unit ${scout.name} returning to docking container.`
          )
        );
      }
      return {
        ...scout,
        returnDistance: nextDist,
        status: nextState,
      };
    }
    return scout;
  });

  // Random environmental telemetry logs (7% chance)
  if (Math.random() > 0.93) {
    const randomSystemLogs = [
      { source: "DSN Relay", cat: "COMMS" as const, sev: "INFO" as const, msg: "DSN tracking array duplex lock verified." },
      { source: "Ground Ops", cat: "SYSTEM" as const, sev: "INFO" as const, msg: "Communications ping: latency delta within baseline (+14.2 min)." },
      { source: "ARES MotherShip", cat: "ROVER" as const, sev: "INFO" as const, msg: "Auxiliary backup battery heater state: ACTIVE." }
    ];
    const item = randomSystemLogs[Math.floor(Math.random() * randomSystemLogs.length)];
    newEvents.push(createMissionEvent(item.source, item.cat, item.sev, item.msg));
  }

  return {
    rovers: nextRovers,
    missions: nextMissions,
    scouts: nextScouts,
    events: [...newEvents, ...events],
    simulationConfig: {
      ...simulationConfig,
      elapsedTime: nextElapsed,
    }
  };
}
