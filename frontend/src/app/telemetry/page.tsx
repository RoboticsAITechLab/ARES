"use client";

import { useState } from "react";
import { Activity, Battery, Wifi, Thermometer, ShieldCheck, Terminal, ListFilter } from "lucide-react";
import { mockRovers, mockEventLogs } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";

export default function TelemetryPage() {
  const [logFilter, setLogFilter] = useState<"all" | "nominal" | "warning" | "critical">("all");

  const filteredLogs = mockEventLogs.filter((log) => {
    if (logFilter === "all") return true;
    return log.level === logFilter;
  });

  const getLogLevelClass = (level: string) => {
    switch (level) {
      case "critical":
        return "text-rose-400";
      case "warning":
        return "text-amber-400";
      default:
        return "text-emerald-400";
    }
  };

  return (
    <div className="space-y-6 font-mono">
      {/* Page Header */}
      <div className="p-4 rounded border border-slate-800 bg-[#111827] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Activity className="h-5 w-5 text-cyan-400" />
          <div>
            <div className="text-[10px] text-slate-500 tracking-wider">VEHICLE DIAGNOSTIC CORE</div>
            <h1 className="text-sm font-bold text-white tracking-widest uppercase">
              TELEMETRY_STATUS // LIVE_METRICS
            </h1>
          </div>
        </div>
        <div className="text-[10px] text-slate-500 uppercase">
          SYS_LOG: LINKED
        </div>
      </div>

      {/* Main Stats Rows */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        
        {/* Left Side: Battery & Signal Cards */}
        <div className="space-y-6">
          {/* Battery section */}
          <div>
            <h2 className="text-xs font-semibold text-slate-400 tracking-wider mb-3 uppercase">
              BATTERY_STORAGE // FUEL_CELLS
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {mockRovers.map((rover) => (
                <div key={rover.id} className="p-4 rounded border border-slate-800 bg-[#111827] space-y-3">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="font-bold text-slate-300 truncate">{rover.name}</span>
                    <span className="text-slate-500 font-semibold">{rover.type.toUpperCase()}</span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-white tracking-tight">{rover.battery}</span>
                    <span className="text-[10px] text-slate-500 font-semibold">% PWR</span>
                  </div>
                  {/* Progress bar */}
                  <div className="h-1.5 w-full bg-slate-950 rounded overflow-hidden">
                    <div
                      className={`h-full rounded transition-all duration-300 ${
                        rover.battery < 40 ? "bg-rose-500" : "bg-cyan-500"
                      }`}
                      style={{ width: `${rover.battery}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-[9px] text-slate-500 pt-1">
                    <span>STATE: DISCHARGING</span>
                    <span>T: {rover.temperature}°C</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Signal Section */}
          <div>
            <h2 className="text-xs font-semibold text-slate-400 tracking-wider mb-3 uppercase">
              SIGNAL_INTEGRITY // CARRIER_RELAYS
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {mockRovers.map((rover) => (
                <div key={rover.id} className="p-4 rounded border border-slate-800 bg-[#111827] space-y-3">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="font-bold text-slate-300 truncate">{rover.name}</span>
                    <span className="text-slate-500 font-semibold">{rover.type.toUpperCase()}</span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-white tracking-tight">{rover.signal}</span>
                    <span className="text-[10px] text-slate-500 font-semibold">% LNK</span>
                  </div>
                  {/* Progress bar */}
                  <div className="h-1.5 w-full bg-slate-950 rounded overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded transition-all duration-300"
                      style={{ width: `${rover.signal}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-[9px] text-slate-500 pt-1">
                    <span>BAND: KU_BAND</span>
                    <span>PING: {rover.lastContact}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Side: Event Logs Timeline */}
        <div className="p-5 border border-slate-800 bg-[#111827]/60 rounded flex flex-col h-full">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <h2 className="text-xs font-semibold text-slate-400 tracking-wider flex items-center gap-1.5 uppercase">
              <Terminal className="h-3.5 w-3.5 text-cyan-400" />
              EVENT_LOG_STREAM // SYSTEM_TERMINAL
            </h2>
            {/* Filter buttons */}
            <div className="flex gap-1 border border-slate-800 bg-[#111827] p-0.5 rounded text-[8px]">
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
          <div className="flex-1 min-h-[300px] max-h-[460px] overflow-y-auto bg-slate-950 p-4 rounded border border-slate-900 space-y-2 text-[10px] leading-relaxed select-text font-mono">
            {filteredLogs.length > 0 ? (
              filteredLogs.map((log, index) => (
                <div key={index} className="flex gap-3 text-slate-400 hover:bg-slate-900/40 py-0.5 transition rounded px-1">
                  <span className="text-slate-600 select-none tabular-nums shrink-0">{log.timestamp}</span>
                  <span className={`font-bold select-none shrink-0 [width:32px] ${getLogLevelClass(log.level)}`}>
                    [{log.category}]
                  </span>
                  <span className="text-slate-300">{log.message}</span>
                </div>
              ))
            ) : (
              <div className="h-40 flex items-center justify-center text-slate-600">
                NO TERMINAL LOGS IN SELECTED GRADE
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
