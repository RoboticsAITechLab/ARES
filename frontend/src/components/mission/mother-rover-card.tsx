"use client";

import { Battery, Wifi, MapPin, Gauge, Thermometer, Radio, Navigation } from "lucide-react";
import { Rover } from "@/lib/types";
import { STATUS_STYLES } from "@/lib/constants";

interface MotherRoverCardProps {
  rover: Rover;
}

export default function MotherRoverCard({ rover }: MotherRoverCardProps) {
  const style = STATUS_STYLES[rover.status as keyof typeof STATUS_STYLES] || STATUS_STYLES.online;

  return (
    <div className="relative overflow-hidden rounded border border-cyan-500/30 bg-[#111827] shadow-[0_0_20px_rgba(6,182,212,0.08)]">
      {/* Decorative Corner Tabs */}
      <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-cyan-400"></div>
      <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-cyan-400"></div>
      <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-cyan-400"></div>
      <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-cyan-400"></div>

      {/* Hero Header */}
      <div className="border-b border-slate-800 bg-slate-900/60 px-5 py-3.5 flex justify-between items-center font-mono">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse"></div>
          <span className="text-slate-500 text-[10px] tracking-widest font-bold">PRIMARY CORE //</span>
          <h3 className="text-sm font-bold text-white tracking-widest uppercase">{rover.name}</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[9px] px-2 py-0.5 rounded border border-slate-700 bg-slate-900 text-slate-400 font-semibold uppercase tracking-wider">
            HERO NODE
          </span>
          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${style.badge}`}>
            {style.label}
          </span>
        </div>
      </div>

      <div className="p-5 font-mono space-y-5">
        {/* Progress Telemetry Meters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Battery meter */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-[10px]">
              <span className="text-slate-400 flex items-center gap-1">
                <Battery className="h-3.5 w-3.5 text-cyan-400" />
                POWER SUPPLY RESERVE
              </span>
              <span className="font-bold text-slate-200">{rover.battery}%</span>
            </div>
            <div className="h-2 w-full bg-slate-950 rounded border border-slate-800/80 p-0.5">
              <div
                className="h-full bg-cyan-500 rounded-sm transition-all duration-500 shadow-[0_0_10px_rgba(6,182,212,0.4)]"
                style={{ width: `${rover.battery}%` }}
              ></div>
            </div>
          </div>

          {/* Signal Link meter */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-[10px]">
              <span className="text-slate-400 flex items-center gap-1">
                <Wifi className="h-3.5 w-3.5 text-cyan-400" />
                COMMS CARRIER SIGNAL
              </span>
              <span className="font-bold text-slate-200">{rover.signal}%</span>
            </div>
            <div className="h-2 w-full bg-slate-950 rounded border border-slate-800/80 p-0.5">
              <div
                className="h-full bg-cyan-500 rounded-sm transition-all duration-500 shadow-[0_0_10px_rgba(6,182,212,0.4)]"
                style={{ width: `${rover.signal}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Technical Value Readout Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Coordinates */}
          <div className="bg-slate-950/40 p-3 rounded border border-slate-800/60 flex flex-col justify-between h-20">
            <div className="flex items-center justify-between text-[9px] text-slate-500 uppercase">
              <span>Coordinates</span>
              <MapPin className="h-3 w-3 text-slate-500" />
            </div>
            <div className="mt-2 space-y-0.5">
              <div className="text-[10px] font-bold text-slate-200 tracking-wide">
                LA {rover.latitude.toFixed(4)}
              </div>
              <div className="text-[10px] font-bold text-slate-200 tracking-wide">
                LO {rover.longitude.toFixed(4)}
              </div>
            </div>
          </div>

          {/* Speed */}
          <div className="bg-slate-950/40 p-3 rounded border border-slate-800/60 flex flex-col justify-between h-20">
            <div className="flex items-center justify-between text-[9px] text-slate-500 uppercase">
              <span>Velocity</span>
              <Gauge className="h-3 w-3 text-slate-500" />
            </div>
            <div className="mt-2 text-base font-bold text-cyan-400 tracking-wide tabular-nums">
              {rover.speed.toFixed(2)} <span className="text-[10px] text-slate-500">m/s</span>
            </div>
          </div>

          {/* Temperature */}
          <div className="bg-slate-950/40 p-3 rounded border border-slate-800/60 flex flex-col justify-between h-20">
            <div className="flex items-center justify-between text-[9px] text-slate-500 uppercase">
              <span>Temp</span>
              <Thermometer className="h-3 w-3 text-slate-500" />
            </div>
            <div className="mt-2 text-base font-bold text-slate-200 tracking-wide tabular-nums">
              {rover.temperature}°C
            </div>
          </div>

          {/* Navigation/Heading */}
          <div className="bg-slate-950/40 p-3 rounded border border-slate-800/60 flex flex-col justify-between h-20">
            <div className="flex items-center justify-between text-[9px] text-slate-500 uppercase">
              <span>Heading</span>
              <Navigation className="h-3 w-3 text-slate-500" />
            </div>
            <div className="mt-2 text-sm font-bold text-slate-200 tracking-wide">
              142.4° <span className="text-[9px] text-slate-500 font-semibold uppercase">SE</span>
            </div>
          </div>
        </div>

        {/* Technical Subsystems Status */}
        <div className="border-t border-slate-800/60 pt-3">
          <div className="flex justify-between items-center text-[9px] text-slate-500 uppercase tracking-widest mb-2">
            <span>Primary Core Subsystems</span>
            <span>Link Sync: {rover.lastContact}</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-2 text-[10px] text-slate-400">
            <div className="flex items-center justify-between">
              <span>RTG THERMAL REACTOR</span>
              <span className="text-emerald-400 font-bold">NOMINAL</span>
            </div>
            <div className="flex items-center justify-between">
              <span>MAIN CPU CORE</span>
              <span className="text-emerald-400 font-bold">NOMINAL</span>
            </div>
            <div className="flex items-center justify-between">
              <span>HGA MOTOR SATELLITE</span>
              <span className="text-emerald-400 font-bold">NOMINAL</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
