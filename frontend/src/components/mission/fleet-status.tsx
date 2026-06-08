"use client";

import { Battery, Wifi, MapPin } from "lucide-react";
import { Rover } from "@/lib/types";
import { STATUS_STYLES } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";

interface FleetStatusProps {
  rovers: Rover[];
}

export default function FleetStatus({ rovers }: FleetStatusProps) {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="font-mono text-xs font-semibold text-slate-400 tracking-wider">
          FLEET_STATUS // INDEXED_ROVERS
        </h2>
        <span className="font-mono text-[10px] text-slate-500">
          COUNT: {rovers.length}
        </span>
      </div>

      {/* Grid List */}
      <div className="grid grid-cols-1 gap-3">
        {rovers.map((rover) => {
          const style = STATUS_STYLES[rover.status as keyof typeof STATUS_STYLES] || STATUS_STYLES.online;
          
          return (
            <div
              key={rover.id}
              className="p-4 rounded border border-slate-800 bg-slate-900/60 hover:bg-slate-900 transition duration-150 flex flex-col gap-3 font-mono"
            >
              {/* Top Row: Name, Type, Status */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white tracking-wide">{rover.name}</span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded border border-slate-800 text-slate-500 uppercase tracking-widest">
                    {rover.type}
                  </span>
                </div>
                <Badge variant="outline" className={`text-[9px] py-0 px-2 rounded-full tracking-wider font-semibold border ${style.badge}`}>
                  {style.label}
                </Badge>
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-3 gap-2 text-[10px] text-slate-400">
                {/* Battery */}
                <div className="flex items-center gap-1.5 bg-slate-950/40 p-2 rounded border border-slate-950">
                  <Battery className={`h-3.5 w-3.5 ${rover.battery < 40 ? 'text-rose-400' : 'text-emerald-400'}`} />
                  <div className="flex flex-col">
                    <span className="text-[8px] text-slate-500 leading-none">PWR</span>
                    <span className={`font-semibold mt-0.5 ${rover.battery < 40 ? 'text-rose-400' : 'text-slate-200'}`}>{rover.battery}%</span>
                  </div>
                </div>

                {/* Signal */}
                <div className="flex items-center gap-1.5 bg-slate-950/40 p-2 rounded border border-slate-950">
                  <Wifi className={`h-3.5 w-3.5 ${rover.signal < 70 ? 'text-amber-400' : 'text-cyan-400'}`} />
                  <div className="flex flex-col">
                    <span className="text-[8px] text-slate-500 leading-none">COMMS</span>
                    <span className="font-semibold text-slate-200 mt-0.5">{rover.signal}%</span>
                  </div>
                </div>

                {/* Temperature */}
                <div className="flex items-center gap-1.5 bg-slate-950/40 p-2 rounded border border-slate-950">
                  <div className="h-3.5 w-3.5 text-slate-500 flex items-center justify-center font-bold text-[9px]">°C</div>
                  <div className="flex flex-col">
                    <span className="text-[8px] text-slate-500 leading-none">TEMP</span>
                    <span className="font-semibold text-slate-200 mt-0.5">{rover.temperature}°C</span>
                  </div>
                </div>
              </div>

              {/* Coordinates Footer */}
              <div className="flex items-center justify-between text-[9px] border-t border-slate-800/60 pt-2 text-slate-500">
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-slate-500" />
                  <span>LAT: {rover.latitude.toFixed(4)} // LON: {rover.longitude.toFixed(4)}</span>
                </div>
                <span>SPEED: {rover.speed.toFixed(1)} m/s</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
