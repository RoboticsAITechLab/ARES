"use client";

import { cn } from "@/lib/utils";
import { Cpu, Battery, Wifi, Compass, HelpCircle } from "lucide-react";

interface MapSidebarProps {
  rovers: any[];
  selectedRoverId: string | null;
  onSelectRover: (id: string | null) => void;
}

export default function MapSidebar({
  rovers,
  selectedRoverId,
  onSelectRover,
}: MapSidebarProps) {
  const selectedRover = rovers.find(r => r.id === selectedRoverId);

  return (
    <div className="border border-slate-800 bg-[#111827] rounded p-4 flex flex-col gap-4 font-mono w-full shadow-md select-none h-full justify-between">
      {/* Rover Selection list */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold text-slate-400 tracking-wider flex items-center gap-1.5 uppercase">
          <Cpu className="h-3.5 w-3.5 text-cyan-400" />
          ROVER_SELECTION
        </h3>

        <div className="space-y-1.5">
          {rovers.map((r) => {
            const isSelected = r.id === selectedRoverId;
            return (
              <button
                key={r.id}
                onClick={() => onSelectRover(isSelected ? null : r.id)}
                className={cn(
                  "w-full text-left p-2.5 rounded border text-[10px] font-bold transition flex items-center justify-between cursor-pointer",
                  isSelected
                    ? "bg-[#0A0F1C] border-cyan-500/40 text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.03)]"
                    : "border-slate-800 bg-slate-900/40 text-slate-400 hover:bg-slate-900/60 hover:text-slate-200"
                )}
              >
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "h-1.5 w-1.5 rounded-full",
                    r.status.toLowerCase() === "error" || r.status.toLowerCase() === "offline" ? "bg-rose-500 animate-pulse" :
                    r.battery < 40 ? "bg-amber-500" : "bg-emerald-400"
                  )}></span>
                  <span>{r.id.toUpperCase()}</span>
                </div>
                <span className="text-[8px] text-slate-500 font-normal uppercase">({r.status})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tracking Panel */}
      <div className="border-t border-slate-800/80 pt-4 mt-2">
        <h3 className="text-xs font-semibold text-slate-400 tracking-wider flex items-center gap-1.5 uppercase mb-3">
          <Compass className="h-3.5 w-3.5 text-cyan-400" />
          LIVE_TRACKING
        </h3>

        {selectedRover ? (
          <div className="bg-slate-950/40 border border-slate-900 p-3 rounded space-y-2.5 text-[9px] text-slate-300">
            <div className="flex justify-between border-b border-slate-900 pb-1.5">
              <span className="text-slate-500">COORDS:</span>
              <span className="font-bold text-slate-100 tabular-nums">
                LA {selectedRover.latitude.toFixed(5)} / LO {selectedRover.longitude.toFixed(5)}
              </span>
            </div>
            <div className="flex justify-between border-b border-slate-900 pb-1.5">
              <span className="text-slate-500">SPEED:</span>
              <span className="font-bold text-slate-100 tabular-nums">
                {selectedRover.speed.toFixed(2)} m/s
              </span>
            </div>
            <div className="flex justify-between border-b border-slate-900 pb-1.5">
              <span className="text-slate-500">HEADING:</span>
              <span className="font-bold text-slate-100 tabular-nums">
                {selectedRover.heading}°
              </span>
            </div>
            <div className="flex justify-between border-b border-slate-900 pb-1.5 flex-col gap-1.5">
              <span className="text-slate-500 font-bold">POWER CORE:</span>

              <div className="flex justify-between items-center gap-2">
                <div className="h-1 flex-1 bg-slate-900 rounded-full overflow-hidden">
                  <div 
                    className={cn(
                      "h-full rounded-full",
                      selectedRover.battery < 40 ? "bg-rose-500" : "bg-cyan-500"
                    )}
                    style={{ width: `${selectedRover.battery}%` }}
                  ></div>
                </div>
                <span className="font-extrabold text-slate-100">{selectedRover.battery.toFixed(1)}%</span>
              </div>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-bold">SIGNAL LINK:</span>
              <span className="font-bold text-emerald-400 flex items-center gap-1">
                <Wifi className="h-3 w-3" />
                {selectedRover.signal}%
              </span>
            </div>
          </div>
        ) : (
          <div className="h-28 flex flex-col items-center justify-center border border-dashed border-slate-800 rounded text-slate-500 text-[10px] text-center px-4 leading-relaxed">
            <HelpCircle className="h-5 w-5 text-slate-600 mb-1.5" />
            SELECT A ROVER NODE TO MOUNT REAL-TIME DIAGNOSTIC TELEMETRY
          </div>
        )}
      </div>
    </div>
  );
}
