"use client";

import { Layers } from "lucide-react";

export default function MapLegend() {
  return (
    <div className="p-4 border border-slate-800 bg-[#111827] rounded space-y-4 font-mono w-full shadow-md">
      <h3 className="text-xs font-semibold text-slate-400 tracking-wider flex items-center gap-1.5 uppercase select-none">
        <Layers className="h-3.5 w-3.5 text-cyan-400" />
        MAP_LEGEND
      </h3>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-1 gap-3 text-[9px] text-slate-400 leading-normal">
        {/* Vehicles */}
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-cyan-400 shrink-0"></span>
          <span className="font-bold text-slate-200 uppercase truncate">Mother Ship</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-400 shrink-0"></span>
          <span className="font-bold text-slate-200 uppercase truncate">Scout (Active)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-rose-500 shrink-0 animate-pulse"></span>
          <span className="font-bold text-rose-500 uppercase truncate">Scout (Error)</span>
        </div>

        {/* Waypoints */}
        <div className="flex items-center gap-2">
          <svg className="h-3.5 w-3.5 stroke-cyan-400 fill-none shrink-0" viewBox="0 0 12 12">
            <circle cx="6" cy="6" r="3" />
            <line x1="1" y1="6" x2="11" y2="6" />
            <line x1="6" y1="1" x2="6" y2="11" />
          </svg>
          <span className="font-bold text-slate-300 uppercase truncate">SCAN WP</span>
        </div>
        <div className="flex items-center gap-2">
          <svg className="h-3.5 w-3.5 stroke-emerald-400 fill-none shrink-0" viewBox="0 0 12 12">
            <path d="M 3 1 L 9 1 M 5 1 L 5 5 L 2 10 A 1 1 0 0 0 10 10 L 7 5 L 7 1" />
          </svg>
          <span className="font-bold text-slate-300 uppercase truncate">COLLECT WP</span>
        </div>
        <div className="flex items-center gap-2">
          <svg className="h-3.5 w-3.5 stroke-amber-400 fill-none shrink-0" viewBox="0 0 12 12">
            <line x1="6" y1="1" x2="6" y2="11" />
            <path d="M 2 11 L 6 1 L 10 11" />
          </svg>
          <span className="font-bold text-slate-300 uppercase truncate">RELAY WP</span>
        </div>
        <div className="flex items-center gap-2">
          <svg className="h-3.5 w-3.5 stroke-purple-400 fill-none shrink-0" viewBox="0 0 12 12">
            <path d="M 1 6 C 3 3 9 3 11 6 C 9 9 3 9 1 6 Z" />
            <circle cx="6" cy="6" r="1.5" className="fill-purple-400" />
          </svg>
          <span className="font-bold text-slate-300 uppercase truncate">OBSERVE WP</span>
        </div>
        <div className="flex items-center gap-2">
          <svg className="h-3.5 w-3.5 stroke-rose-400 fill-none shrink-0" viewBox="0 0 12 12">
            <line x1="3" y1="1" x2="3" y2="11" />
            <path d="M 3 1 L 10 4 L 3 7" className="fill-rose-400/20" />
          </svg>
          <span className="font-bold text-slate-300 uppercase truncate">RETURN WP</span>
        </div>

        {/* Areas */}
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 border border-dashed border-cyan-500/25 bg-cyan-500/5 block shrink-0"></span>
          <span className="font-bold text-slate-300 uppercase truncate">Exploration Range</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 border border-dashed border-slate-800 block shrink-0"></span>
          <span className="font-bold text-slate-300 uppercase truncate">Deployment Bounds</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-0.5 w-4 border-t border-dashed border-cyan-500/40 block shrink-0"></span>
          <span className="font-bold text-slate-300 uppercase truncate">Mission Route</span>
        </div>
      </div>
    </div>
  );
}
