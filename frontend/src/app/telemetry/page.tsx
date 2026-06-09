"use client";

import { useState } from "react";
import { Activity, Battery, Wifi, Thermometer, Cpu, ShieldAlert, FileText } from "lucide-react";
import { useMissionStore } from "@/store/mission-store";
import TelemetryCard from "@/components/TelemetryCard";

export default function TelemetryPage() {
  const [logFilter, setLogFilter] = useState<"all" | "nominal" | "warning" | "critical">("all");
  const { rovers, events, isEmergencyStop } = useMissionStore();

  const filteredLogs = events.filter((log) => {
    if (logFilter === "all") return true;
    if (logFilter === "nominal") return log.severity === "INFO";
    if (logFilter === "warning") return log.severity === "WARNING";
    if (logFilter === "critical") return log.severity === "CRITICAL";
    return true;
  });

  const getLogLevelClass = (severity: string) => {
    switch (severity) {
      case "CRITICAL":
        return "text-rose-500 font-bold";
      case "WARNING":
        return "text-amber-500 font-bold";
      default:
        return "text-emerald-400 font-semibold";
    }
  };

  const motherRover = rovers.find((r) => r.type === "mother")!;
  const scoutRovers = rovers.filter((r) => r.type === "scout");

  return (
    <div className="space-y-6 font-mono animate-fade-in">
      {/* 1. Simulated Telemetry Warning Banner (No Blinking) */}
      <div className="p-3.5 rounded border border-amber-500/20 bg-amber-500/5 text-amber-300 text-[10px] flex items-center gap-3 select-none">
        <ShieldAlert className="h-4 w-4 shrink-0 text-amber-400" />
        <div>
          <span className="font-extrabold uppercase">SIMULATED TELEMETRY FEED ACTIVE</span>
          <p className="text-[9px] text-slate-400 mt-0.5 leading-normal">
            This dashboard operates on simulated telemetry packets generated via static orbital iteration. Values represent real-time state machines bound to user directive events.
          </p>
        </div>
      </div>

      {/* Page Header */}
      <div className="p-4 rounded border border-slate-800 bg-[#111827] flex items-center justify-between shadow-lg select-none">
        <div className="flex items-center gap-3">
          <Activity className="h-5 w-5 text-cyan-400 animate-status-pulse" />
          <div>
            <div className="text-[10px] text-slate-500 tracking-wider font-bold">VEHICLE LOGISTICS CORE</div>
            <h1 className="text-sm font-black text-white tracking-widest uppercase">
              TELEMETRY_DIAGNOSTICS // SYSTEMS_CHECK
            </h1>
          </div>
        </div>
        <div className="text-[10px] text-slate-500 uppercase font-bold">
          DSN LOCK: SECURE
        </div>
      </div>

      {/* Grid: Prioritizing Mother Rover first, then Scouts, then Operations Log */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left Section (takes 2/3 width on desktop/laptop) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* ARES MotherShip - Hero (1st Priority) */}
          <div className="space-y-3">
            <div className="flex justify-between items-center text-xs text-slate-400 tracking-wider uppercase select-none">
              <span>Primary Commander Telemetry</span>
              <span className="text-[9px] text-cyan-400 font-bold">Node: {motherRover.id}</span>
            </div>
            
            <div className="p-5 rounded border border-slate-800 bg-[#111827] space-y-4 shadow-md">
              <div className="flex justify-between items-center border-b border-slate-800/80 pb-3 select-none">
                <h2 className="text-sm font-black text-white tracking-wider uppercase">
                  {motherRover.name} // COM_NODE
                </h2>
                <span className={`text-[8px] px-2 py-0.5 rounded border uppercase tracking-widest font-extrabold ${
                  isEmergencyStop 
                    ? "border-rose-500/35 bg-rose-500/5 text-rose-400" 
                    : "border-slate-850 bg-slate-950/40 text-slate-400"
                }`}>
                  {isEmergencyStop ? "FAILSAFE_STOP" : "ONLINE_ACTIVE"}
                </span>
              </div>

              {/* Mother Rover Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <TelemetryCard
                  label="Power core Capacity"
                  value={motherRover.battery}
                  unit="%"
                  status={motherRover.battery < 40 ? "warning" : "nominal"}
                  trend="stable"
                  percent={motherRover.battery}
                />
                
                <TelemetryCard
                  label="Orbital DSN lock"
                  value={motherRover.signal}
                  unit="%"
                  status={isEmergencyStop ? "warning" : "nominal"}
                  trend={isEmergencyStop ? "down" : "stable"}
                  percent={motherRover.signal}
                />

                <TelemetryCard
                  label="CPU core load"
                  value={motherRover.cpu}
                  unit="%"
                  status={motherRover.cpu > 80 ? "warning" : "nominal"}
                  trend={motherRover.cpu > 70 ? "up" : "stable"}
                  percent={motherRover.cpu}
                />

                <TelemetryCard
                  label="Memory buffer"
                  value={motherRover.memory}
                  unit="%"
                  percent={motherRover.memory}
                />

                <TelemetryCard
                  label="Thermal core temp"
                  value={motherRover.temperature}
                  unit="°C"
                  status={motherRover.temperature > 40 ? "warning" : "nominal"}
                  trend="stable"
                />

                <TelemetryCard
                  label="Total node health"
                  value={motherRover.health}
                  unit="%"
                  status={motherRover.health < 85 ? "warning" : "nominal"}
                  trend={isEmergencyStop ? "down" : "stable"}
                />
              </div>
            </div>
          </div>

          {/* Scout Fleet Telemetry - Subordinate (2nd Priority) */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-slate-400 tracking-wider uppercase select-none">
              Subordinate Scout Fleet Telemetry
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {scoutRovers.map((scout) => (
                <div key={scout.id} className="p-4 rounded border border-slate-850 bg-[#111827] space-y-4 shadow-md">
                  <div className="flex justify-between items-center border-b border-slate-800/80 pb-2 select-none">
                    <h4 className="text-xs font-black text-white tracking-widest uppercase">{scout.name}</h4>
                    <span className={`text-[8px] px-1.5 py-0.2 rounded border font-extrabold uppercase ${
                      scout.status === "ERROR" || scout.status === "OFFLINE"
                        ? "border-rose-500/30 text-rose-500 animate-pulse" 
                        : scout.status === "EXPLORING" || scout.status === "RETURNING"
                        ? "border-amber-500/20 text-amber-400"
                        : "border-slate-800 text-slate-400"
                    }`}>
                      {scout.status}
                    </span>
                  </div>

                  {/* Scout Metrics */}
                  <div className="grid grid-cols-2 gap-4 text-[9px] text-slate-400">
                    <div className="space-y-1">
                      <div className="flex justify-between font-bold">
                        <span className="flex items-center gap-1"><Battery className="h-3 w-3 text-cyan-400" /> BAT</span>
                        <span className="text-slate-300 font-extrabold">{scout.battery}%</span>
                      </div>
                      <div className="h-0.5 w-full bg-slate-950 rounded-full overflow-hidden">
                        <div className={`h-full ${scout.battery < 40 ? "bg-rose-500" : "bg-cyan-500"}`} style={{ width: `${scout.battery}%` }}></div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between font-bold">
                        <span className="flex items-center gap-1"><Wifi className="h-3 w-3 text-cyan-400" /> LNK</span>
                        <span className="text-slate-300 font-extrabold">{scout.signal}%</span>
                      </div>
                      <div className="h-0.5 w-full bg-slate-950 rounded-full overflow-hidden">
                        <div className="h-full bg-cyan-500" style={{ width: `${scout.signal}%` }}></div>
                      </div>
                    </div>

                    <div className="flex justify-between pt-1 border-t border-slate-800/60 font-semibold col-span-2">
                      <span className="flex items-center gap-1"><Cpu className="h-3.5 w-3.5 text-slate-500" /> CPU LOAD:</span>
                      <span className="text-slate-200 font-bold">{scout.cpu}%</span>
                    </div>

                    <div className="flex justify-between font-semibold col-span-2">
                      <span className="flex items-center gap-1"><Cpu className="h-3.5 w-3.5 text-slate-500" /> MEM MEMORY:</span>
                      <span className="text-slate-200 font-bold">{scout.memory}%</span>
                    </div>

                    <div className="flex justify-between font-semibold col-span-2">
                      <span className="flex items-center gap-1"><Thermometer className="h-3.5 w-3.5 text-slate-500" /> THERM CORE:</span>
                      <span className="text-slate-200 font-bold">{scout.temperature}°C</span>
                    </div>

                    <div className="flex justify-between font-semibold col-span-2">
                      <span className="flex items-center gap-1"><Activity className="h-3.5 w-3.5 text-slate-500" /> SYS HEALTH:</span>
                      <span className="text-slate-200 font-bold">{scout.health}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Section: Operations Log (3rd Priority) */}
        <div className="p-5 border border-slate-800 bg-[#111827] rounded flex flex-col h-[580px] shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 select-none">
            <h2 className="text-xs font-semibold text-slate-400 tracking-wider flex items-center gap-1.5 uppercase">
              <FileText className="h-3.5 w-3.5 text-cyan-400" />
              OPERATIONAL_LOGS
            </h2>
            <div className="flex gap-1 border border-slate-800 bg-slate-950 p-0.5 rounded text-[8px] max-w-fit">
              {["all", "nominal", "warning", "critical"].map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setLogFilter(lvl as any)}
                  className={`px-2 py-0.5 rounded transition uppercase tracking-wider font-bold cursor-pointer ${
                    logFilter === lvl
                      ? "bg-slate-800 text-cyan-400"
                      : "text-slate-500 hover:text-slate-300"
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          {/* CRT Monitor styled Terminal log box */}
          <div className="crt-monitor relative flex-1 min-h-[350px] overflow-hidden rounded border border-slate-900 bg-[#060913] flex flex-col">
            <div className="crt-scanline"></div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-2 text-[10px] leading-relaxed select-text font-mono">
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log, index) => (
                  <div key={index} className="flex gap-3 text-slate-400 hover:bg-slate-900/30 py-0.5 transition rounded px-1.5">
                    <span className="text-slate-600 select-none tabular-nums shrink-0">{log.timestamp}</span>
                    <span className={`font-bold select-none shrink-0 w-8 truncate uppercase ${getLogLevelClass(log.severity)}`}>
                      [{log.category}]
                    </span>
                    <span className="text-slate-300 break-all">{log.description}</span>
                  </div>
                ))
              ) : (
                <div className="h-full flex items-center justify-center text-slate-600 font-bold select-none">
                  NO LOG SEGMENTS RECORDED AT THIS FILTER LEVEL
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
