"use client";

import { CheckCircle2, AlertTriangle, AlertCircle } from "lucide-react";
import { Rover } from "@/lib/types";

interface FleetStatusProps {
  rovers: Rover[];
}

export default function FleetStatus({ rovers }: FleetStatusProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "online":
        return <div className="h-2 w-2 rounded-full bg-emerald-500"></div>;
      case "warning":
        return <div className="h-2 w-2 rounded-full bg-amber-500"></div>;
      default:
        return <div className="h-2 w-2 rounded-full bg-rose-500"></div>;
    }
  };

  return (
    <div className="space-y-3 font-mono">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-semibold text-slate-400 tracking-wider">
          FLEET_INVENTORY // STATUS_MATRIX
        </h2>
        <span className="text-[8px] text-slate-500">
          NODES: {rovers.length}
        </span>
      </div>

      {/* Compact Status List */}
      <div className="space-y-1.5">
        {rovers.map((rover) => (
          <div
            key={rover.id}
            className="p-2.5 rounded border border-slate-800 bg-[#111827] flex items-center justify-between text-[10px]"
          >
            {/* Left side: status dot and name info */}
            <div className="flex items-center gap-2.5">
              {getStatusIcon(rover.status)}
              <div className="flex items-baseline gap-2">
                <span className="font-bold text-slate-200">{rover.name}</span>
                <span className="text-[7px] text-slate-500 uppercase tracking-wider">({rover.type})</span>
              </div>
            </div>

            {/* Right side: last contact latency */}
            <span className="text-[8px] text-slate-500 uppercase">
              LAST CON: {rover.lastContact}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
