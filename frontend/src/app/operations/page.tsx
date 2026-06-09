"use client";

import { useMissionStore } from "@/store/mission-store";
import SystemHealth from "@/components/SystemHealth";
import MissionClock from "@/components/MissionClock";
import QuickActions from "@/components/QuickActions";
import StatusBadge from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Settings, Play, Pause, RotateCcw, Shield, Gauge, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

export default function OperationsPage() {
  const { 
    simulationConfig, 
    startSimulation, 
    pauseSimulation, 
    resetSimulation, 
    setSimulationSpeed,
    isEmergencyStop,
    rovers,
    events
  } = useMissionStore();

  const isRunning = simulationConfig.status === "RUNNING";
  const isPaused = simulationConfig.status === "PAUSED";
  const isStopped = simulationConfig.status === "STOPPED";

  return (
    <div className="space-y-6 font-mono text-slate-100 animate-fade-in">
      {/* Page Header */}
      <div className="p-4 rounded border border-slate-800 bg-[#111827] flex items-center justify-between shadow-lg select-none">
        <div className="flex items-center gap-3">
          <Settings className="h-5 w-5 text-cyan-400" />
          <div>
            <div className="text-[10px] text-slate-500 tracking-wider font-bold">OPERATIONS ROOM CONTROL</div>
            <h1 className="text-sm font-black tracking-widest text-white uppercase">
              FLIGHT_LOGISTICS_CONSOLE // SYSTEM_HEALTH
            </h1>
          </div>
        </div>
        <div className="text-[10px] text-slate-500 uppercase font-bold">
          SOL: 142
        </div>
      </div>

      {/* Clocks widget banner */}
      <div className="p-4 rounded border border-slate-800 bg-[#111827] shadow-md flex items-center justify-center select-none">
        <MissionClock />
      </div>

      {/* Main split workarea */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Side: System Health & Quick Actions */}
        <div className="lg:col-span-1 space-y-6">
          <SystemHealth />
          <QuickActions />
        </div>

        {/* Right Side: Simulation Control Cockpit (takes 2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Simulation Engine Panel */}
          <div className="p-5 border border-slate-800 bg-[#111827] rounded shadow-md space-y-4">
            <h2 className="text-xs font-bold text-slate-400 tracking-wider flex items-center gap-1.5 uppercase select-none border-b border-slate-900 pb-2">
              <Activity className="h-4 w-4 text-cyan-400 animate-status-pulse" />
              FLIGHT_SIMULATION_ENGINE // CONSOLE
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-[10px] select-none">
              {/* Status */}
              <div className="bg-slate-950/50 border border-slate-900 p-3 rounded space-y-2">
                <span className="text-slate-500 font-bold block">SIMULATOR STATUS</span>
                <span className={cn(
                  "inline-block px-2.5 py-0.5 rounded border text-[8px] font-extrabold uppercase",
                  isRunning ? "border-emerald-500/20 bg-emerald-500/5 text-emerald-400 animate-pulse" :
                  isPaused ? "border-amber-500/20 bg-amber-500/5 text-amber-400" :
                  "border-slate-850 bg-slate-900 text-slate-500"
                )}>
                  {simulationConfig.status}
                </span>
              </div>

              {/* Speed */}
              <div className="bg-slate-950/50 border border-slate-900 p-3 rounded space-y-2">
                <span className="text-slate-500 font-bold block">TICK REFRESH RATE</span>
                <span className="text-cyan-400 font-extrabold uppercase">
                  {simulationConfig.speed} ({simulationConfig.refreshInterval}ms)
                </span>
              </div>

              {/* Runtime ticks */}
              <div className="bg-slate-950/50 border border-slate-900 p-3 rounded space-y-2">
                <span className="text-slate-500 font-bold block">ELAPSED TICK RUNTIME</span>
                <span className="text-slate-200 font-extrabold tabular-nums">
                  {simulationConfig.elapsedTime} CYCLE TICKS
                </span>
              </div>
            </div>

            {/* Simulation loop control buttons */}
            <div className="space-y-3.5 pt-3 border-t border-slate-900 select-none">
              <div className="text-[9px] text-slate-500 font-bold uppercase">Simulator Control Loop</div>
              <div className="flex flex-wrap gap-2">
                {isStopped || isPaused ? (
                  <Button
                    onClick={startSimulation}
                    className="text-[10px] h-9 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black cursor-pointer uppercase flex items-center gap-1.5"
                  >
                    <Play className="h-3.5 w-3.5" />
                    <span>{isPaused ? "Resume Sim" : "Start Sim"}</span>
                  </Button>
                ) : (
                  <Button
                    onClick={pauseSimulation}
                    className="text-[10px] h-9 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black cursor-pointer uppercase flex items-center gap-1.5"
                  >
                    <Pause className="h-3.5 w-3.5" />
                    <span>Pause Sim</span>
                  </Button>
                )}

                <Button
                  variant="outline"
                  onClick={resetSimulation}
                  className="text-[10px] h-9 border-slate-800 bg-slate-900/60 text-slate-300 hover:text-white cursor-pointer uppercase flex items-center gap-1.5"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Reset Sim</span>
                </Button>
              </div>
            </div>

            {/* Simulation speed configuration buttons */}
            <div className="space-y-3 pt-3 border-t border-slate-900 select-none">
              <div className="text-[9px] text-slate-500 font-bold uppercase flex items-center gap-1">
                <Gauge className="h-3.5 w-3.5" />
                <span>Simulation Ticker Velocity</span>
              </div>
              <div className="flex gap-1.5 border border-slate-800 bg-slate-950 p-1 rounded text-[8px] max-w-xs">
                {(["SLOW", "NORMAL", "FAST"] as const).map((spd) => (
                  <button
                    key={spd}
                    onClick={() => setSimulationSpeed(spd)}
                    className={cn(
                      "flex-1 py-1 rounded transition text-center uppercase tracking-wider font-extrabold cursor-pointer",
                      simulationConfig.speed === spd
                        ? "bg-slate-800 text-cyan-400 font-black"
                        : "text-slate-500 hover:text-slate-300"
                    )}
                  >
                    {spd}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Metrics display */}
          <div className="p-4 border border-slate-800 bg-[#111827] rounded shadow-md grid grid-cols-2 gap-4 select-none">
            <div className="space-y-1">
              <span className="text-[8px] text-slate-500 font-bold block uppercase">fleet connection status</span>
              <span className={cn(
                "text-xs font-black",
                isEmergencyStop ? "text-rose-500" : "text-emerald-400"
              )}>
                {isEmergencyStop ? "FAILSAFE LOCKED" : "DSN LOCK ACTIVE"}
              </span>
            </div>

            <div className="space-y-1">
              <span className="text-[8px] text-slate-500 font-bold block uppercase">buffered telemetry logs</span>
              <span className="text-xs font-black text-slate-200 tabular-nums">
                {events.length} LOG RECORDS
              </span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
