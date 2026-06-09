"use client";

import { useMissionStore } from "@/lib/store";
import StatusBadge from "./StatusBadge";
import { Server, Activity, Shield, Cpu, Network, Radio, Wifi } from "lucide-react";

export default function SystemHealth() {
  const systemHealth = useMissionStore((state) => state.systemHealth);

  return (
    <div className="space-y-4 font-mono">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-semibold text-slate-400 tracking-wider flex items-center gap-1.5 uppercase select-none">
          <Shield className="h-3.5 w-3.5 text-cyan-400" />
          SYSTEM_HEALTH // LINK_MONITOR
        </h2>
        <span className="text-[8px] text-slate-500 uppercase tracking-wider font-bold">
          DIAGNOSTIC_LOCK
        </span>
      </div>

      <div className="p-4 rounded border border-slate-800 bg-[#111827] space-y-3 shadow-md">
        {/* Mission Server */}
        <div className="flex justify-between items-center text-[10px] border-b border-slate-800/60 pb-2">
          <span className="text-slate-400 flex items-center gap-2 font-semibold">
            <Server className="h-3.5 w-3.5 text-cyan-500/70" /> 
            MISSION_SERVER
          </span>
          <StatusBadge status={systemHealth.missionServer} />
        </div>

        {/* Telemetry Feed */}
        <div className="flex justify-between items-center text-[10px] border-b border-slate-800/60 pb-2">
          <span className="text-slate-400 flex items-center gap-2 font-semibold">
            <Activity className="h-3.5 w-3.5 text-cyan-500/70" /> 
            TELEMETRY_FEED
          </span>
          <StatusBadge status={systemHealth.telemetryFeed} />
        </div>

        {/* WebSocket */}
        <div className="flex justify-between items-center text-[10px] border-b border-slate-800/60 pb-2">
          <span className="text-slate-400 flex items-center gap-2 font-semibold">
            <Network className="h-3.5 w-3.5 text-cyan-500/70" /> 
            WEBSOCKET_CONN
          </span>
          <StatusBadge status={systemHealth.webSocketConnection} />
        </div>

        {/* Scout Network */}
        <div className="flex justify-between items-center text-[10px] border-b border-slate-800/60 pb-2">
          <span className="text-slate-400 flex items-center gap-2 font-semibold">
            <Radio className="h-3.5 w-3.5 text-cyan-500/70" /> 
            SCOUT_NETWORK
          </span>
          <StatusBadge status={systemHealth.scoutNetwork} />
        </div>

        {/* Mother Link */}
        <div className="flex justify-between items-center text-[10px]">
          <span className="text-slate-400 flex items-center gap-2 font-semibold">
            <Wifi className="h-3.5 w-3.5 text-cyan-500/70" /> 
            MOTHER_LINK
          </span>
          <StatusBadge status={systemHealth.motherRoverLink} />
        </div>
      </div>
    </div>
  );
}
