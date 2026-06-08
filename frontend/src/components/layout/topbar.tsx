"use client";

import { useEffect, useState } from "react";
import { Radio, ShieldCheck, Wifi, ShieldAlert, Heart } from "lucide-react";
import { MISSION_INFO, MISSION_METRICS } from "@/lib/constants";
import { mockRovers } from "@/lib/mock-data";

export default function Topbar() {
  const [currentTime, setCurrentTime] = useState<Date | null>(null);

  useEffect(() => {
    setCurrentTime(new Date());
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Formatter for mission elapsed time (MET)
  const getMET = () => {
    if (!currentTime) return "000d : 00h : 00m : 00s";
    const start = new Date(MISSION_INFO.metStart).getTime();
    const diff = currentTime.getTime() - start;

    if (diff < 0) return "000d : 00h : 00m : 00s";

    const seconds = Math.floor((diff / 1000) % 60);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    const pad = (num: number, size = 2) => {
      let s = num.toString();
      while (s.length < size) s = "0" + s;
      return s;
    };

    return `${pad(days, 3)}d : ${pad(hours)}h : ${pad(minutes)}m : ${pad(seconds)}s`;
  };

  const getFormattedTime = (utc: boolean) => {
    if (!currentTime) return "--:--:--";
    const options: Intl.DateTimeFormatOptions = {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
      timeZone: utc ? "UTC" : undefined,
    };
    return new Intl.DateTimeFormat("en-US", options).format(currentTime);
  };

  const activeCount = mockRovers.filter((r) => r.status === "online" || r.status === "warning").length;
  const criticalAlertsCount = mockRovers.filter((r) => r.status === "critical").length;
  const warningAlertsCount = mockRovers.filter((r) => r.status === "warning").length;

  return (
    <header className="h-16 border-b border-slate-800 bg-[#111827] flex items-center justify-between px-6 shrink-0 select-none z-10 font-mono">
      {/* Title */}
      <div className="flex items-center gap-3">
        <Radio className="h-4 w-4 text-cyan-400" />
        <span className="text-xs tracking-wider font-bold text-white flex items-center gap-2">
          {MISSION_INFO.name} <span className="text-slate-600 font-normal">//</span> GROUND OPERATIONS HUB
        </span>
      </div>

      {/* Clocks Panel */}
      <div className="hidden lg:flex items-center gap-8 border-x border-slate-800/80 px-8 h-full">
        {/* Local time */}
        <div className="flex flex-col">
          <span className="text-[8px] text-slate-500 tracking-wider">LOCAL TIME</span>
          <span className="text-xs font-semibold text-slate-300 tabular-nums">
            {getFormattedTime(false)}
          </span>
        </div>
        {/* UTC time */}
        <div className="flex flex-col">
          <span className="text-[8px] text-slate-500 tracking-wider">UTC TIME</span>
          <span className="text-xs font-semibold text-slate-300 tabular-nums">
            {getFormattedTime(true)}
          </span>
        </div>
        {/* MET (Mission Elapsed Time) */}
        <div className="flex flex-col">
          <span className="text-[8px] text-cyan-400 tracking-wider font-semibold">MET (ELAPSED TIME)</span>
          <span className="text-xs font-bold text-cyan-400 tabular-nums tracking-wide">
            {getMET()}
          </span>
        </div>
      </div>

      {/* Topbar System Status Badges */}
      <div className="flex items-center gap-3 text-[10px]">
        {/* Fleet Health */}
        <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded bg-slate-900 border border-slate-800 text-slate-400">
          <Heart className="h-3 w-3 text-rose-500" />
          <span>FLEET HEALTH:</span>
          <span className="text-slate-200 font-bold">{MISSION_METRICS.fleetHealth}%</span>
        </div>

        {/* Signal Strength */}
        <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-slate-900 border border-slate-800 text-slate-400">
          <Wifi className="h-3 w-3 text-cyan-400" />
          <span>COMMS:</span>
          <span className="text-emerald-400 font-bold">{MISSION_METRICS.commsStatus}</span>
        </div>

        {/* Active Rovers */}
        <div className="hidden md:flex items-center gap-1.5 px-2 py-1 rounded bg-slate-900 border border-slate-800 text-slate-400">
          <ShieldCheck className="h-3 w-3 text-emerald-400" />
          <span>ROVERS:</span>
          <span className="text-slate-200 font-bold">
            {activeCount}/{mockRovers.length}
          </span>
        </div>

        {/* Alert Tally */}
        {criticalAlertsCount > 0 ? (
          <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-rose-500/10 border border-rose-500/30 text-rose-400 animate-pulse">
            <ShieldAlert className="h-3 w-3 text-rose-500" />
            <span className="font-bold">{criticalAlertsCount} CRITICAL ALERT(S)</span>
          </div>
        ) : warningAlertsCount > 0 ? (
          <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <ShieldAlert className="h-3 w-3 text-amber-500" />
            <span className="font-bold">{warningAlertsCount} WARNING(S)</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-bold">SYSTEMS NOMINAL</span>
          </div>
        )}
      </div>
    </header>
  );
}
