"use client";

import { useState } from "react";
import { useMissionStore } from "@/store/mission-store";
import { Rover, RoverState } from "@/domain/rovers/types";
import Link from "next/link";
import { Cpu, Search, SlidersHorizontal, Battery, Wifi, Eye, Radio } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function RoversPage() {
  const { rovers, missions } = useMissionStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | RoverState>("ALL");
  const [sortBy, setSortBy] = useState<"name" | "battery">("name");

  const getStatusColor = (status: RoverState) => {
    switch (status) {
      case "EXPLORING":
      case "DEPLOYED":
        return "text-emerald-400 border-emerald-500/20 bg-emerald-500/5";
      case "CHARGING":
        return "text-amber-400 border-amber-500/20 bg-amber-500/5";
      case "READY":
        return "text-cyan-400 border-cyan-500/20 bg-cyan-500/5";
      case "OFFLINE":
      case "ERROR":
        return "text-rose-400 border-rose-500/20 bg-rose-500/5 animate-pulse";
      case "IDLE":
      default:
        return "text-slate-400 border-slate-800 bg-slate-900/40";
    }
  };

  const getMissionName = (missionId?: string) => {
    if (!missionId) return "UNASSIGNED";
    const m = missions.find(m => m.id === missionId);
    return m ? m.name : "UNASSIGNED";
  };

  // Filter & Sort rovers
  const filteredRovers = rovers
    .filter((r) => {
      const matchesSearch = r.name.toLowerCase().includes(searchQuery.toLowerCase()) || r.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "ALL" || r.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === "battery") return b.battery - a.battery;
      return a.name.localeCompare(b.name);
    });

  return (
    <div className="space-y-6 font-mono text-slate-100 animate-fade-in">
      {/* Page Header */}
      <div className="p-4 rounded border border-slate-800 bg-[#111827] flex items-center justify-between shadow-lg select-none">
        <div className="flex items-center gap-3">
          <Cpu className="h-5 w-5 text-cyan-400" />
          <div>
            <div className="text-[10px] text-slate-500 tracking-wider font-bold">VEHICLE LOGISTICS CORE</div>
            <h1 className="text-sm font-black tracking-widest text-white uppercase">
              FLEET_INVENTORY // DIAGNOSTIC_LIST
            </h1>
          </div>
        </div>
        <div className="text-[10px] text-slate-500 uppercase font-bold">
          TOTAL_NODES: {rovers.length}
        </div>
      </div>

      {/* Filter panel */}
      <div className="p-4 rounded border border-slate-800 bg-[#111827] flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-md">
        {/* Search */}
        <div className="relative flex-1 max-w-sm select-none">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-600" />
          <input
            type="text"
            placeholder="Search Rover node..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-[11px] bg-slate-950 border border-slate-850 p-2.5 pl-9 rounded focus:outline-none focus:border-cyan-500/40 text-slate-200 placeholder-slate-600"
          />
        </div>

        {/* Filter / Sort selections */}
        <div className="flex flex-wrap items-center gap-3 text-[10px] select-none">
          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-bold uppercase">FILTER:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="bg-slate-950 border border-slate-800 text-slate-350 p-1.5 rounded focus:outline-none font-bold"
            >
              <option value="ALL">ALL STATUSES</option>
              <option value="IDLE">IDLE</option>
              <option value="READY">READY</option>
              <option value="EXPLORING">EXPLORING</option>
              <option value="RETURNING">RETURNING</option>
              <option value="CHARGING">CHARGING</option>
              <option value="OFFLINE">OFFLINE</option>
              <option value="ERROR">ERROR</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-bold uppercase">SORT:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-slate-950 border border-slate-800 text-slate-350 p-1.5 rounded focus:outline-none font-bold"
            >
              <option value="name">NAME</option>
              <option value="battery">BATTERY CAPACITY</option>
            </select>
          </div>
        </div>
      </div>

      {/* Rovers Tabular Matrix */}
      <div className="border border-slate-800 bg-[#111827] rounded overflow-hidden shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-mono text-[11px]">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-500 text-[9px] font-bold uppercase tracking-wider select-none">
                <th className="p-4">ROVER IDENTIFIER</th>
                <th className="p-4">STATUS</th>
                <th className="p-4">POWER</th>
                <th className="p-4">SIGNAL</th>
                <th className="p-4">LAST CONTACT</th>
                <th className="p-4">MISSION ASSIGNMENT</th>
                <th className="p-4 text-center">ACCESS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850">
              {filteredRovers.length > 0 ? (
                filteredRovers.map((rover) => (
                  <tr key={rover.id} className="hover:bg-slate-900/30 transition">
                    <td className="p-4 font-extrabold text-white uppercase">
                      <div className="flex flex-col">
                        <span>{rover.name}</span>
                        <span className="text-[8px] text-slate-500 font-normal">TYPE: {rover.type.toUpperCase()} // NODE: {rover.id}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={cn("inline-block px-2 py-0.5 rounded border text-[9px] font-bold uppercase select-none", getStatusColor(rover.status))}>
                        {rover.status}
                      </span>
                    </td>
                    <td className="p-4 font-bold text-slate-200 tabular-nums">
                      <div className="flex items-center gap-2">
                        <Battery className={cn("h-3.5 w-3.5", rover.battery < 40 ? "text-rose-500" : "text-cyan-400")} />
                        <span>{rover.battery.toFixed(1)}%</span>
                      </div>
                    </td>
                    <td className="p-4 font-bold text-slate-200 tabular-nums">
                      <div className="flex items-center gap-2">
                        <Wifi className="h-3.5 w-3.5 text-cyan-400" />
                        <span>{rover.signal}%</span>
                      </div>
                    </td>
                    <td className="p-4 text-slate-400 tabular-nums">{rover.lastHeartbeat || rover.lastContact}</td>
                    <td className="p-4 font-semibold text-slate-300 truncate max-w-[180px]" title={getMissionName(rover.currentMissionId)}>
                      {getMissionName(rover.currentMissionId)}
                    </td>
                    <td className="p-4 text-center select-none">
                      <div className="flex items-center justify-center gap-1.5">
                        <Link href={`/rovers/${rover.id}`} className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-slate-800 bg-slate-900/40 text-slate-350 hover:bg-slate-950 hover:text-cyan-400 transition hover:border-cyan-500/20 font-bold uppercase text-[9px]">
                          <Eye className="h-3.5 w-3.5" />
                          <span>MNT</span>
                        </Link>
                        <Link href={`/rovers/${rover.id}/telemetry`} className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-slate-800 bg-slate-900/40 text-slate-350 hover:bg-slate-950 hover:text-cyan-400 transition hover:border-cyan-500/20 font-bold uppercase text-[9px]">
                          <Radio className="h-3.5 w-3.5" />
                          <span>TEL</span>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr className="select-none">
                  <td colSpan={7} className="p-12 text-center text-slate-600 font-bold">
                    NO COMPATIBLE ROVER CORE SEGMENTS LOCATED
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
