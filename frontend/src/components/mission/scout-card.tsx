"use client";

import { Battery, Wifi, MapPin, Gauge, Thermometer } from "lucide-react";
import { Rover } from "@/lib/types";
import { STATUS_STYLES } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";

interface ScoutCardProps {
  rover: Rover;
}

export default function ScoutCard({ rover }: ScoutCardProps) {
  const style = STATUS_STYLES[rover.status as keyof typeof STATUS_STYLES] || STATUS_STYLES.online;

  return (
    <div className="rounded border border-slate-800 bg-[#111827] hover:border-slate-700 transition duration-150 relative">
      {/* Header */}
      <div className="border-b border-slate-800/80 bg-slate-900/40 px-4 py-2.5 flex justify-between items-center font-mono">
        <div className="flex items-center gap-2">
          <span className="text-slate-500 text-[9px] tracking-wider font-bold">SCOUT UNIT //</span>
          <h4 className="text-xs font-bold text-white tracking-wider uppercase">{rover.name}</h4>
        </div>
        <Badge variant="outline" className={`text-[8px] py-0 px-2 rounded-full tracking-wider font-semibold border ${style.badge}`}>
          {style.label}
        </Badge>
      </div>

      {/* Body Content */}
      <div className="p-4 font-mono space-y-4">
        {/* Core telemetry specs */}
        <div className="grid grid-cols-2 gap-3 text-[10px]">
          {/* Battery */}
          <div className="flex items-center gap-2 bg-slate-950/30 px-2.5 py-1.5 rounded border border-slate-900">
            <Battery className={`h-4 w-4 ${rover.battery < 40 ? 'text-rose-400' : 'text-emerald-400'}`} />
            <div className="flex flex-col">
              <span className="text-[8px] text-slate-500 uppercase">Battery</span>
              <span className={`font-bold ${rover.battery < 40 ? 'text-rose-400' : 'text-slate-200'}`}>
                {rover.battery}%
              </span>
            </div>
          </div>

          {/* Signal */}
          <div className="flex items-center gap-2 bg-slate-950/30 px-2.5 py-1.5 rounded border border-slate-900">
            <Wifi className={`h-4 w-4 ${rover.signal < 70 ? 'text-amber-400' : 'text-cyan-400'}`} />
            <div className="flex flex-col">
              <span className="text-[8px] text-slate-500 uppercase">Signal</span>
              <span className="font-bold text-slate-200">{rover.signal}%</span>
            </div>
          </div>

          {/* Temp */}
          <div className="flex items-center gap-2 bg-slate-950/30 px-2.5 py-1.5 rounded border border-slate-900">
            <Thermometer className="h-4 w-4 text-slate-500" />
            <div className="flex flex-col">
              <span className="text-[8px] text-slate-500 uppercase">Temp</span>
              <span className="font-bold text-slate-200">{rover.temperature}°C</span>
            </div>
          </div>

          {/* Speed */}
          <div className="flex items-center gap-2 bg-slate-950/30 px-2.5 py-1.5 rounded border border-slate-900">
            <Gauge className="h-4 w-4 text-slate-500" />
            <div className="flex flex-col">
              <span className="text-[8px] text-slate-500 uppercase">Speed</span>
              <span className="font-bold text-slate-200">{rover.speed.toFixed(1)} m/s</span>
            </div>
          </div>
        </div>

        {/* Location coordinates */}
        <div className="bg-slate-950/30 p-2 rounded border border-slate-900 text-[9px] text-slate-400 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-slate-500" />
            <span>LAT: {rover.latitude.toFixed(5)} / LON: {rover.longitude.toFixed(5)}</span>
          </div>
          <span className="text-[8px] text-slate-500 uppercase">MET LINK: {rover.lastContact}</span>
        </div>
      </div>
    </div>
  );
}
