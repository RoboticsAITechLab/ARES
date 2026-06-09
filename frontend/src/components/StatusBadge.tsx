"use client";

import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: "ONLINE" | "DEGRADED" | "OFFLINE" | "UNKNOWN" | "NOMINAL" | "WARNING" | "CRITICAL" | string;
  className?: string;
}

export default function StatusBadge({ status, className }: StatusBadgeProps) {
  const norm = (status || "").toUpperCase();
  
  let dotColor = "bg-slate-400 text-slate-400";
  let badgeColor = "border-slate-800 bg-slate-900/60 text-slate-400";
  
  if (norm === "ONLINE" || norm === "NOMINAL") {
    dotColor = "bg-emerald-400 text-emerald-400";
    badgeColor = "border-emerald-500/25 bg-emerald-500/5 text-emerald-300";
  } else if (norm === "DEGRADED" || norm === "WARNING") {
    dotColor = "bg-amber-400 text-amber-400";
    badgeColor = "border-amber-500/20 bg-amber-500/5 text-amber-300";
  } else if (norm === "OFFLINE" || norm === "CRITICAL") {
    dotColor = "bg-rose-500 text-rose-500";
    badgeColor = "border-rose-500/20 bg-rose-500/5 text-rose-300";
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-0.5 rounded border text-[9px] font-mono font-extrabold uppercase tracking-widest leading-none select-none",
        badgeColor,
        className
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full animate-status-pulse shrink-0", dotColor)}></span>
      <span>{norm}</span>
    </span>
  );
}
