"use client";

import { Battery, Wifi, MapPin, Gauge, Thermometer, Cpu, Layers } from "lucide-react";
import { MotherRover } from "@/types/MotherRover";
import { STATUS_STYLES } from "@/lib/constants";

interface MotherRoverCardProps {
  rover: MotherRover | null;
}

export default function MotherRoverCard({ rover }: MotherRoverCardProps) {
  const activeRover = rover || {
    id: "ARES-MOTHER-01",
    name: "ARES-MOTHER-01",
    battery: 0,
    signal: 0,
    status: "OFFLINE",
    temperature: 0,
    x: 0,
    y: 0,
    heading: 0,
    speed: 0,
    connectedScouts: 0,
    obstacleDistance: 0
  };

  const normStatus = (activeRover.status || "").toLowerCase();
  const style = STATUS_STYLES[normStatus as keyof typeof STATUS_STYLES] || STATUS_STYLES.critical;

  return (
    <div className="relative overflow-hidden rounded border border-slate-800 bg-[#111827] shadow-lg flex flex-col select-none font-mono">
      {/* Thick Cyan Aerospace Top Banner */}
      <div className="h-1 bg-cyan-500 w-full"></div>

      {/* Header with high contrast */}
      <div className="border-b border-slate-800 bg-slate-900/90 px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <div className={cn("h-1.5 w-1.5 rounded-full", activeRover.status === "online" ? "bg-cyan-400" : "bg-slate-500")} />
            <span className="text-slate-500 text-[8px] tracking-widest font-extrabold uppercase">PRIMARY GROUND COMMAND NODE</span>
          </div>
          <h3 className="text-xs font-black text-white tracking-widest uppercase">{activeRover.id.toUpperCase()}</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[7px] px-1.5 py-0.5 rounded font-bold border border-cyan-500 bg-cyan-500/10 text-cyan-400 uppercase tracking-widest">
            MASTER CORE
          </span>
          <span className={`text-[8px] font-bold px-2 py-0.5 rounded border uppercase ${style.badge}`}>
            {style.label}
          </span>
        </div>
      </div>

      {/* Body Content */}
      <div className="p-4 space-y-4 flex-1">
        {/* Priority Telemetry Progress Bars */}
        <div className="grid grid-cols-2 gap-4 text-[9px] text-slate-400">
          {/* Battery */}
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-1.5 font-bold uppercase">
                <Battery className="h-3 w-3 text-cyan-400" />
                POWER CORE
              </span>
              <span className="font-extrabold text-slate-200">{activeRover.battery}%</span>
            </div>
            <div className="h-1.5 w-full bg-slate-950 rounded overflow-hidden">
              <div
                className="h-full bg-cyan-500 rounded"
                style={{ width: `${activeRover.battery}%` }}
              ></div>
            </div>
          </div>

          {/* DSN lock */}
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-slate-400 flex items-center gap-1.5 font-bold uppercase">
                <Wifi className="h-3 w-3 text-cyan-400" />
                DSN LOCK
              </span>
              <span className="font-extrabold text-slate-200">{activeRover.signal}%</span>
            </div>
            <div className="h-1.5 w-full bg-slate-950 rounded overflow-hidden">
              <div
                className="h-full bg-cyan-500 rounded"
                style={{ width: `${activeRover.signal}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Main stats readings */}
        <div className="grid grid-cols-2 gap-2 text-[9px] text-slate-400">
          <div className="bg-slate-950/40 p-2 rounded border border-slate-900 flex justify-between items-center">
            <span>GRID COORD:</span>
            <span className="font-bold text-slate-200">X:{activeRover.x} Y:{activeRover.y}</span>
          </div>

          <div className="bg-slate-950/40 p-2 rounded border border-slate-900 flex justify-between items-center">
            <span>VELOCITY:</span>
            <span className="font-bold text-slate-200">{activeRover.speed.toFixed(1)} m/s</span>
          </div>

          <div className="bg-slate-950/40 p-2 rounded border border-slate-900 flex justify-between items-center">
            <span>TEMP:</span>
            <span className="font-bold text-slate-200">{activeRover.temperature}°C</span>
          </div>

          <div className="bg-slate-950/40 p-2 rounded border border-slate-900 flex justify-between items-center">
            <span>HEADING:</span>
            <span className="font-bold text-slate-200">{activeRover.heading}°</span>
          </div>

          <div className="bg-slate-950/40 p-2 rounded border border-slate-900 flex justify-between items-center col-span-2">
            <span>SONAR OBSTACLE:</span>
            <span className="font-extrabold text-cyan-400">
              {activeRover.obstacleDistance !== undefined ? `${activeRover.obstacleDistance.toFixed(1)} cm` : "0.0 cm"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

import { cn } from "@/lib/utils";
