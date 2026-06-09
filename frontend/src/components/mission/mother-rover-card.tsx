"use client";

import { Battery, Wifi, MapPin, Gauge, Thermometer, Cpu, Heart, Layers } from "lucide-react";
import { MotherRover } from "@/types/MotherRover";
import { STATUS_STYLES } from "@/lib/constants";

interface MotherRoverCardProps {
  rover: MotherRover | null;
}

export default function MotherRoverCard({ rover }: MotherRoverCardProps) {
  if (!rover) {
    return (
      <div className="relative overflow-hidden rounded border border-dashed border-slate-800 bg-[#111827]/40 p-8 flex flex-col items-center justify-center text-center font-mono text-slate-500 text-xs gap-2 min-h-[300px] select-none">
        <Layers className="h-8 w-8 text-slate-600 animate-pulse" />
        <span className="font-bold tracking-widest text-slate-400 uppercase">NO PRIMARY ROVER DETECTED</span>
        <span className="text-[10px] text-slate-600">Waiting for DSN telemetry packet to establish transceiver link...</span>
      </div>
    );
  }

  const style = rover.status === "online" ? STATUS_STYLES.online : STATUS_STYLES.critical;

  return (
    <div className="relative overflow-hidden rounded border-2 border-cyan-500/50 bg-[#111827] shadow-[0_0_30px_rgba(6,182,212,0.15)] flex flex-col select-none">
      {/* Thick Cyan Aerospace Top Banner */}
      <div className="h-1.5 bg-cyan-500 w-full"></div>

      {/* Decorative Technical Corners */}
      <div className="absolute top-1.5 left-0 w-3 h-3 border-t border-l border-cyan-400"></div>
      <div className="absolute top-1.5 right-0 w-3 h-3 border-t border-r border-cyan-400"></div>
      <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-cyan-400"></div>
      <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-cyan-400"></div>

      {/* Header with high contrast */}
      <div className="border-b border-slate-800 bg-slate-900/90 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-cyan-400"></div>
            <span className="text-slate-400 text-[10px] tracking-widest font-extrabold uppercase">PRIMARY GROUND COMMAND NODE</span>
          </div>
          <h3 className="text-lg font-black text-white tracking-widest uppercase">{rover.id.toUpperCase()}</h3>
        </div>
        <div className="flex items-center gap-2.5">
          <span className="text-[9px] px-2 py-1 rounded font-bold border border-cyan-500 bg-cyan-500/10 text-cyan-400 uppercase tracking-widest">
            MASTER CORE
          </span>
          <span className={`text-[10px] font-bold px-3 py-1 rounded border ${style.badge}`}>
            {style.label}
          </span>
        </div>
      </div>

      {/* Body Content */}
      <div className="p-6 font-mono space-y-6 flex-1">
        {/* Subtitle / Description Section */}
        <div className="flex items-center gap-2 text-[10px] text-slate-400 bg-slate-950/40 p-2.5 rounded border border-slate-900 leading-normal">
          <Layers className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
          <span>Coordinates fleet exploration vectors and acts as primary DSN orbital transceiver link.</span>
        </div>

        {/* Priority Telemetry Progress Bars */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Battery */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-[10px]">
              <span className="text-slate-400 flex items-center gap-1.5 font-bold uppercase">
                <Battery className="h-4 w-4 text-cyan-400" />
                POWER CORE CAPACITY
              </span>
              <span className="font-extrabold text-slate-200">{rover.battery}%</span>
            </div>
            <div className="h-2.5 w-full bg-slate-950 rounded border border-slate-800/80 p-0.5">
              <div
                className="h-full bg-cyan-500 rounded-sm transition-all duration-300 shadow-[0_0_10px_rgba(6,182,212,0.3)]"
                style={{ width: `${rover.battery}%` }}
              ></div>
            </div>
          </div>

          {/* DSN lock */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-[10px]">
              <span className="text-slate-400 flex items-center gap-1.5 font-bold uppercase">
                <Wifi className="h-4 w-4 text-cyan-400" />
                ORBITAL DSN LOCK
              </span>
              <span className="font-extrabold text-slate-200">{rover.signal}%</span>
            </div>
            <div className="h-2.5 w-full bg-slate-950 rounded border border-slate-800/80 p-0.5">
              <div
                className="h-full bg-cyan-500 rounded-sm transition-all duration-300 shadow-[0_0_10px_rgba(6,182,212,0.3)]"
                style={{ width: `${rover.signal}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Main stats readings */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-slate-950/40 p-4 rounded border border-slate-850 flex flex-col justify-between min-h-[90px]">
            <span className="text-slate-500 uppercase tracking-widest text-[8px] font-bold">GRID LOCATION</span>
            <div className="mt-2 text-[11px] font-bold text-slate-200 tracking-wide space-y-0.5">
              <div>GRID X: {rover.x}</div>
              <div>GRID Y: {rover.y}</div>
            </div>
          </div>

          <div className="bg-slate-950/40 p-4 rounded border border-slate-850 flex flex-col justify-between min-h-[90px]">
            <span className="text-slate-500 uppercase tracking-widest text-[8px] font-bold">VELOCITY</span>
            <div className="text-lg font-black text-cyan-400 tracking-wide mt-2">
              {rover.speed.toFixed(2)} <span className="text-[10px] text-slate-500 font-normal">m/s</span>
            </div>
          </div>

          <div className="bg-slate-950/40 p-4 rounded border border-slate-850 flex flex-col justify-between min-h-[90px]">
            <span className="text-slate-500 uppercase tracking-widest text-[8px] font-bold">TEMPERATURE</span>
            <div className="text-lg font-black text-slate-200 tracking-wide mt-2">
              {rover.temperature}°C
            </div>
          </div>

          <div className="bg-slate-950/40 p-4 rounded border border-slate-850 flex flex-col justify-between min-h-[90px]">
            <span className="text-slate-500 uppercase tracking-widest text-[8px] font-bold">DIAGNOSTICS</span>
            <div className="mt-2 text-[10px] text-slate-300 font-semibold space-y-0.5">
              <div className="flex justify-between"><span>HEADING:</span><span>{rover.heading}°</span></div>
              <div className="flex justify-between"><span>SCOUTS:</span><span>{rover.connectedScouts}</span></div>
            </div>
          </div>
        </div>

        {/* Subsystems Diagnostics grid */}
        <div className="border-t border-slate-800/80 pt-4">
          <div className="flex justify-between items-center text-[8px] text-slate-500 uppercase tracking-widest mb-3 font-bold">
            <span>CORE SUBSYSTEM DIAGNOSTICS</span>
            <span className="text-cyan-500">LIVE DSN LINK ACTIVE</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[9px] text-slate-400">
            <div className="flex justify-between items-center border-b border-slate-900 pb-1.5">
              <span>POWER RTG</span>
              <span className="text-emerald-400 font-bold">OK</span>
            </div>
            <div className="flex justify-between items-center border-b border-slate-900 pb-1.5">
              <span>THERMAL SWEEP</span>
              <span className="text-emerald-400 font-bold">OK</span>
            </div>
            <div className="flex justify-between items-center border-b border-slate-900 pb-1.5">
              <span>HGA ENCODER</span>
              <span className="text-emerald-400 font-bold">OK</span>
            </div>
            <div className="flex justify-between items-center border-b border-slate-900 pb-1.5">
              <span>IMU STATE</span>
              <span className="text-emerald-400 font-bold">OK</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
