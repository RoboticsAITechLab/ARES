"use client";

import { useState } from "react";
import { useMissionStore } from "@/store/mission-store";
import { Button } from "./ui/button";
import { RefreshCw, RotateCw, Map, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";

export default function QuickActions() {
  const { 
    isEmergencyStop, 
    setEmergencyStop, 
    addLog 
  } = useMissionStore();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const refreshTelemetry = () => {
    setIsRefreshing(true);
    addLog("Ground Command", "SYSTEM", "INFO", "Manual DSN packet query sent. Scanning vehicle health feeds...");
    setTimeout(() => {
      setIsRefreshing(false);
      addLog("Ground Command", "SYSTEM", "INFO", "DSN telemetry packet sync complete. Fleet data normalized.");
    }, 1000);
  };

  const syncData = () => {
    setIsSyncing(true);
    addLog("Ground Command", "COMMS", "INFO", "Broadcasting state synchronization frame to Mars Express Orbiter...");
    setTimeout(() => {
      setIsSyncing(false);
      addLog("Ground Command", "COMMS", "INFO", "State synchronization verified by orbiter. Lag: 21.2 min.");
    }, 1200);
  };

  const handleCenterMap = () => {
    addLog("Ground Command", "COMMS", "INFO", "Manual override: Map viewport aligned on Mother Rover coordinates.");
  };

  return (
    <div className="space-y-4 font-mono">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-semibold text-slate-400 tracking-wider flex items-center gap-1.5 uppercase select-none">
          <span>DIRECTIVES // QUICK_ACTIONS</span>
        </h2>
      </div>

      <div className="p-4 rounded border border-slate-800 bg-[#111827] space-y-3 shadow-md">
        <div className="grid grid-cols-2 gap-2">
          {/* Refresh Telemetry */}
          <Button
            variant="outline"
            disabled={isRefreshing}
            onClick={refreshTelemetry}
            className="text-[10px] h-9 border-slate-800 bg-slate-900/60 text-slate-300 hover:text-cyan-400 hover:border-cyan-500/30 hover:bg-slate-950 flex items-center justify-center gap-1.5 cursor-pointer uppercase font-mono tracking-wider font-semibold disabled:opacity-50"
          >
            <RefreshCw className={cn("h-3 w-3 text-cyan-400", isRefreshing && "animate-spin")} />
            <span>{isRefreshing ? "POLLING..." : "REFRESH"}</span>
          </Button>

          {/* Sync Data */}
          <Button
            variant="outline"
            disabled={isSyncing}
            onClick={syncData}
            className="text-[10px] h-9 border-slate-800 bg-slate-900/60 text-slate-300 hover:text-cyan-400 hover:border-cyan-500/30 hover:bg-slate-950 flex items-center justify-center gap-1.5 cursor-pointer uppercase font-mono tracking-wider font-semibold disabled:opacity-50"
          >
            <RotateCw className={cn("h-3 w-3 text-cyan-400", isSyncing && "animate-spin")} />
            <span>{isSyncing ? "SYNCING..." : "SYNC DSN"}</span>
          </Button>

          {/* Center Map */}
          <Button
            variant="outline"
            onClick={handleCenterMap}
            className="text-[10px] h-9 border-slate-800 bg-slate-900/60 text-slate-300 hover:text-cyan-400 hover:border-cyan-500/30 hover:bg-slate-950 flex items-center justify-center gap-1.5 cursor-pointer uppercase font-mono tracking-wider font-semibold"
          >
            <Map className="h-3 w-3 text-cyan-400" />
            <span>CENTER MAP</span>
          </Button>

          {/* Emergency Abort */}
          <Button
            variant="outline"
            onClick={() => {
              const nextState = !isEmergencyStop;
              setEmergencyStop(nextState);
              if (nextState) {
                addLog("Ground Ops", "SYSTEM", "CRITICAL", "EMERGENCY VEHICLE STOP SEQUENCE INITIATED.");
              } else {
                addLog("Ground Ops", "SYSTEM", "INFO", "Emergency safe mode released. Re-establishing telemetry streams.");
              }
            }}
            className={cn(
              "text-[10px] h-9 flex items-center justify-center gap-1.5 cursor-pointer uppercase font-mono tracking-wider font-bold transition-all duration-200 border",
              isEmergencyStop
                ? "bg-rose-500 text-white border-rose-600 hover:bg-rose-600 shadow-[0_0_15px_rgba(239,68,68,0.4)]"
                : "border-rose-950 bg-rose-950/20 text-rose-400 hover:bg-rose-950/40 hover:text-rose-300 hover:border-rose-500/40"
            )}
          >
            <ShieldAlert className="h-3.5 w-3.5" />
            <span>{isEmergencyStop ? "ABORT ACTIVE" : "ABORT"}</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
