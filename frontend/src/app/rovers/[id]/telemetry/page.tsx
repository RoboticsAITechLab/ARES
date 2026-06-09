"use client";

import { use } from "react";
import { useMissionStore } from "@/store/mission-store";
import Link from "next/link";
import { Cpu, Battery, Wifi, Thermometer, ArrowLeft, Radio, AreaChart } from "lucide-react";
import StatusBadge from "@/components/StatusBadge";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function RoverTelemetryPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;

  const { rovers, telemetryHistory } = useMissionStore();
  const rover = rovers.find(r => r.id === id);
  const historyData = telemetryHistory[id] || [];

  if (!rover) {
    return (
      <div className="space-y-6 font-mono text-slate-100 text-center py-12">
        <h2 className="text-sm font-bold text-rose-500 uppercase">Rover core segment not found</h2>
        <Link href="/rovers" className="mt-4 inline-block text-[10px] px-3 py-1.5 border border-slate-800 bg-slate-900 text-slate-400 hover:text-white uppercase font-bold">
          Back to Fleet list
        </Link>
      </div>
    );
  }

  // Pure SVG Line Chart Drawer
  const renderSVGChart = (
    key: "battery" | "signal" | "temperature",
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
        <div className="h-[120px] flex items-center justify-center text-slate-600 text-[10px]">
          WAITING FOR TELEMETRY DATA STREAM PACKETS...
        </div>
      );
    }

    const points = historyData.map((p, idx) => {
      const val = p[key];
      const x = (idx / (historyData.length - 1)) * chartWidth;
      const y = chartHeight - ((val - minVal) / (maxVal - minVal)) * chartHeight;
      return { x, y, val };
    });

    const pathD = points.map((p, idx) => `${idx === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
    
    // Draw area gradient path
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
          <span className="font-bold uppercase">Uplink: NOMINAL // Last: {historyData[historyData.length - 1][key].toFixed(1)}{unit}</span>
          <span>Sol {historyData[historyData.length - 1].sol}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 font-mono text-slate-100 animate-fade-in">
      {/* Header breadcrumb */}
      <div className="flex justify-between items-center select-none">
        <Link href="/rovers" className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-200 text-[10px] uppercase font-bold">
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Fleet inventory</span>
        </Link>

        {/* Tab links */}
        <div className="flex gap-1 border border-slate-800 bg-[#111827] p-0.5 rounded text-[9px] font-bold">
          <Link href={`/rovers/${rover.id}`} className="px-3 py-1.5 rounded text-slate-500 hover:text-slate-350 uppercase">
            Overview
          </Link>
          <Link href={`/rovers/${rover.id}/telemetry`} className="px-3 py-1.5 rounded bg-slate-850 text-cyan-400 font-extrabold uppercase">
            Charts
          </Link>
          <Link href={`/rovers/${rover.id}/history`} className="px-3 py-1.5 rounded text-slate-500 hover:text-slate-350 uppercase">
            Logs
          </Link>
        </div>
      </div>

      {/* Title */}
      <div className="p-4 rounded border border-slate-800 bg-[#111827] flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <AreaChart className="h-5 w-5 text-cyan-400" />
          <div>
            <div className="text-[10px] text-slate-500 tracking-wider">HISTORICAL TELEMETRY TIMELINE</div>
            <h1 className="text-sm font-black tracking-widest text-white uppercase">
              {rover.name} <span className="text-slate-700">//</span> TELEMETRY_HISTORY
            </h1>
          </div>
        </div>
        <StatusBadge status={rover.status} />
      </div>

      {/* Charts List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Battery history */}
        <div className="p-4 rounded border border-slate-800 bg-[#111827] space-y-3 shadow-md">
          <h3 className="text-xs font-bold text-slate-400 tracking-wider flex items-center gap-1.5 uppercase select-none">
            <Battery className="h-4 w-4 text-cyan-400" />
            POWER_CORE_HISTORY (BATTERY)
          </h3>
          {renderSVGChart("battery", 0, 100, "text-cyan-400", "shadow-[0_0_10px_rgba(6,182,212,0.4)]", "%")}
        </div>

        {/* Signal history */}
        <div className="p-4 rounded border border-slate-800 bg-[#111827] space-y-3 shadow-md">
          <h3 className="text-xs font-bold text-slate-400 tracking-wider flex items-center gap-1.5 uppercase select-none">
            <Wifi className="h-4 w-4 text-emerald-400" />
            ORBITAL_LINK_HISTORY (SIGNAL)
          </h3>
          {renderSVGChart("signal", 0, 100, "text-emerald-400", "shadow-[0_0_10px_rgba(16,185,129,0.4)]", "%")}
        </div>

        {/* Temperature history */}
        <div className="p-4 rounded border border-slate-800 bg-[#111827] space-y-3 shadow-md md:col-span-2">
          <h3 className="text-xs font-bold text-slate-400 tracking-wider flex items-center gap-1.5 uppercase select-none">
            <Thermometer className="h-4 w-4 text-purple-400" />
            THERMAL_SWEEPER_HISTORY (CORE_TEMP)
          </h3>
          {renderSVGChart("temperature", -100, 150, "text-purple-450", "shadow-[0_0_10px_rgba(168,85,247,0.4)]", "°C")}
        </div>
      </div>
    </div>
  );
}
