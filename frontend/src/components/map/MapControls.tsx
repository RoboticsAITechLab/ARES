"use client";

import { Maximize, Minimize, Eye, EyeOff } from "lucide-react";
import { Button } from "../ui/button";

interface MapControlsProps {
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  showRoutes: boolean;
  onToggleRoutes: () => void;
  showGeofence: boolean;
  onToggleGeofence: () => void;
}

export default function MapControls({
  isFullscreen,
  onToggleFullscreen,
  showRoutes,
  onToggleRoutes,
  showGeofence,
  onToggleGeofence,
}: MapControlsProps) {
  return (
    <div className="absolute bottom-4 right-4 flex gap-1.5 z-25 pointer-events-auto select-none font-mono">
      {/* Routes Toggle */}
      <Button
        variant="outline"
        size="sm"
        onClick={onToggleRoutes}
        className={`text-[9px] h-7 px-2 border-slate-800 bg-slate-950/80 hover:bg-slate-900 flex items-center gap-1 text-slate-400 cursor-pointer ${
          showRoutes ? "text-cyan-400 border-cyan-500/35" : ""
        }`}
      >
        {showRoutes ? <Eye className="h-3.5 w-3.5 text-cyan-400" /> : <EyeOff className="h-3.5 w-3.5 text-slate-500" />}
        <span>ROUTES</span>
      </Button>

      {/* Geofence Toggle */}
      <Button
        variant="outline"
        size="sm"
        onClick={onToggleGeofence}
        className={`text-[9px] h-7 px-2 border-slate-800 bg-slate-950/80 hover:bg-slate-900 flex items-center gap-1 text-slate-400 cursor-pointer ${
          showGeofence ? "text-cyan-400 border-cyan-500/35" : ""
        }`}
      >
        {showGeofence ? <Eye className="h-3.5 w-3.5 text-cyan-400" /> : <EyeOff className="h-3.5 w-3.5 text-slate-500" />}
        <span>GEOFENCE</span>
      </Button>

      {/* Fullscreen Trigger */}
      <Button
        variant="outline"
        size="sm"
        onClick={onToggleFullscreen}
        className="text-[9px] h-7 w-7 p-0 border-slate-800 bg-slate-950/80 hover:bg-slate-900 flex items-center justify-center text-slate-450 cursor-pointer"
        title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
      >
        {isFullscreen ? <Minimize className="h-3.5 w-3.5" /> : <Maximize className="h-3.5 w-3.5" />}
      </Button>
    </div>
  );
}
