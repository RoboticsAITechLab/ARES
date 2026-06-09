"use client";

import { useState } from "react";
import { Activity, Battery, Wifi, Thermometer, Cpu, ShieldAlert, FileText, Gauge } from "lucide-react";
import { useMissionStore } from "@/store/mission-store";
import TelemetryCard from "@/components/TelemetryCard";

export default function TelemetryPage() {
  const { rovers, events, isEmergencyStop, telemetryHistory } = useMissionStore();
  const [selectedRoverId, setSelectedRoverId] = useState<string>(rovers[0]?.id || "mother-rover");
  const [logFilter, setLogFilter] = useState<"all" | "nominal" | "warning" | "critical">("all");

  const rover = rovers.find((r) => r.id === selectedRoverId) || rovers[0];
  const historyData = telemetryHistory[selectedRoverId] || [];

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

  // Pure SVG Line Chart Drawer
  const renderSVGChart = (
    key: "battery" | "signal" | "temperature" | "speed",
    minVal: number,
    maxVal: number,
    colorClass: string,
    glowClass: string,
    unit: string
  ) => {
    const chartWidth = 500;
    const chartHeight = 120;

    if (historyData.length < 2) {
      return (
        <div className="h-[120px] flex items-center justify-center text-slate-650 text-[10px]">
          WAITING FOR TELEMETRY DATA STREAM PACKETS...
        </div>
      );
    }

    const points = historyData.map((p, idx) => {
      const val = p[key] ?? 0;
      const x = (idx / (historyData.length - 1)) * chartWidth;
      const y = chartHeight - ((val - minVal) / (maxVal - minVal)) * chartHeight;
      return { x, y, val };
    });

    const pathD = points.map((p, idx) => `${idx === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
    const areaD = `${pathD} L ${chartWidth} ${chartHeight} L 0 ${chartHeight} Z`;

    return (
      <div className="space-y-2 font-mono">
        <div className="relative border border-slate-900 bg-slate-950 p-2 rounded overflow-hidden aspect-[4/1] flex items-center justify-center">
          <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-full text-slate-900 overflow-visible">
            {/* Grid Lines */}
            <line x1="0" y1={chartHeight * 0.25} x2={chartWidth} y2={chartHeight * 0.25} stroke="rgba(30, 41, 59, 0.25)" strokeWidth="0.5" />
            <line x1="0" y1={chartHeight * 0.5} x2={chartWidth} y2={chartHeight * 0.5} stroke="rgba(30, 41, 59, 0.25)" strokeWidth="0.5" />
            <line x1="0" y1={chartHeight * 0.75} x2={chartWidth} y2={chartHeight * 0.75} stroke="rgba(30, 41, 59, 0.25)" strokeWidth="0.5" />

            {/* Area fill */}
            <path d={areaD} className={`fill-current opacity-5 ${colorClass}`} />

            {/* Line path */}
            <path d={pathD} className={`fill-none stroke-current ${colorClass} ${glowClass}`} strokeWidth="1.8" />

            {/* Dots */}
            {points.map((p, idx) => (
              <g key={idx}>
                <circle cx={p.x} cy={p.y} r="2.5" className={`fill-current ${colorClass}`} />
                {idx === points.length - 1 && (
                  <circle cx={p.x} cy={p.y} r="6" className={`fill-none stroke-current animate-ping ${colorClass}`} strokeWidth="0.8" />
                )}
              </g>
            ))}
          </svg>
        </div>

        {/* Legend / Range labels */}
        <div className="flex justify-between text-[8px] text-slate-500 select-none">
          <span>Sol {historyData[0].sol}</span>
          <span className="font-bold uppercase">Uplink: NOMINAL // Last: {historyData[historyData.length - 1][key]?.toFixed(1)}{unit}</span>
          <span>Sol {historyData[historyData.length - 1].sol}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 font-mono animate-fade-in text-slate-100">
      {/* 1. Simulated Telemetry Warning Banner */}
      <div className="p-3.5 rounded border border-amber-500/20 bg-amber-500/5 text-amber-300 text-[10px] flex items-center gap-3 select-none">
        <ShieldAlert className="h-4 w-4 shrink-0 text-amber-400" />
        <div>
          <span className="font-extrabold uppercase">SIMULATED TELEMETRY FEED ACTIVE</span>
          <p className="text-[9px] text-slate-400 mt-0.5 leading-normal">
            This dashboard operates on simulated telemetry packets generated via static orbital iteration. Values represent real-time state machines bound to user directive events.
          </p>
        </div>
      </div>

      {/* Page Header with Dropdown */}
      <div className="p-4 rounded border border-slate-800 bg-[#111827] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg select-none">
        <div className="flex items-center gap-3">
          <Activity className="h-5 w-5 text-cyan-400 animate-status-pulse" />
          <div>
            <div className="text-[10px] text-slate-500 tracking-wider font-bold">VEHICLE LOGISTICS CORE</div>
            <h1 className="text-sm font-black text-white tracking-widest uppercase">
              TELEMETRY_DIAGNOSTICS // SYSTEMS_CHECK
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2.5 text-[10px]">
          <span className="text-slate-500 font-bold uppercase">SELECT VEHICLE:</span>
          <select
            value={selectedRoverId}
            onChange={(e) => setSelectedRoverId(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-350 p-2 rounded focus:outline-none focus:border-cyan-500/40 font-bold text-[10px] cursor-pointer"
          >
            {rovers.map(r => (
              <option key={r.id} value={r.id}>{r.name.toUpperCase()}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Grid: Telemetry Dashboard & Operations Log */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left Section: Active vehicle metrics and SVGs charts (takes 2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Diagnostic Metrics Cards */}
          <div className="p-5 rounded border border-slate-800 bg-[#111827] space-y-4 shadow-md">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3 select-none">
              <h2 className="text-sm font-black text-white tracking-wider uppercase">
                {rover.name} // CORE_HEALTH
              </h2>
              <span className={`text-[8px] px-2 py-0.5 rounded border uppercase tracking-widest font-extrabold ${
                isEmergencyStop 
                  ? "border-rose-500/35 bg-rose-500/5 text-rose-400 animate-pulse" 
                  : "border-slate-800 bg-slate-950/40 text-slate-400"
              }`}>
                {isEmergencyStop ? "FAILSAFE_STOP" : rover.status}
              </span>
            </div>

            {/* Metrics cards grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <TelemetryCard
                label="Power Core Capacity"
                value={rover.battery}
                unit="%"
                status={rover.battery < 40 ? "warning" : "nominal"}
                trend="stable"
                percent={rover.battery}
              />
              
              <TelemetryCard
                label="Orbital DSN Lock"
                value={rover.signal}
                unit="%"
                status={rover.signal < 50 ? "warning" : "nominal"}
                trend="stable"
                percent={rover.signal}
              />

              <TelemetryCard
                label="Thermal Core Temp"
                value={rover.temperature}
                unit="°C"
                status={rover.temperature > 40 || rover.temperature < -40 ? "warning" : "nominal"}
                trend="stable"
              />

              <TelemetryCard
                label="Node Velocity"
                value={rover.speed}
                unit=" m/s"
                status="nominal"
                trend="stable"
              />
            </div>
          </div>

          {/* Diagnostic SVG History Charts */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Battery History */}
            <div className="p-4 rounded border border-slate-800 bg-[#111827] space-y-3 shadow-md">
              <h3 className="text-xs font-bold text-slate-400 tracking-wider flex items-center gap-1.5 uppercase select-none">
                <Battery className="h-4 w-4 text-cyan-400" />
                POWER_CORE_HISTORY (BATTERY)
              </h3>
              {renderSVGChart("battery", 0, 100, "text-cyan-400", "shadow-[0_0_10px_rgba(6,182,212,0.4)]", "%")}
            </div>

            {/* Signal History */}
            <div className="p-4 rounded border border-slate-800 bg-[#111827] space-y-3 shadow-md">
              <h3 className="text-xs font-bold text-slate-400 tracking-wider flex items-center gap-1.5 uppercase select-none">
                <Wifi className="h-4 w-4 text-emerald-400" />
                ORBITAL_LINK_HISTORY (SIGNAL)
              </h3>
              {renderSVGChart("signal", 0, 100, "text-emerald-400", "shadow-[0_0_10px_rgba(16,185,129,0.4)]", "%")}
            </div>

            {/* Temp History */}
            <div className="p-4 rounded border border-slate-800 bg-[#111827] space-y-3 shadow-md">
              <h3 className="text-xs font-bold text-slate-400 tracking-wider flex items-center gap-1.5 uppercase select-none">
                <Thermometer className="h-4 w-4 text-purple-400" />
                THERMAL_SWEEPER_HISTORY (TEMP)
              </h3>
              {renderSVGChart("temperature", -100, 150, "text-purple-400", "shadow-[0_0_10px_rgba(168,85,247,0.4)]", "°C")}
            </div>

            {/* Speed/Velocity History */}
            <div className="p-4 rounded border border-slate-800 bg-[#111827] space-y-3 shadow-md">
              <h3 className="text-xs font-bold text-slate-400 tracking-wider flex items-center gap-1.5 uppercase select-none">
                <Gauge className="h-4 w-4 text-amber-400" />
                VELOCITY_HISTORY (SPEED)
              </h3>
              {renderSVGChart("speed", 0, 3, "text-amber-400", "shadow-[0_0_10px_rgba(245,158,11,0.4)]", " m/s")}
            </div>
          </div>

        </div>

        {/* Right Section: Operations Log (takes 1/3 width) */}
        <div className="p-5 border border-slate-800 bg-[#111827] rounded flex flex-col h-[650px] shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 select-none">
            <h2 className="text-xs font-semibold text-slate-400 tracking-wider flex items-center gap-1.5 uppercase">
              <FileText className="h-3.5 w-3.5 text-cyan-400" />
              OPERATIONAL_LOGS
            </h2>
            <div className="flex gap-1 border border-slate-800 bg-slate-950 p-0.5 rounded text-[8px] max-w-fit font-bold">
              {["all", "nominal", "warning", "critical"].map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setLogFilter(lvl as any)}
                  className={`px-2 py-0.5 rounded transition uppercase tracking-wider font-bold cursor-pointer ${
                    logFilter === lvl
                      ? "bg-slate-800 text-cyan-400"
                      : "text-slate-500 hover:text-slate-350"
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          {/* CRT monitor style */}
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
                <div className="h-full flex items-center justify-center text-slate-600 font-bold select-none text-center uppercase">
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
