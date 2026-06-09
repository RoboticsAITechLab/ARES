"use client";

import { Navigation, RefreshCw } from "lucide-react";
import MissionMap from "@/components/MissionMap";
import GridLegend from "@/components/GridLegend";
import { useMissionStore } from "@/lib/store";

export default function LiveMapPage() {
  const isRefreshing = useMissionStore((state) => state.isRefreshing);

  return (
    <div className="space-y-6 font-mono animate-fade-in">
      {/* Page Header */}
      <div className="p-4 rounded border border-slate-800 bg-[#111827] flex items-center justify-between shadow-lg select-none">
        <div className="flex items-center gap-3">
          <Navigation className="h-5 w-5 text-cyan-400 rotate-45 animate-status-pulse" />
          <div>
            <div className="text-[10px] text-slate-500 tracking-wider font-bold">TACTICAL NAVIGATION SUITE</div>
            <h1 className="text-sm font-black text-white tracking-widest uppercase">
              GRID_MAP_TOPOGRAPHY // VEHICLE_VECTORING
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold">
          <RefreshCw className={`h-3 w-3 text-cyan-400 ${isRefreshing ? "animate-spin" : "animate-status-pulse"}`} />
          <span>MAP_REFRESH_PASSIVE (SOL 142)</span>
        </div>
      </div>

      {/* Main Grid Viewport */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-start">
        {/* Map Viewport Container */}
        <div className="xl:col-span-3">
          <MissionMap />
        </div>

        {/* Legend sidebar */}
        <div className="xl:col-span-1">
          <GridLegend />
        </div>
      </div>
    </div>
  );
}
