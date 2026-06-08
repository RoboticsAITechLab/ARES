"use client";

import { Compass, Thermometer, ShieldAlert, Wifi, Activity, AlertTriangle, Layers } from "lucide-react";
import { mockRovers } from "@/lib/mock-data";
import { MISSION_INFO, MISSION_METRICS } from "@/lib/constants";
import MotherRoverCard from "@/components/mission/mother-rover-card";
import ScoutCard from "@/components/mission/scout-card";
import FleetStatus from "@/components/mission/fleet-status";
import CommandCenter from "@/components/mission/command-center";
import Alerts from "@/components/mission/alerts";
import MissionTimeline from "@/components/mission/mission-timeline";

export default function MissionControlPage() {
  const motherRover = mockRovers.find((r) => r.type === "mother")!;
  const scoutRovers = mockRovers.filter((r) => r.type === "scout");

  return (
    <div className="space-y-6">
      {/* 1. Mission Status Banner */}
      <div className="p-4 rounded border border-slate-800 bg-[#111827] font-mono flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left Section: Target Info */}
        <div className="flex items-center gap-3">
          <Compass className="h-6 w-6 text-cyan-400 shrink-0" />
          <div>
            <div className="text-[9px] text-slate-500 tracking-wider uppercase">MISSION LOGISTICAL BASE</div>
            <h1 className="text-sm font-bold text-white tracking-widest uppercase">
              {MISSION_INFO.name} // SURFACE OPERATIONS BANNER
            </h1>
          </div>
        </div>

        {/* Dynamic Telemetry Metrics Panel */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:flex lg:items-center gap-3 text-[10px]">
          {/* Phase */}
          <div className="bg-slate-950 border border-slate-850 px-3 py-1.5 rounded flex flex-col min-w-[100px]">
            <span className="text-[7px] text-slate-500 uppercase leading-none">CURRENT PHASE</span>
            <span className="font-bold text-cyan-300 mt-1">{MISSION_INFO.phase}</span>
          </div>

          {/* Area Explored */}
          <div className="bg-slate-950 border border-slate-850 px-3 py-1.5 rounded flex flex-col min-w-[100px]">
            <span className="text-[7px] text-slate-500 uppercase leading-none">AREA EXPLORED</span>
            <span className="font-bold text-slate-200 mt-1">{MISSION_METRICS.areaExplored}%</span>
          </div>

          {/* Samples Collected */}
          <div className="bg-slate-950 border border-slate-850 px-3 py-1.5 rounded flex flex-col min-w-[100px]">
            <span className="text-[7px] text-slate-500 uppercase leading-none">SAMPLES RETRIEVED</span>
            <span className="font-bold text-slate-200 mt-1">{MISSION_METRICS.samplesCollected} / 50</span>
          </div>

          {/* Hazards Detected */}
          <div className="bg-slate-950 border border-slate-850 px-3 py-1.5 rounded flex flex-col min-w-[100px]">
            <span className="text-[7px] text-slate-500 uppercase leading-none">HAZARDS DETECTED</span>
            <span className="font-bold text-rose-400 mt-1">{MISSION_METRICS.hazardsDetected} ACTIVE</span>
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

        {/* Column 2: Mother Rover (Hero Node Centerpiece) & Scouts */}
        <div className="space-y-6">
          {/* Mother Rover (Hero Node) - Visual Centerpiece */}
          <div>
            <div className="flex justify-between items-center mb-3 font-mono">
              <span className="text-xs font-semibold text-slate-400 tracking-wider uppercase">HERO_NODE // CORE_TELEMETRY</span>
              <span className="text-[8px] text-cyan-400 font-bold uppercase tracking-widest">PRIMARY DATA STREAM</span>
            </div>
            <MotherRoverCard rover={motherRover} />
          </div>

          {/* Scout Fleet Grid */}
          <div className="space-y-3">
            <div className="flex justify-between items-center font-mono">
              <span className="text-xs font-semibold text-slate-400 tracking-wider uppercase">SCOUT_FLEET // RECON_UNITS</span>
              <span className="text-[9px] text-slate-500">UNITS LINKED: {scoutRovers.length}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {scoutRovers.map((scout) => (
                <ScoutCard key={scout.id} rover={scout} />
              ))}
            </div>
          </div>
        </div>

        {/* Column 3: Timeline Checklist & Alerts Panel */}
        <div className="lg:col-span-2 xl:col-span-1 space-y-6">
          <div className="p-5 border border-slate-800 bg-slate-950/20 rounded">
            <MissionTimeline />
          </div>
          
          <div className="p-5 border border-slate-800 bg-slate-950/20 rounded">
            <Alerts />
          </div>
        </div>

      </div>
    </div>
  );
}
