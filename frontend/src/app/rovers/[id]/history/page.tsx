"use client";

import { use } from "react";
import { useMissionStore } from "@/store/mission-store";
import Link from "next/link";
import { Cpu, ArrowLeft, Radio, List, Calendar } from "lucide-react";
import StatusBadge from "@/components/StatusBadge";
import { cn } from "@/lib/utils";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function RoverHistoryPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;

  const { rovers, events } = useMissionStore();
  const rover = rovers.find(r => r.id === id);
  const roverEvents = events.filter(e => e.source === rover?.name);

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

  const getSeverityClass = (sev: string) => {
    switch (sev) {
      case "CRITICAL":
        return "text-rose-550 border-rose-500/20 bg-rose-500/5";
      case "WARNING":
        return "text-amber-500 border-amber-500/20 bg-amber-500/5";
      case "INFO":
      default:
        return "text-emerald-400 border-emerald-500/20 bg-emerald-500/5";
    }
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
          <Link href={`/rovers/${rover.id}/telemetry`} className="px-3 py-1.5 rounded text-slate-500 hover:text-slate-350 uppercase">
            Charts
          </Link>
          <Link href={`/rovers/${rover.id}/history`} className="px-3 py-1.5 rounded bg-slate-850 text-cyan-400 font-extrabold uppercase">
            Logs
          </Link>
        </div>
      </div>

      {/* Title */}
      <div className="p-4 rounded border border-slate-800 bg-[#111827] flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <List className="h-5 w-5 text-cyan-400" />
          <div>
            <div className="text-[10px] text-slate-500 tracking-wider">VEHICLE LOG ENTRY HISTORY</div>
            <h1 className="text-sm font-black tracking-widest text-white uppercase">
              {rover.name} <span className="text-slate-700">//</span> MET_CHRONOLOGY
            </h1>
          </div>
        </div>
        <StatusBadge status={rover.status} />
      </div>

      {/* Log list timeline container */}
      <div className="p-5 border border-slate-800 bg-[#111827] rounded shadow-md space-y-6">
        <div className="relative pl-6 space-y-5 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-[1px] before:bg-slate-800 select-text">
          {roverEvents.length > 0 ? (
            roverEvents.map((evt, idx) => (
              <div key={evt.id} className="relative flex items-start gap-4 text-[10px] hover:bg-slate-900/10 p-1.5 rounded transition">
                {/* Stepper Dot */}
                <div className="absolute -left-6.5 top-2.5">
                  <div className={cn(
                    "h-2 w-2 rounded-full border bg-slate-950",
                    evt.severity === "CRITICAL" ? "border-rose-500 bg-rose-500" :
                    evt.severity === "WARNING" ? "border-amber-500 bg-amber-500" :
                    "border-emerald-400 bg-emerald-400"
                  )}></div>
                </div>

                {/* Event info */}
                <div className="flex-1 space-y-1.5">
                  <div className="flex items-center gap-2 select-none">
                    <span className={cn("text-[8px] font-bold px-1.5 py-0.2 rounded border uppercase", getSeverityClass(evt.severity))}>
                      {evt.severity}
                    </span>
                    <span className="text-[8px] text-slate-500 font-bold uppercase">{evt.category}</span>
                    <span className="text-[8px] text-slate-600 font-bold">•</span>
                    <span className="text-slate-500 text-[9px] tabular-nums font-semibold">{evt.timestamp}</span>
                  </div>
                  <p className="text-slate-200 leading-normal text-[11px] font-medium">{evt.description}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="h-28 flex flex-col items-center justify-center text-slate-550 text-xs select-none">
              <Calendar className="h-6 w-6 text-slate-700 mb-2" />
              NO EVENT LOG FILES COMPILED FOR THIS VEHICLE CORE
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
