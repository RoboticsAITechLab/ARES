"use client";

import { useMissionStore } from "@/store/mission-store";
import { Scout, transitionScout } from "@/domain/scouts/types";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Radio, ArrowUpRight, Heart, Wifi, Battery, Play, Anchor } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ScoutsPage() {
  const { scouts, recoverScout, missions } = useMissionStore();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
      case "DEPLOYING":
        return "text-emerald-400 border-emerald-500/20 bg-emerald-500/5";
      case "RETURNING":
      case "RECOVERING":
        return "text-cyan-400 border-cyan-500/20 bg-cyan-500/5 animate-pulse";
      case "DOCKED":
        return "text-slate-400 border-slate-800 bg-slate-900/40";
      case "ERROR":
      case "OFFLINE":
      default:
        return "text-rose-455 border-rose-500/25 bg-rose-500/5 animate-pulse";
    }
  };

  const getMissionName = (missionId?: string) => {
    if (!missionId) return "N/A";
    const m = missions.find(m => m.id === missionId);
    return m ? m.name : "N/A";
  };

  return (
    <div className="space-y-6 font-mono text-slate-100 animate-fade-in">
      {/* Page Header */}
      <div className="p-4 rounded border border-slate-800 bg-[#111827] flex items-center justify-between shadow-lg select-none">
        <div className="flex items-center gap-3">
          <Radio className="h-5 w-5 text-cyan-400 animate-status-pulse" />
          <div>
            <div className="text-[10px] text-slate-500 tracking-wider font-bold">RECONNAISSANCE SYSTEMS DOCK</div>
            <h1 className="text-sm font-black tracking-widest text-white uppercase">
              SCOUT_FLEET_OPERATIONS // FLIGHT_LOGISTICS
            </h1>
          </div>
        </div>

        <Link href="/scouts/deploy" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded border border-cyan-500/40 bg-cyan-500/10 text-cyan-455 hover:bg-cyan-500/20 transition font-bold uppercase text-[10px] select-none">
          <Play className="h-3.5 w-3.5" />
          <span>Launch Scout</span>
        </Link>
      </div>

      {/* Main grids */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Active Scouts Table (takes 2 cols) */}
        <div className="lg:col-span-2 border border-slate-800 bg-[#111827] rounded overflow-hidden shadow-md">
          <div className="p-4 border-b border-slate-800/80 bg-slate-950/20 select-none">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">ACTIVE_RECON_INVENTORY</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-[10px]">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/40 text-slate-500 font-bold uppercase tracking-wider select-none">
                  <th className="p-3">NODE ID</th>
                  <th className="p-3">STATUS</th>
                  <th className="p-3">POWER</th>
                  <th className="p-3">LINK</th>
                  <th className="p-3">MISSION ASSIGNMENT</th>
                  <th className="p-3 text-center">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850">
                {scouts.map((scout) => (
                  <tr key={scout.id} className="hover:bg-slate-900/25 transition">
                    <td className="p-3 font-extrabold text-slate-200 uppercase">{scout.name}</td>
                    <td className="p-3">
                      <span className={cn("inline-block px-2 py-0.5 rounded border text-[8px] font-bold uppercase select-none", getStatusColor(scout.status))}>
                        {scout.status}
                      </span>
                    </td>
                    <td className="p-3 font-bold text-slate-350 tabular-nums">
                      <div className="flex items-center gap-1.5">
                        <Battery className="h-3.5 w-3.5 text-cyan-400" />
                        <span>{scout.battery.toFixed(1)}%</span>
                      </div>
                    </td>
                    <td className="p-3 font-bold text-slate-350 tabular-nums">
                      <div className="flex items-center gap-1.5">
                        <Wifi className="h-3.5 w-3.5 text-cyan-400" />
                        <span>{scout.signal}%</span>
                      </div>
                    </td>
                    <td className="p-3 font-semibold text-slate-450 truncate max-w-[150px] uppercase">
                      {getMissionName(scout.assignedMissionId)}
                    </td>
                    <td className="p-3 text-center select-none">
                      {scout.status === "ACTIVE" || scout.status === "DEPLOYING" ? (
                        <Button
                          size="sm"
                          onClick={() => recoverScout(scout.id)}
                          className="text-[8px] h-6 px-2 border-cyan-500/30 bg-cyan-500/5 text-cyan-400 hover:bg-cyan-500/20 font-bold cursor-pointer uppercase flex items-center justify-center gap-1"
                        >
                          <Anchor className="h-3 w-3" />
                          <span>RECALL</span>
                        </Button>
                      ) : (
                        <span className="text-slate-600 font-bold uppercase text-[8px]">DOCKED</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Scout Recovery Center (1 col) */}
        <div className="p-4 border border-slate-800 bg-[#111827] rounded shadow-md space-y-4">
          <h3 className="text-xs font-bold text-slate-400 tracking-wider flex items-center gap-1.5 uppercase select-none border-b border-slate-900 pb-2">
            <Anchor className="h-4 w-4 text-cyan-400" />
            RECOVERY_MONITOR
          </h3>

          <div className="space-y-4">
            {scouts.some(s => s.status === "RETURNING" || s.status === "RECOVERING") ? (
              scouts
                .filter(s => s.status === "RETURNING" || s.status === "RECOVERING")
                .map(scout => (
                  <div key={scout.id} className="p-3 rounded border border-slate-850 bg-slate-950/40 space-y-3 text-[10px] text-slate-300">
                    <div className="flex justify-between border-b border-slate-900 pb-1.5 select-none">
                      <span className="font-extrabold text-slate-200 uppercase">{scout.name}</span>
                      <span className="text-cyan-400 font-bold uppercase animate-pulse">{scout.status}</span>
                    </div>
                    <div className="space-y-2 text-[9px]">
                      <div className="flex justify-between">
                        <span className="text-slate-500">HOMING DISTANCE:</span>
                        <span className="font-bold text-slate-100 tabular-nums">{scout.returnDistance || 150} meters</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">BEARING HEADING:</span>
                        <span className="font-bold text-slate-100 tabular-nums">{(scout.returnHeading || 90)}° ENE</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">DOCK STAT:</span>
                        <span className="font-bold text-emerald-400 uppercase">{scout.recoveryState || "RETRIEVING"}</span>
                      </div>
                    </div>
                  </div>
                ))
            ) : (
              <div className="h-28 flex flex-col items-center justify-center text-center text-slate-650 text-[10px] leading-relaxed border border-dashed border-slate-850 rounded p-4">
                NO ACTIVE VEHICLE RECOVERY COMMANDS DISPATCHED
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
