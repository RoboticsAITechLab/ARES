"use client";

import { useState } from "react";
import { Activity, Battery, Wifi, Thermometer, Cpu, Heart, Database, ShieldAlert, Terminal } from "lucide-react";
import { mockRovers, mockEventLogs } from "@/lib/mock-data";

export default function TelemetryPage() {
  const [logFilter, setLogFilter] = useState<"all" | "nominal" | "warning" | "critical">("all");

  const filteredLogs = mockEventLogs.filter((log) => {
    if (logFilter === "all") return true;
    return log.level === logFilter;
  });

  const getLogLevelClass = (level: string) => {
    switch (level) {
      case "critical":
        return "text-rose-400 font-bold";
      case "warning":
        return "text-amber-400 font-bold";
      default:
        return "text-emerald-400";
    }
  };

  return (
    <div className="space-y-6 font-mono">
      {/* 1. Simulated Telemetry Warn Banner */}
      <div className="p-3.5 rounded border border-amber-500/20 bg-amber-500/5 text-amber-300 text-[10px] flex items-center gap-3">
        <ShieldAlert className="h-4 w-4 shrink-0 text-amber-400 animate-pulse" />
        <div>
          <span className="font-extrabold uppercase">SIMULATED TELEMETRY FEED ACTIVE</span>
          <p className="text-[9px] text-slate-400 mt-0.5 leading-normal">
            This console is operating in passive ground-simulation mode. All battery, signal, and computing metrics represent simulated telemetry packets generated via orbital path loops.
          </p>
        </div>
      </div>

      {/* Page Header */}
      <div className="p-4 rounded border border-slate-800 bg-[#111827] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Activity className="h-5 w-5 text-cyan-400" />
          <div>
            <div className="text-[10px] text-slate-500 tracking-wider">VEHICLE LOGISTICS DIAGNOSTIC CORE</div>
            <h1 className="text-sm font-bold text-white tracking-widest uppercase">
              TELEMETRY_DIAGNOSTICS // SYSTEMS_CHECK
            </h1>
          </div>
        </div>
        <div className="text-[10px] text-slate-500 uppercase">
          DSN LINK: SYNCHRONIZED
        </div>
      </div>

      {/* Grid containing Diagnostic Sections */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Left Columns (Telemetry Cards) */}
        <div className="xl:col-span-2 space-y-6">
          
          {/* Section 1: Power & Thermal (Battery) */}
          <div>
            <h2 className="text-xs font-semibold text-slate-400 tracking-wider mb-3 uppercase flex items-center gap-2">
              <Battery className="h-4 w-4 text-cyan-400" />
              POWER_CELLS // THERMAL_DISSIPATION
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {mockRovers.map((rover) => (
                <div key={rover.id} className="p-4 rounded border border-slate-800 bg-[#111827] space-y-3 text-[10px]">
                  <div className="flex justify-between items-center text-slate-400">
                    <span className="font-bold text-slate-200">{rover.name}</span>
                    <span className="text-[8px] uppercase tracking-wider">{rover.type}</span>
                  </div>
                  
                  {/* Capacity readout */}
                  <div className="flex justify-between items-baseline border-b border-slate-900 pb-1.5">
                    <span className="text-slate-500 uppercase text-[8px]">Battery capacity</span>
                    <span className={`text-xl font-bold ${rover.battery < 40 ? "text-rose-400" : "text-cyan-400"}`}>
                      {rover.battery}%
                    </span>
                  </div>

                  {/* Temp readout */}
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 uppercase text-[8px] flex items-center gap-1">
                      <Thermometer className="h-3.5 w-3.5 text-slate-500" />
                      CORE_TEMP
                    </span>
                    <span className="font-bold text-slate-200">{rover.temperature}°C</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Comms Relays (Signal & Link Quality) */}
          <div>
            <h2 className="text-xs font-semibold text-slate-400 tracking-wider mb-3 uppercase flex items-center gap-2">
              <Wifi className="h-4 w-4 text-cyan-400" />
              SIGNAL_RECEPTORS // LINK_QUALITY
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {mockRovers.map((rover) => (
                <div key={rover.id} className="p-4 rounded border border-slate-800 bg-[#111827] space-y-3 text-[10px]">
                  <div className="flex justify-between items-center text-slate-400">
                    <span className="font-bold text-slate-200">{rover.name}</span>
                    <span className="text-[8px] uppercase tracking-wider">{rover.type}</span>
                  </div>
                  
                  {/* Signal strength */}
                  <div className="flex justify-between items-baseline border-b border-slate-900 pb-1.5">
                    <span className="text-slate-500 uppercase text-[8px]">Carrier Strength</span>
                    <span className="text-xl font-bold text-cyan-400">
                      {rover.signal}%
                    </span>
                  </div>

                  {/* Link Quality */}
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 uppercase text-[8px]">Link Integrity</span>
                    <span className="font-bold text-slate-200">{rover.linkQuality}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Compute & Hardware Integrity (CPU, Memory, Health) */}
          <div>
            <h2 className="text-xs font-semibold text-slate-400 tracking-wider mb-3 uppercase flex items-center gap-2">
              <Cpu className="h-4 w-4 text-cyan-400" />
              COMPUTING_MODULES // SYSTEM_INTEGRITY
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {mockRovers.map((rover) => (
                <div key={rover.id} className="p-4 rounded border border-slate-800 bg-[#111827] space-y-3 text-[10px]">
                  <div className="flex justify-between items-center text-slate-400">
                    <span className="font-bold text-slate-200">{rover.name}</span>
                    <span className="text-[8px] uppercase tracking-wider">{rover.type}</span>
                  </div>

                  {/* CPU / MEM */}
                  <div className="space-y-1.5 border-b border-slate-900 pb-2.5">
                    <div className="flex justify-between text-[8px]">
                      <span>CPU LOAD:</span>
                      <span className="font-bold text-slate-300">{rover.cpu}%</span>
                    </div>
                    <div className="flex justify-between text-[8px]">
                      <span>MEMORY:</span>
                      <span className="font-bold text-slate-300">{rover.memory}%</span>
                    </div>
                  </div>

                  {/* Hardware Health */}
                  <div className="flex justify-between items-center pt-1.5">
                    <span className="text-slate-500 uppercase text-[8px] flex items-center gap-1">
                      <Heart className="h-3.5 w-3.5 text-cyan-450" />
                      PHYSICAL_HEALTH
                    </span>
                    <span className="font-bold text-slate-200">{rover.health}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column (Terminal Timeline Logs) */}
        <div className="p-5 border border-slate-800 bg-[#111827] rounded flex flex-col h-full">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <h2 className="text-xs font-semibold text-slate-400 tracking-wider flex items-center gap-1.5 uppercase">
              <Terminal className="h-3.5 w-3.5 text-cyan-400" />
              EVENT_LOG_RECEPTOR
            </h2>
            {/* Filter buttons */}
            <div className="flex gap-1 border border-slate-800 bg-slate-950 p-0.5 rounded text-[8px]">
              {["all", "nominal", "warning", "critical"].map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setLogFilter(lvl as any)}
                  className={`px-2 py-0.5 rounded transition uppercase tracking-wider font-semibold cursor-pointer ${
                    logFilter === lvl
                      ? "bg-slate-800 text-cyan-400 font-bold"
                      : "text-slate-500 hover:text-slate-300"
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          {/* Logs terminal box */}
          <div className="flex-1 min-h-[350px] max-h-[520px] overflow-y-auto bg-slate-950 p-4 rounded border border-slate-900 space-y-2 text-[10px] leading-relaxed select-text font-mono">
            {filteredLogs.map((log, index) => (
              <div key={index} className="flex gap-3 text-slate-405 hover:bg-slate-900/40 py-0.5 transition rounded px-1">
                <span className="text-slate-600 select-none tabular-nums shrink-0">{log.timestamp}</span>
                <span className={`font-bold select-none shrink-0 [width:32px] ${getLogLevelClass(log.level)}`}>
                  [{log.category}]
                </span>
                <span className="text-slate-300">{log.message}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
