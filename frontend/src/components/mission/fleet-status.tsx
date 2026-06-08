"use client";

import { Battery, Wifi, Cpu, Heart, CheckCircle2, AlertTriangle, AlertCircle } from "lucide-react";
import { Rover } from "@/lib/types";

interface FleetStatusProps {
  rovers: Rover[];
}

export default function FleetStatus({ rovers }: FleetStatusProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "online":
        return <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />;
      case "warning":
        return <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />;
      default:
        return <AlertCircle className="h-3.5 w-3.5 text-rose-500" />;
    }
  };

  return (
    <div className="space-y-4 font-mono">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-semibold text-slate-400 tracking-wider">
          FLEET_INVENTORY // LOGISTICAL_COMPARE
        </h2>
        <span className="text-[9px] text-slate-500">
          NODES_SYNCED: {rovers.length}/{rovers.length}
        </span>
      </div>

      {/* Comparison Grid */}
      <div className="space-y-2">
        {rovers.map((rover) => (
          <div
            key={rover.id}
            className="p-3 rounded border border-slate-800 bg-[#111827] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[10px]"
          >
            {/* Left Col: Name and Status */}
            <div className="flex items-center gap-2 min-w-[140px]">
              {getStatusIcon(rover.status)}
              <div>
                <div className="font-bold text-slate-200">{rover.name}</div>
                <div className="text-[8px] text-slate-500 uppercase tracking-widest">{rover.type}</div>
              </div>
            </div>

            {/* Middle Col: Telemetry Compare Metrics */}
            <div className="grid grid-cols-4 gap-4 flex-1 text-slate-400 text-[9px]">
              {/* Battery */}
              <div className="flex items-center gap-1.5">
                <Battery className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                <div className="flex flex-col">
                  <span className="text-[7px] text-slate-500">BAT</span>
                  <span className="font-semibold text-slate-200">{rover.battery}%</span>
                </div>
              </div>

              {/* Link Quality */}
              <div className="flex items-center gap-1.5">
                <Wifi className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                <div className="flex flex-col">
                  <span className="text-[7px] text-slate-500">LNK</span>
                  <span className="font-semibold text-slate-200">{rover.linkQuality}%</span>
                </div>
              </div>

              {/* CPU */}
              <div className="flex items-center gap-1.5">
                <Cpu className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                <div className="flex flex-col">
                  <span className="text-[7px] text-slate-500">CPU</span>
                  <span className="font-semibold text-slate-200">{rover.cpu}%</span>
                </div>
              </div>

              {/* Health */}
              <div className="flex items-center gap-1.5">
                <Heart className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                <div className="flex flex-col">
                  <span className="text-[7px] text-slate-500">HLT</span>
                  <span className="font-semibold text-slate-200">{rover.health}%</span>
                </div>
              </div>
            </div>

            {/* Right Col: Latency / Last Contact */}
            <div className="text-right text-[8px] text-slate-500 sm:min-w-[80px]">
              <div>LATENCY: {rover.lastContact}</div>
              <div className="text-[7px] mt-0.5 font-bold text-slate-400">{rover.latitude.toFixed(3)}N, {rover.longitude.toFixed(3)}E</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
