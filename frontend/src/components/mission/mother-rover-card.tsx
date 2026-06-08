"use client";

import { Battery, Wifi, MapPin, Gauge, Thermometer, ShieldAlert, Cpu, Heart, Database, AlertCircle } from "lucide-react";
import { Rover } from "@/lib/types";
import { STATUS_STYLES } from "@/lib/constants";

interface MotherRoverCardProps {
  rover: Rover;
}

export default function MotherRoverCard({ rover }: MotherRoverCardProps) {
  const style = STATUS_STYLES[rover.status as keyof typeof STATUS_STYLES] || STATUS_STYLES.online;

  return (
    <div className="relative overflow-hidden rounded border border-cyan-500/40 bg-[#111827] shadow-[0_0_25px_rgba(6,182,212,0.12)]">
      {/* Decorative Aerospace Tech Borders */}
      <div className="absolute top-0 left-0 w-3.5 h-3.5 border-t-2 border-l-2 border-cyan-400"></div>
      <div className="absolute top-0 right-0 w-3.5 h-3.5 border-t-2 border-r-2 border-cyan-400"></div>
      <div className="absolute bottom-0 left-0 w-3.5 h-3.5 border-b-2 border-l-2 border-cyan-400"></div>
      <div className="absolute bottom-0 right-0 w-3.5 h-3.5 border-b-2 border-r-2 border-cyan-400"></div>

      {/* Hero Header */}
      <div className="border-b border-slate-800 bg-slate-900/80 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono">
        <div className="flex items-center gap-2.5">
          <div className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse"></div>
          <span className="text-slate-500 text-[10px] tracking-widest font-bold">PRIMARY MOBILE CONTROL NODE //</span>
          <h3 className="text-base font-extrabold text-white tracking-widest uppercase">{rover.name}</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[9px] px-2 py-0.5 rounded border border-cyan-500/20 bg-cyan-500/10 text-cyan-400 font-bold uppercase tracking-widest">
            HERO NODE
          </span>
          <span className={`text-[10px] font-bold px-3 py-0.5 rounded border ${style.badge}`}>
            {style.label}
          </span>
        </div>
      </div>

      <div className="p-6 font-mono space-y-6">
        {/* Core Stats Progress Blocks */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Battery capacity */}
          <div className="bg-slate-950/50 p-3.5 rounded border border-slate-800 space-y-2">
            <div className="flex justify-between items-center text-[10px]">
              <span className="text-slate-400 flex items-center gap-1.5 font-semibold">
                <Battery className="h-3.5 w-3.5 text-cyan-400" />
                BATTERY STORAGE
              </span>
              <span className="font-bold text-slate-200">{rover.battery}%</span>
            </div>
            <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
              <div
                className="h-full bg-cyan-500 rounded-full"
                style={{ width: `${rover.battery}%` }}
              ></div>
            </div>
            <div className="text-[8px] text-slate-500 flex justify-between">
              <span>VOLTAGE: 24.2V</span>
              <span>NOMINAL TEMP</span>
            </div>
          </div>

          {/* Comms link */}
          <div className="bg-slate-950/50 p-3.5 rounded border border-slate-800 space-y-2">
            <div className="flex justify-between items-center text-[10px]">
              <span className="text-slate-400 flex items-center gap-1.5 font-semibold">
                <Wifi className="h-3.5 w-3.5 text-cyan-400" />
                DSN CARRIER LINK
              </span>
              <span className="font-bold text-slate-200">{rover.signal}%</span>
            </div>
            <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
              <div
                className="h-full bg-cyan-500 rounded-full"
                style={{ width: `${rover.signal}%` }}
              ></div>
            </div>
            <div className="text-[8px] text-slate-500 flex justify-between">
              <span>LATENCY: 1.2s</span>
              <span>BAND: X_BAND</span>
            </div>
          </div>

          {/* CPU utilization */}
          <div className="bg-slate-950/50 p-3.5 rounded border border-slate-800 space-y-2">
            <div className="flex justify-between items-center text-[10px]">
              <span className="text-slate-400 flex items-center gap-1.5 font-semibold">
                <Cpu className="h-3.5 w-3.5 text-cyan-400" />
                CPU PROCESSOR LOAD
              </span>
              <span className="font-bold text-slate-200">{rover.cpu}%</span>
            </div>
            <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
              <div
                className="h-full bg-cyan-500 rounded-full"
                style={{ width: `${rover.cpu}%` }}
              ></div>
            </div>
            <div className="text-[8px] text-slate-500 flex justify-between">
              <span>SYS CORE: active</span>
              <span>THREADS: 16/16</span>
            </div>
          </div>

          {/* Physical Health */}
          <div className="bg-slate-950/50 p-3.5 rounded border border-slate-800 space-y-2">
            <div className="flex justify-between items-center text-[10px]">
              <span className="text-slate-400 flex items-center gap-1.5 font-semibold">
                <Heart className="h-3.5 w-3.5 text-cyan-400" />
                VEHICLE INTEG HEALTH
              </span>
              <span className="font-bold text-slate-200">{rover.health}%</span>
            </div>
            <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
              <div
                className="h-full bg-cyan-500 rounded-full"
                style={{ width: `${rover.health}%` }}
              ></div>
            </div>
            <div className="text-[8px] text-slate-500 flex justify-between">
              <span>STRUCTURAL: ok</span>
              <span>SENSORS: ok</span>
            </div>
          </div>
        </div>

        {/* Detailed Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-950/30 p-3 rounded border border-slate-800/60 text-[10px]">
            <span className="text-slate-500 uppercase tracking-widest text-[8px] block">POSITION VECTOR</span>
            <div className="mt-1.5 space-y-0.5">
              <div className="text-slate-300 font-bold">LAT: {rover.latitude.toFixed(5)}</div>
              <div className="text-slate-300 font-bold">LON: {rover.longitude.toFixed(5)}</div>
            </div>
          </div>

          <div className="bg-slate-950/30 p-3 rounded border border-slate-800/60 text-[10px] flex flex-col justify-between">
            <span className="text-slate-500 uppercase tracking-widest text-[8px] block">VELOCITY MODULE</span>
            <div className="text-base font-extrabold text-cyan-400 tracking-wide mt-1.5">
              {rover.speed.toFixed(2)} <span className="text-[9px] text-slate-500 font-normal">m/s</span>
            </div>
          </div>

          <div className="bg-slate-950/30 p-3 rounded border border-slate-800/60 text-[10px] flex flex-col justify-between">
            <span className="text-slate-500 uppercase tracking-widest text-[8px] block">CORE TEMPERATURE</span>
            <div className="text-base font-extrabold text-slate-200 tracking-wide mt-1.5">
              {rover.temperature}°C
            </div>
          </div>

          <div className="bg-slate-950/30 p-3 rounded border border-slate-800/60 text-[10px] flex flex-col justify-between">
            <span className="text-slate-500 uppercase tracking-widest text-[8px] block">MEMORY REGISTER</span>
            <div className="text-base font-extrabold text-slate-200 tracking-wide mt-1.5">
              {rover.memory}% <span className="text-[9px] text-slate-500 font-normal">RAM</span>
            </div>
          </div>
        </div>

        {/* Subsystems Matrix */}
        <div className="border-t border-slate-800/80 pt-4">
          <div className="flex justify-between items-center text-[8px] text-slate-500 uppercase tracking-widest mb-3">
            <span>CORE SUBSYSTEM DIAGNOSTICS MATRIX</span>
            <span className="text-cyan-500 font-semibold">SIMULATED TELEMETRY FEED ACTIVE</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-[10px] text-slate-400">
            <div className="flex justify-between items-center border-b border-slate-900/60 pb-1.5">
              <span>RTG POWER CELL</span>
              <span className="text-emerald-400 font-bold">NOMINAL</span>
            </div>
            <div className="flex justify-between items-center border-b border-slate-900/60 pb-1.5">
              <span>THERMAL REGULATOR</span>
              <span className="text-emerald-400 font-bold">NOMINAL</span>
            </div>
            <div className="flex justify-between items-center border-b border-slate-900/60 pb-1.5">
              <span>HGA SATELLITE MOTOR</span>
              <span className="text-emerald-400 font-bold">NOMINAL</span>
            </div>
            <div className="flex justify-between items-center border-b border-slate-900/60 pb-1.5">
              <span>IMU ORIENTATION SENSOR</span>
              <span className="text-emerald-400 font-bold">NOMINAL</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
