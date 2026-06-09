"use client";

import { cn } from "@/lib/utils";
import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";

interface TelemetryCardProps {
  label: string;
  value: string | number;
  unit?: string;
  status?: "nominal" | "warning" | "critical" | string;
  trend?: "up" | "down" | "stable" | string;
  percent?: number; // for rendering a visual progress bar
  className?: string;
}

export default function TelemetryCard({
  label,
  value,
  unit = "",
  status = "nominal",
  trend = "stable",
  percent,
  className,
}: TelemetryCardProps) {
  let statusColor = "text-slate-300";
  let barColor = "bg-cyan-500";
  let glowClass = "shadow-[0_0_8px_rgba(6,182,212,0.3)]";

  const normStatus = (status || "").toLowerCase();

  if (normStatus === "warning") {
    statusColor = "text-amber-400";
    barColor = "bg-amber-500";
    glowClass = "shadow-[0_0_8px_rgba(245,158,11,0.3)]";
  } else if (normStatus === "critical") {
    statusColor = "text-rose-400 font-bold animate-pulse";
    barColor = "bg-rose-500";
    glowClass = "shadow-[0_0_8px_rgba(239,68,68,0.4)]";
  } else if (normStatus === "nominal" || normStatus === "online" || normStatus === "success") {
    statusColor = "text-emerald-400 font-semibold";
    barColor = "bg-emerald-500";
    glowClass = "shadow-[0_0_8px_rgba(16,185,129,0.3)]";
  }

  const renderTrendIcon = () => {
    if (trend === "up") {
      return (
        <span title="Trending Up">
          <ArrowUpRight className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
        </span>
      );
    }
    if (trend === "down") {
      return (
        <span title="Trending Down">
          <ArrowDownRight className="h-3.5 w-3.5 text-rose-400 shrink-0" />
        </span>
      );
    }
    return (
      <span title="Stable">
        <Minus className="h-3.5 w-3.5 text-slate-500 shrink-0" />
      </span>
    );
  };

  return (
    <div className={cn("cyber-card p-4 rounded bg-[#0C1222] border border-slate-800/80 space-y-2 font-mono flex flex-col justify-between min-h-[90px]", className)}>
      <div className="flex justify-between items-start gap-2">
        <span className="text-slate-500 uppercase tracking-widest text-[8px] font-bold select-none truncate" title={label}>
          {label}
        </span>
        {renderTrendIcon()}
      </div>

      <div className="flex items-baseline gap-1 mt-1">
        <span className={cn("text-lg font-black tracking-wide tabular-nums", statusColor)}>{value}</span>
        {unit && <span className="text-[9px] text-slate-500 uppercase font-semibold">{unit}</span>}
      </div>

      {percent !== undefined && (
        <div className="w-full space-y-1">
          <div className="h-1 w-full bg-slate-950 rounded-full overflow-hidden p-0">
            <div
              className={cn("h-full rounded-sm transition-all duration-300", barColor, glowClass)}
              style={{ width: `${percent}%` }}
            ></div>
          </div>
        </div>
      )}
    </div>
  );
}
