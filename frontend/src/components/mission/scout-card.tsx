"use client";

import { Battery, Wifi, MapPin } from "lucide-react";
import { ScoutRover } from "@/types/ScoutRover";
import { STATUS_STYLES } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";

interface ScoutCardProps {
  rover: ScoutRover;
}

export default function ScoutCard({ rover }: ScoutCardProps) {
  // Normalize status mapping to style
  const normStatus = (rover.status || "").toLowerCase();
  const style = STATUS_STYLES[normStatus as keyof typeof STATUS_STYLES] || STATUS_STYLES.online;

  return (
    <div className="rounded border border-slate-800 bg-[#111827] hover:border-slate-700/80 transition duration-150 relative font-mono select-none">
      {/* Header */}
      <div className="border-b border-slate-800 bg-slate-900/60 px-4 py-2.5 flex justify-between items-center">
        <div className="flex items-center gap-1.5">
          <span className="text-slate-500 text-[9px] tracking-wider font-bold">RECON UNIT //</span>
          <h4 className="text-xs font-bold text-white tracking-widest uppercase">{rover.id.toUpperCase()}</h4>
        </div>
        <Badge variant="outline" className={`text-[8px] py-0 px-2 rounded-full tracking-wider font-semibold border ${style.badge}`}>
          {style.label}
        </Badge>
      </div>

      {/* Body Content */}
      <div className="p-4 space-y-3">
        {/* Progress Bars (Battery & Signal) */}
        <div className="grid grid-cols-2 gap-3 text-[9px] text-slate-400">
          <div className="space-y-1">
            <div className="flex justify-between font-semibold">
              <span className="flex items-center gap-1">
                <Battery className="h-3 w-3 text-cyan-400" />
                BATTERY
              </span>
              <span>{rover.battery}%</span>
            </div>
            <div className="h-1 w-full bg-slate-950 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${rover.battery < 40 ? 'bg-rose-500' : 'bg-cyan-500'}`}
                style={{ width: `${rover.battery}%` }}
              ></div>
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between font-semibold">
              <span className="flex items-center gap-1">
                <Wifi className="h-3 w-3 text-cyan-400" />
                SIGNAL
              </span>
              <span>{rover.signal}%</span>
            </div>
            <div className="h-1 w-full bg-slate-950 rounded-full overflow-hidden">
              <div
                className="h-full bg-cyan-500 rounded-full"
                style={{ width: `${rover.signal}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Diagnostic parameters grid */}
        <div className="grid grid-cols-2 gap-2 text-[9px] text-slate-400 border-t border-slate-800/60 pt-2.5">
          <div className="flex justify-between bg-slate-950/20 px-2 py-1 rounded border border-slate-900">
            <span>TEMP:</span>
            <span className="font-bold text-slate-200">{rover.temperature}°C</span>
          </div>
          <div className="flex justify-between bg-slate-950/20 px-2 py-1 rounded border border-slate-900">
            <span>SPEED:</span>
            <span className="font-bold text-slate-200">{rover.speed.toFixed(1)} m/s</span>
          </div>
          <div className="flex justify-between bg-slate-950/20 px-2 py-1 rounded border border-slate-900">
            <span>GRID X:</span>
            <span className="font-bold text-slate-200">{rover.x}</span>
          </div>
          <div className="flex justify-between bg-slate-950/20 px-2 py-1 rounded border border-slate-900">
            <span>GRID Y:</span>
            <span className="font-bold text-slate-200">{rover.y}</span>
          </div>
        </div>

        {/* Location & Heading */}
        <div className="bg-slate-950/40 p-2 rounded border border-slate-800/80 text-[8px] text-slate-500 space-y-1">
          <div className="flex justify-between items-center">
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3 text-slate-600" />
              HEADING VANTAGE
            </span>
            <span>{rover.heading}°</span>
          </div>
        </div>
      </div>
    </div>
  );
}
