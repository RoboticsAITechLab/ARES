"use client";

import { useState } from "react";
import { useMissionStore } from "@/store/mission-store";
import MissionMap from "@/components/map/MissionMap";
import MapSidebar from "@/components/map/MapSidebar";
import { Navigation, RefreshCw } from "lucide-react";

export default function MapPage() {
  const { rovers, simulationConfig } = useMissionStore();
  const [selectedRoverId, setSelectedRoverId] = useState<string | null>(null);

  const isRunning = simulationConfig.status === "RUNNING";

  return (
    <div className="space-y-6 font-mono text-slate-100 animate-fade-in">
      {/* Page Header */}
      <div className="p-4 rounded border border-slate-800 bg-[#111827] flex items-center justify-between shadow-lg select-none">
        <div className="flex items-center gap-3">
          <Navigation className="h-5 w-5 text-cyan-400 rotate-45 animate-status-pulse" />
          <div>
            <div className="text-[10px] text-slate-500 tracking-wider font-bold">TACTICAL COORDINATE VIEWPORT</div>
            <h1 className="text-sm font-black tracking-widest text-white uppercase">
              GRID_MAP_TOPOGRAPHY // VEHICLE_VECTORING
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold">
          <RefreshCw className={`h-3 w-3 text-cyan-400 ${isRunning ? "animate-spin" : "animate-status-pulse"}`} />
          <span>MAP_FEED: {isRunning ? "LIVE_STREAM" : "STANDBY"} (SOL 142)</span>
        </div>
      </div>

      {/* Main Grid Viewport */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-stretch">
        {/* Map Viewport Container */}
        <div className="xl:col-span-3">
          <MissionMap selectedRoverId={selectedRoverId} />
        </div>

        {/* Legend / Rover Select Sidebar */}
        <div className="xl:col-span-1 h-full">
          <MapSidebar 
            rovers={rovers} 
            selectedRoverId={selectedRoverId} 
            onSelectRover={setSelectedRoverId} 
          />
        </div>
      </div>
    </div>
  );
}
