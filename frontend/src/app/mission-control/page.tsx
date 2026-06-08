"use client";

import { AlertTriangle, CloudSun, Compass, ShieldCheck } from "lucide-react";
import { mockRovers } from "@/lib/mock-data";
import { MISSION_INFO } from "@/lib/constants";
import MotherRoverCard from "@/components/mission/mother-rover-card";
import ScoutCard from "@/components/mission/scout-card";
import FleetStatus from "@/components/mission/fleet-status";
import CommandCenter from "@/components/mission/command-center";
import Alerts from "@/components/mission/alerts";

export default function MissionControlPage() {
  const motherRover = mockRovers.find((r) => r.type === "mother")!;
  const scoutRovers = mockRovers.filter((r) => r.type === "scout");

  return (
    <div className="space-y-6">
      {/* 1. Mission Status Banner */}
      <div className="p-4 rounded border border-slate-800 bg-[#111827] flex flex-col md:flex-row md:items-center justify-between gap-4 font-mono">
        <div className="flex items-center gap-3">
          <Compass className="h-6 w-6 text-cyan-400 shrink-0" />
          <div>
            <div className="text-[10px] text-slate-500 tracking-wider">MISSION OBJECTIVE OVERVIEW</div>
            <h1 className="text-sm font-bold text-white tracking-widest uppercase">
              {MISSION_INFO.name} // MARS_SURFACE_EXPLORATION
            </h1>
          </div>
        </div>

        {/* Secondary Info Badges */}
        <div className="grid grid-cols-2 sm:flex sm:items-center gap-4 text-xs">
          {/* Weather status */}
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded">
            <CloudSun className="h-4 w-4 text-cyan-400" />
            <div className="flex flex-col text-[9px]">
              <span className="text-slate-500 leading-none">JEZERO SOL 142</span>
              <span className="font-semibold text-slate-200 mt-0.5">-31°C // CLEAR</span>
            </div>
          </div>

          {/* DSN Link */}
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <div className="flex flex-col text-[9px]">
              <span className="text-slate-500 leading-none">COMMS ENCRYPT</span>
              <span className="font-semibold text-emerald-400 mt-0.5">AES-256 SECURE</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid Layout
          Desktop: 3 columns (xl)
          Laptop: 2 columns (lg)
          Mobile: 1 column */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 items-start">
        
        {/* Column 1: Fleet Status & Command Center */}
        <div className="space-y-6">
          <div className="p-5 border border-slate-800 bg-slate-950/20 rounded">
            <FleetStatus rovers={mockRovers} />
          </div>
          <div className="p-5 border border-slate-800 bg-slate-950/20 rounded">
            <CommandCenter />
          </div>
        </div>

        {/* Column 2: Mother Rover Card (Hero Element) & Scout cards */}
        <div className="space-y-6 lg:col-span-1 xl:col-span-1">
          {/* Mother Rover (Hero Node) - Receives visual focus */}
          <div>
            <div className="flex justify-between items-center mb-3 font-mono">
              <span className="text-xs font-semibold text-slate-400 tracking-wider">HERO_NODE // CORE_TELEMETRY</span>
              <span className="text-[10px] text-cyan-400 uppercase tracking-widest animate-pulse font-bold">PRIMARY STATUS VALUE</span>
            </div>
            <MotherRoverCard rover={motherRover} />
          </div>

          {/* Scout Rovers */}
          <div className="space-y-3">
            <div className="flex justify-between items-center font-mono">
              <span className="text-xs font-semibold text-slate-400 tracking-wider">SCOUT_FLEET // RECON_UNITS</span>
              <span className="text-[9px] text-slate-500">UNITS: {scoutRovers.length}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {scoutRovers.map((scout) => (
                <ScoutCard key={scout.id} rover={scout} />
              ))}
            </div>
          </div>
        </div>

        {/* Column 3: Alerts Panel & Logs */}
        <div className="lg:col-span-2 xl:col-span-1">
          <div className="p-5 border border-slate-800 bg-slate-950/20 rounded h-full">
            <Alerts />
          </div>
        </div>

      </div>
    </div>
  );
}
