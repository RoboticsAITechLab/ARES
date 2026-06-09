"use client";

import { Compass, PlaySquare } from "lucide-react";
import Link from "next/link";
import { useMissionStore } from "@/store/mission-store";
import { MISSION_INFO } from "@/lib/constants";
import MotherRoverCard from "@/components/mission/mother-rover-card";
import ScoutCard from "@/components/mission/scout-card";
import Alerts from "@/components/mission/alerts";
import MissionTimeline from "@/components/mission/mission-timeline";
import QuickActions from "@/components/QuickActions";
import SystemHealth from "@/components/SystemHealth";

export default function MissionControlPage() {
  const { fleet, events, isEmergencyStop, missionControl } = useMissionStore();

  const motherRover = fleet.mother;
  const scoutRovers = fleet.scouts;
  const activeAlertsCount = events.filter(a => a.severity === "CRITICAL" || a.severity === "WARNING").length;

  const currentMission = missionControl.currentMission;

  return (
    <div className="space-y-6 select-none animate-fade-in">
      {/* 1. Mission Status Banner */}
      <div className="p-4 rounded border border-slate-800 bg-[#111827] font-mono flex flex-col xl:flex-row xl:items-center justify-between gap-4 shadow-lg">
        {/* Left Section: Target Info */}
        <div className="flex items-center gap-3">
          <Compass className="h-6 w-6 text-cyan-400 shrink-0 animate-status-pulse" />
          <div>
            <div className="text-[9px] text-slate-500 tracking-wider uppercase font-bold">CURRENT ACTIVE MISSION VECTOR</div>
            <h1 className="text-sm font-black text-white tracking-widest uppercase truncate max-w-[250px] sm:max-w-none">
              {currentMission ? currentMission.name : MISSION_INFO.name} <span className="text-slate-700">//</span> {currentMission ? currentMission.status : "INACTIVE"}
            </h1>
          </div>
        </div>

        {/* Dynamic Telemetry Metrics Panel */}
        <div className="grid grid-cols-2 sm:grid-cols-4 xl:flex xl:items-center gap-3 text-[10px] flex-1 justify-end">
          {/* Phase */}
          <div className="bg-slate-950 border border-slate-800/80 px-3 py-1.5 rounded flex flex-col min-w-[100px]">
            <span className="text-[7px] text-slate-500 uppercase leading-none font-bold">PRIORITY</span>
            <span className="font-extrabold text-cyan-400 mt-1">{currentMission ? currentMission.priority : "MEDIUM"}</span>
          </div>

          {/* Area Explored */}
          <div className="bg-slate-950 border border-slate-800/80 px-3 py-1.5 rounded flex flex-col min-w-[100px]">
            <span className="text-[7px] text-slate-500 uppercase leading-none font-bold">AREA EXPLORED</span>
            <span className="font-extrabold text-slate-200 mt-1">34.20%</span>
          </div>

          {/* Samples Collected */}
          <div className="bg-slate-950 border border-slate-800/80 px-3 py-1.5 rounded flex flex-col min-w-[100px]">
            <span className="text-[7px] text-slate-500 uppercase leading-none font-bold">OBJECTIVES</span>
            <span className="font-extrabold text-slate-200 mt-1">
              {currentMission ? currentMission.objectives.filter(o => o.status === "COMPLETED").length : 0} / {currentMission ? currentMission.objectives.length : 0}
            </span>
          </div>

          {/* Hazards Detected */}
          <div className="bg-slate-950 border border-slate-800/80 px-3 py-1.5 rounded flex flex-col min-w-[100px]">
            <span className="text-[7px] text-slate-500 uppercase leading-none font-bold">HAZARDS SECTOR</span>
            <span className="font-extrabold text-rose-400 mt-1 animate-pulse">6 ACTIVE</span>
          </div>
        </div>
      </div>

      {/* Grid: Stacks to 1 column on mobile, 2 columns on lg, 3 columns on xl */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 items-start">
        {/* Column 1: Mother Rover (Primary Command Node) & Directives Override */}
        <div className="space-y-6 lg:col-span-1">
          <div>
            <div className="flex justify-between items-center mb-3 font-mono">
              <span className="text-xs font-semibold text-slate-400 tracking-wider uppercase">COMMAND_NODE // PRIMARY</span>
              <span className="text-[8px] text-cyan-400 font-extrabold uppercase tracking-widest animate-glow">
                DSN LINK STATUS: ACTIVE
              </span>
            </div>
            <MotherRoverCard rover={motherRover} />
          </div>

          <QuickActions />
        </div>

        {/* Column 2: Scout Fleet Grid */}
        <div className="space-y-6 lg:col-span-1">
          <div className="space-y-3">
            <div className="flex justify-between items-center font-mono">
              <span className="text-xs font-semibold text-slate-400 tracking-wider uppercase">SCOUT_FLEET // RECON_UNITS</span>
              <span className="text-[9px] text-slate-500 font-bold">UNITS LINKED: {scoutRovers.length}</span>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {scoutRovers.map((scout) => (
                <ScoutCard key={scout.id} rover={scout} />
              ))}
            </div>
          </div>
        </div>

        {/* Column 3: System Health, Timeline milestones & Alerts */}
        <div className="lg:col-span-2 xl:col-span-1 space-y-6">
          <SystemHealth />

          <div className="p-5 border border-slate-800 bg-slate-950/20 rounded shadow-md">
            <MissionTimeline />
          </div>

          <div className="p-5 border border-slate-800 bg-slate-950/20 rounded shadow-md">
            <Alerts />
          </div>
        </div>
      </div>
    </div>
  );
}
