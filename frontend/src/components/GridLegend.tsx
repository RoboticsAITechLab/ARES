"use client";

import { Layers } from "lucide-react";

export default function GridLegend() {
  return (
    <div className="p-4 border border-slate-800 bg-[#111827] rounded space-y-4 font-mono w-full shadow-md">
      <h3 className="text-xs font-semibold text-slate-400 tracking-wider flex items-center gap-1.5 uppercase select-none">
        <Layers className="h-3.5 w-3.5 text-cyan-400" />
        MAP_LEGEND
      </h3>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-1 gap-3.5 text-[9px] text-slate-400 leading-normal">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-cyan-400 shrink-0 animate-status-pulse"></span>
          <span className="font-bold text-slate-200 uppercase truncate">MOTHER ROVER</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-400 shrink-0"></span>
          <span className="font-bold text-slate-200 uppercase truncate">SCOUT (NOMINAL)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-amber-500 shrink-0 animate-status-pulse"></span>
          <span className="font-bold text-amber-500 uppercase truncate">SCOUT (WARNING)</span>
        </div>
        <div className="flex items-center gap-2">
          <svg className="relative h-3 w-3 flex items-center justify-center shrink-0" viewBox="0 0 12 12" fill="none">
            <line x1="1" y1="6" x2="11" y2="6" stroke="#EF4444" strokeWidth="1.5" />
            <line x1="6" y1="1" x2="6" y2="11" stroke="#EF4444" strokeWidth="1.5" />
          </svg>
          <span className="font-bold text-rose-400 uppercase truncate">HAZARD POINT</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 border border-dashed border-cyan-500/25 bg-cyan-500/5 block shrink-0"></span>
          <span className="font-bold text-slate-300 uppercase truncate">EXPLORED RANGE</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 border border-dashed border-slate-800 block shrink-0"></span>
          <span className="font-bold text-slate-300 uppercase truncate">DEPLOYMENT RANGE</span>
        </div>
      </div>
    </div>
  );
}
