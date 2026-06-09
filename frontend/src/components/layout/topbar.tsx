"use client";

import { Radio, ShieldCheck, Wifi, ShieldAlert, Heart, Menu, X } from "lucide-react";
import { MISSION_INFO } from "@/lib/constants";
import { useMissionStore } from "@/store/mission-store";
import MissionClock from "../MissionClock";
import { Button } from "../ui/button";

export default function Topbar() {
  const { isSidebarOpen, toggleSidebar, fleet, isEmergencyStop } = useMissionStore();

  const mother = fleet.mother;
  const scouts = fleet.scouts;
  const totalRoversCount = (mother ? 1 : 0) + scouts.length;

  const onlineMother = mother && mother.status === "online" ? 1 : 0;
  const onlineScouts = scouts.filter((s) => s.status.toLowerCase() === "online" || s.status.toLowerCase() === "active").length;
  const onlineRovers = onlineMother + onlineScouts;

  const criticalRoversCount = (mother && mother.status === "offline" ? 1 : 0) + scouts.filter((s) => s.status.toLowerCase() === "error" || s.status.toLowerCase() === "offline").length;
  const warningRoversCount = scouts.filter((s) => s.status.toLowerCase() === "warning" || s.status.toLowerCase() === "degraded").length;

  return (
    <header className="h-16 border-b border-slate-800 bg-[#111827] flex items-center justify-between px-4 sm:px-6 shrink-0 select-none z-30 font-mono relative">
      {/* Left Title and Mobile Hamburger */}
      <div className="flex items-center gap-3">
        {/* Mobile menu toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="h-9 w-9 md:hidden hover:bg-slate-800 text-slate-400 hover:text-white shrink-0 cursor-pointer"
        >
          {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>

        <div className="flex items-center gap-2">
          <Radio className="h-4 w-4 text-cyan-400 shrink-0" />
          <span className="text-xs tracking-wider font-extrabold text-white flex items-center gap-2 truncate">
            <span className="truncate">{MISSION_INFO.name}</span>
            <span className="text-slate-700 font-normal hidden sm:inline">//</span>
            <span className="text-slate-400 font-bold hidden sm:inline truncate">OPERATIONS HUB</span>
          </span>
        </div>
      </div>

      {/* Mission clock widget (hidden on mobile, visible on desktop) */}
      <div className="hidden lg:flex items-center border-x border-slate-800/80 px-6 xl:px-8 h-full">
        <MissionClock />
      </div>

      {/* Topbar System Status Badges */}
      <div className="flex items-center gap-2.5 text-[10px] select-none">
        {/* Fleet Health */}
        <div className="hidden xl:flex items-center gap-1.5 px-2 py-1 rounded bg-slate-950/40 border border-slate-800/60 text-slate-400">
          <Heart className="h-3 w-3 text-rose-500" />
          <span>FLEET:</span>
          <span className="text-slate-200 font-bold">
            {mother ? `${mother.battery}%` : "OFFLINE"}
          </span>
        </div>

        {/* Signal Strength */}
        <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded bg-slate-950/40 border border-slate-800/60 text-slate-400">
          <Wifi className="h-3 w-3 text-cyan-400" />
          <span>COMMS:</span>
          <span className="text-emerald-400 font-bold uppercase">
            {mother ? (mother.signal > 75 ? "NOMINAL" : "DEGRADED") : "OFFLINE"}
          </span>
        </div>

        {/* Active Rovers */}
        <div className="hidden md:flex items-center gap-1.5 px-2 py-1 rounded bg-slate-950/40 border border-slate-800/60 text-slate-400">
          <ShieldCheck className="h-3 w-3 text-emerald-400" />
          <span>VEHICLES:</span>
          <span className="text-slate-200 font-bold">
            {onlineRovers}/{totalRoversCount}
          </span>
        </div>

        {/* Alert Tally */}
        {criticalRoversCount > 0 ? (
          <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-rose-500/10 border border-rose-500/30 text-rose-400 animate-pulse">
            <ShieldAlert className="h-3.5 w-3.5 text-rose-500 shrink-0" />
            <span className="font-extrabold uppercase tracking-wide">
              {criticalRoversCount} CRITICAL
            </span>
          </div>
        ) : warningRoversCount > 0 ? (
          <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 animate-status-pulse">
            <ShieldAlert className="h-3.5 w-3.5 text-amber-500 shrink-0" />
            <span className="font-bold uppercase tracking-wide">
              {warningRoversCount} WARNING
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-status-pulse"></span>
            <span className="font-bold uppercase tracking-wide">NOMINAL</span>
          </div>
        )}
      </div>
    </header>
  );
}
