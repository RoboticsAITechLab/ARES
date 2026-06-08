"use client";

import { useState } from "react";
import { Activity, Battery, Wifi, Thermometer, Cpu, Heart, ShieldAlert, FileText } from "lucide-react";
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

  const motherRover = mockRovers.find((r) => r.type === "mother")!;
  const scoutRovers = mockRovers.filter((r) => r.type === "scout");

  return (
    <div className="space-y-6 font-mono">
      {/* 1. Simulated Telemetry Warning Banner (No Blinking) */}
      <div className="p-3.5 rounded border border-amber-500/20 bg-amber-500/5 text-amber-300 text-[10px] flex items-center gap-3">
        <ShieldAlert className="h-4 w-4 shrink-0 text-amber-400" />
        <div>
          <span className="font-extrabold uppercase">SIMULATED TELEMETRY FEED</span>
          <p className="text-[9px] text-slate-400 mt-0.5 leading-normal">
            This dashboard operates on simulated telemetry packets generated via static orbital iteration. Values do not represent real-time hardware tracking.
          </p>
        </div>
      </div>

      {/* Page Header */}
      <div className="p-4 rounded border border-slate-800 bg-[#111827] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Activity className="h-5 w-5 text-cyan-400" />
          <div>
            <div className="text-[10px] text-slate-500 tracking-wider">VEHICLE LOGISTICS CORE</div>
            <h1 className="text-sm font-bold text-white tracking-widest uppercase">
              TELEMETRY_DIAGNOSTICS // SYSTEMS_CHECK
            </h1>
          </div>
        </div>
        <div className="text-[10px] text-slate-500 uppercase">
          DSN LOCK: SECURE
        </div>
      </div>

      {/* Grid: Prioritizing Mother Rover first, then Scouts, then Operations Log */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left Section (takes 2/3 width on desktop/laptop) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* ARES MotherShip - Hero (1st Priority) */}
          <div className="space-y-3">
            <div className="flex justify-between items-center text-xs text-slate-400 tracking-wider uppercase">
              <span>Primary Commander Telemetry</span>
              <span className="text-[9px] text-cyan-400">Node: {motherRover.id}</span>
            </div>
            
            <div className="p-5 rounded border border-slate-800 bg-[#111827] space-y-4">
              <div className="flex justify-between items-center border-b border-slate-900 pb-3">
                <h2 className="text-sm font-extrabold text-white tracking-wider uppercase">
                  {motherRover.name} // COM_NODE
                </h2>
                <span className="text-[8px] px-2 py-0.5 rounded border border-slate-700 bg-slate-900 text-slate-400 uppercase tracking-widest">
                  Nominal State
                </span>
              </div>

              {/* Mother Rover Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {/* Battery */}
                <div className="bg-slate-950/40 p-3.5 rounded border border-slate-850 space-y-2">
                  <div className="flex justify-between items-center text-[9px] text-slate-500 font-bold uppercase">
                    <span className="flex items-center gap-1"><Battery className="h-3 w-3 text-cyan-455" /> Battery</span>
                    <span className="text-slate-200">{motherRover.battery}%</span>
                  </div>
                  <div className="h-1 w-full bg-slate-900 rounded-full overflow-hidden">
                    <div className="h-full bg-cyan-500" style={{ width: `${motherRover.battery}%` }}></div>
                  </div>
                </div>

                {/* Signal */}
                <div className="bg-slate-950/40 p-3.5 rounded border border-slate-850 space-y-2">
                  <div className="flex justify-between items-center text-[9px] text-slate-500 font-bold uppercase">
                    <span className="flex items-center gap-1"><Wifi className="h-3 w-3 text-cyan-455" /> Link Quality</span>
                    <span className="text-slate-200">{motherRover.linkQuality}%</span>
                  </div>
                  <div className="h-1 w-full bg-slate-900 rounded-full overflow-hidden">
                    <div className="h-full bg-cyan-500" style={{ width: `${motherRover.linkQuality}%` }}></div>
                  </div>
                </div>

                {/* CPU */}
                <div className="bg-slate-950/40 p-3.5 rounded border border-slate-850 space-y-2">
                  <div className="flex justify-between items-center text-[9px] text-slate-500 font-bold uppercase">
                    <span className="flex items-center gap-1"><Cpu className="h-3 w-3 text-cyan-455" /> CPU Load</span>
                    <span className="text-slate-200">{motherRover.cpu}%</span>
                  </div>
                  <div className="h-1 w-full bg-slate-900 rounded-full overflow-hidden">
                    <div className="h-full bg-cyan-500" style={{ width: `${motherRover.cpu}%` }}></div>
                  </div>
                </div>

                {/* Memory */}
                <div className="bg-slate-950/40 p-3.5 rounded border border-slate-850 space-y-1">
                  <span className="text-[8px] text-slate-500 uppercase block font-bold">Memory Capacity</span>
                  <span className="text-sm font-bold text-slate-200">{motherRover.memory}%</span>
                </div>

                {/* Temperature */}
                <div className="bg-slate-950/40 p-3.5 rounded border border-slate-850 space-y-1">
                  <span className="text-[8px] text-slate-500 uppercase block font-bold">Thermal Core</span>
                  <span className="text-sm font-bold text-slate-200">{motherRover.temperature}°C</span>
                </div>

                {/* Health */}
                <div className="bg-slate-950/40 p-3.5 rounded border border-slate-850 space-y-1">
                  <span className="text-[8px] text-slate-500 uppercase block font-bold">Rover Health</span>
                  <span className="text-sm font-bold text-slate-200">{motherRover.health}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Scout Fleet Telemetry - Subordinate (2nd Priority) */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-slate-400 tracking-wider uppercase">
              Subordinate Scout Fleet Telemetry
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {scoutRovers.map((scout) => (
                <div key={scout.id} className="p-4 rounded border border-slate-850 bg-[#111827] space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-900 pb-2">
                    <h4 className="text-xs font-bold text-white tracking-widest uppercase">{scout.name}</h4>
                    <span className={`text-[8px] px-1.5 py-0.2 rounded border font-semibold uppercase ${
                      scout.status === "warning" ? "border-amber-500/20 text-amber-400" : "border-slate-800 text-slate-400"
                    }`}>
                      {scout.status}
                    </span>
                  </div>

                  {/* Scout Metrics */}
                  <div className="grid grid-cols-2 gap-3 text-[9px] text-slate-400">
                    <div className="space-y-1">
                      <div className="flex justify-between font-bold">
                        <span>BAT:</span>
                        <span>{scout.battery}%</span>
                      </div>
                      <div className="h-0.5 w-full bg-slate-950 rounded-full overflow-hidden">
                        <div className="h-full bg-cyan-500" style={{ width: `${scout.battery}%` }}></div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between font-bold">
                        <span>LNK:</span>
                        <span>{scout.linkQuality}%</span>
                      </div>
                      <div className="h-0.5 w-full bg-slate-950 rounded-full overflow-hidden">
                        <div className="h-full bg-cyan-500" style={{ width: `${scout.linkQuality}%` }}></div>
                      </div>
                    </div>

                    <div className="flex justify-between pt-1 font-semibold border-t border-slate-900/60 col-span-2">
                      <span>CPU:</span>
                      <span className="text-slate-200">{scout.cpu}%</span>
                    </div>

                    <div className="flex justify-between font-semibold col-span-2">
                      <span>MEM:</span>
                      <span className="text-slate-200">{scout.memory}%</span>
                    </div>

                    <div className="flex justify-between font-semibold col-span-2">
                      <span>TEMP:</span>
                      <span className="text-slate-200">{scout.temperature}°C</span>
                    </div>

                    <div className="flex justify-between font-semibold col-span-2">
                      <span>HLT:</span>
                      <span className="text-slate-200">{scout.health}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Section: Operations Log (3rd Priority) */}
        <div className="p-5 border border-slate-800 bg-[#111827]/80 rounded flex flex-col h-full">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <h2 className="text-xs font-semibold text-slate-400 tracking-wider flex items-center gap-1.5 uppercase">
              <FileText className="h-3.5 w-3.5 text-cyan-400" />
              Operations Log
            </h2>
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
          <div className="flex-1 min-h-[300px] max-h-[500px] overflow-y-auto bg-slate-950 p-4 rounded border border-slate-900 space-y-2 text-[10px] leading-relaxed select-text font-mono">
            {filteredLogs.map((log, index) => (
              <div key={index} className="flex gap-3 text-slate-400 hover:bg-slate-900/40 py-0.5 transition rounded px-1">
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
