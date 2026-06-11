"use client";

import { useMissionStore } from "@/store/mission-store";
import { useConnectionStore } from "@/store/connection-store";
import { cn } from "@/lib/utils";
import { Wifi, AlertCircle, ShieldAlert } from "lucide-react";

export default function ConnectionStatusBar() {
  const { isEmergencyStop } = useMissionStore();
  const { connectionStatus } = useConnectionStore();

  if (isEmergencyStop) {
    return (
      <div className="bg-rose-500/10 border-b border-rose-500/30 text-rose-400 py-1.5 px-4 sm:px-6 text-[9px] font-mono font-bold flex items-center justify-between animate-pulse select-none z-20 shrink-0">
        <span className="flex items-center gap-1.5 truncate">
          <ShieldAlert className="h-3.5 w-3.5 text-rose-500 shrink-0" />
          <span className="truncate">MANUAL EMERGENCY ABORT SEQUENCE ENGAGED // KINETIC SAFE MODE ACTIVE</span>
        </span>
        <span className="tracking-widest hidden sm:inline text-right shrink-0">STATE: FAILSAFE_LOCK</span>
      </div>
    );
  }

  if (connectionStatus === "connecting") {
    return (
      <div className="bg-amber-500/10 border-b border-amber-500/30 text-amber-300 py-1.5 px-4 sm:px-6 text-[9px] font-mono font-bold flex items-center justify-between select-none z-20 shrink-0">
        <span className="flex items-center gap-1.5 truncate animate-pulse">
          <AlertCircle className="h-3.5 w-3.5 text-amber-500 shrink-0" />
          <span className="truncate">DSN LINK CONNECTING // RE-ESTABLISHING TRANSCEIVER UPLINK</span>
        </span>
        <span className="tracking-widest hidden sm:inline text-right shrink-0 text-amber-400">STATE: CONNECTING</span>
      </div>
    );
  }

  if (connectionStatus === "disconnected") {
    return (
      <div className="bg-rose-500/10 border-b border-rose-500/30 text-rose-400 py-1.5 px-4 sm:px-6 text-[9px] font-mono font-bold flex items-center justify-between select-none z-20 shrink-0">
        <span className="flex items-center gap-1.5 truncate">
          <AlertCircle className="h-3.5 w-3.5 text-rose-500 shrink-0" />
          <span className="truncate">DSN LINK OFFLINE // GROUND OPERATIONS COMMS RELAY LATENCY TIMEOUT</span>
        </span>
        <span className="tracking-widest hidden sm:inline text-right shrink-0 text-rose-500">STATE: DISCONNECTED</span>
      </div>
    );
  }

  // connectionStatus === "connected"
  return (
    <div className="bg-[#0A0F1C]/45 border-b border-emerald-500/25 text-emerald-400 py-1 px-4 sm:px-6 text-[9px] font-mono font-bold flex items-center justify-between select-none z-20 shrink-0">
      <span className="flex items-center gap-1.5 truncate">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-status-pulse shrink-0"></span>
        <span className="truncate">DSN LINK LOCKED // Mars Express Relay (Sol 142)</span>
      </span>
      <span className="tracking-widest text-[8px] text-slate-500 hidden sm:inline shrink-0">BANDWIDTH: NOMINAL [144KBPS]</span>
    </div>
  );
}

