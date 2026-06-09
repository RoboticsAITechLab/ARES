"use client";

import { use, useState } from "react";
import { useMissionStore } from "@/store/mission-store";
import Link from "next/link";
import { Cpu, Wifi, Battery, MapPin, Compass, Thermometer, Radio, ArrowLeft, Layers, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import StatusBadge from "@/components/StatusBadge";
import TelemetryCard from "@/components/TelemetryCard";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function RoverDetailsPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;

  const { rovers, missions, events } = useMissionStore();
  const rover = rovers.find(r => r.id === id);

  if (!rover) {
    return (
      <div className="space-y-6 font-mono text-slate-100 text-center py-12">
        <h2 className="text-sm font-bold text-rose-500 uppercase">Rover core segment not found</h2>
        <p className="text-[10px] text-slate-500 mt-2">Node ID: {id} is not registered in central operations.</p>
        <Link href="/rovers" className="mt-4 inline-block text-[10px] px-3 py-1.5 border border-slate-800 bg-slate-900 text-slate-400 hover:text-white uppercase font-bold">
          Back to Fleet list
        </Link>
      </div>
    );
  }

  const activeMission = rover.currentMissionId ? missions.find(m => m.id === rover.currentMissionId) : null;
  const roverEvents = events.filter(e => e.source === rover.name).slice(0, 5);

  return (
    <div className="space-y-6 font-mono text-slate-100 animate-fade-in">
      {/* Header breadcrumb */}
      <div className="flex justify-between items-center select-none">
        <Link href="/rovers" className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-200 text-[10px] uppercase font-bold">
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Fleet inventory</span>
        </Link>

        {/* Tab links */}
        <div className="flex gap-1 border border-slate-800 bg-[#111827] p-0.5 rounded text-[9px] font-bold">
          <Link href={`/rovers/${rover.id}`} className="px-3 py-1.5 rounded bg-slate-850 text-cyan-400 font-extrabold uppercase">
            Overview
          </Link>
          <Link href={`/rovers/${rover.id}/telemetry`} className="px-3 py-1.5 rounded text-slate-500 hover:text-slate-350 uppercase">
            Charts
          </Link>
          <Link href={`/rovers/${rover.id}/history`} className="px-3 py-1.5 rounded text-slate-500 hover:text-slate-350 uppercase">
            Logs
          </Link>
        </div>
      </div>

      {/* Title */}
      <div className="p-4 rounded border border-slate-800 bg-[#111827] flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <Cpu className="h-5 w-5 text-cyan-400" />
          <div>
            <div className="text-[10px] text-slate-500 tracking-wider">VEHICLE DIAGNOSTIC SUMMARY</div>
            <h1 className="text-sm font-black tracking-widest text-white uppercase">
              {rover.name} <span className="text-slate-700">//</span> {rover.id}
            </h1>
          </div>
        </div>
        <StatusBadge status={rover.status} />
      </div>

      {/* Main grids */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left 2 cols */}
        <div className="lg:col-span-2 space-y-6">
          {/* Telemetry Cards Grid */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-slate-400 tracking-wider flex items-center gap-1.5 uppercase select-none">
              <Layers className="h-3.5 w-3.5 text-cyan-400" />
              PRIORITY_TELEMETRY
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <TelemetryCard
                label="Power Core capacity"
                value={rover.battery.toFixed(1)}
                unit="%"
                status={rover.battery < 40 ? "warning" : "nominal"}
                percent={rover.battery}
              />
              <TelemetryCard
                label="DSN signal quality"
                value={rover.signal}
                unit="%"
                status={rover.status === "ERROR" || rover.status === "OFFLINE" ? "critical" : "nominal"}
                percent={rover.signal}
              />
              <TelemetryCard
                label="Core CPU load"
                value={rover.cpu}
                unit="%"
                status={rover.cpu > 80 ? "warning" : "nominal"}
                percent={rover.cpu}
              />
              <TelemetryCard
                label="Memory capacity"
                value={rover.memory}
                unit="%"
                percent={rover.memory}
              />
              <TelemetryCard
                label="Thermal Sweeper"
                value={rover.temperature}
                unit="°C"
                status={rover.temperature > 50 ? "warning" : "nominal"}
              />
              <TelemetryCard
                label="Link Quality"
                value={rover.linkQuality}
                unit="%"
                percent={rover.linkQuality}
              />
            </div>
          </div>

          {/* Current Mission & Live Position */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Position */}
            <div className="p-4 rounded border border-slate-800 bg-[#111827] space-y-4 shadow-md">
              <h3 className="text-xs font-semibold text-slate-400 tracking-wider flex items-center gap-1.5 uppercase select-none border-b border-slate-900 pb-2">
                <MapPin className="h-3.5 w-3.5 text-cyan-400" />
                COORDINATES_VECTOR
              </h3>
              
              <div className="space-y-3 text-[10px] text-slate-300">
                <div className="flex justify-between border-b border-slate-900 pb-1.5">
                  <span className="text-slate-500">LATITUDE:</span>
                  <span className="font-extrabold text-slate-100 tabular-nums">{rover.latitude.toFixed(5)}</span>
                </div>
                <div className="flex justify-between border-b border-slate-900 pb-1.5">
                  <span className="text-slate-500">LONGITUDE:</span>
                  <span className="font-extrabold text-slate-100 tabular-nums">{rover.longitude.toFixed(5)}</span>
                </div>
                <div className="flex justify-between border-b border-slate-900 pb-1.5">
                  <span className="text-slate-500">SPEED (LIVE):</span>
                  <span className="font-extrabold text-slate-100 tabular-nums">{rover.speed.toFixed(2)} m/s</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">HEARTBEAT:</span>
                  <span className="font-bold text-emerald-400 tabular-nums">{rover.lastHeartbeat || "1.2s ago"}</span>
                </div>
              </div>
            </div>

            {/* Mission */}
            <div className="p-4 rounded border border-slate-800 bg-[#111827] space-y-4 shadow-md">
              <h3 className="text-xs font-semibold text-slate-400 tracking-wider flex items-center gap-1.5 uppercase select-none border-b border-slate-900 pb-2">
                <Heart className="h-3.5 w-3.5 text-cyan-400" />
                ASSIGNED_MISSION
              </h3>

              {activeMission ? (
                <div className="space-y-3 text-[10px] text-slate-300">
                  <div className="flex justify-between border-b border-slate-900 pb-1.5">
                    <span className="text-slate-500 font-bold uppercase">MISSION:</span>
                    <span className="font-black text-white truncate max-w-[120px] uppercase">{activeMission.name}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-900 pb-1.5">
                    <span className="text-slate-500 font-bold uppercase">STATUS:</span>
                    <span className="font-bold text-cyan-400 uppercase">{activeMission.status}</span>
                  </div>
                  <div className="flex justify-between flex-col gap-1">
                    <span className="text-slate-500 font-bold uppercase">TASKS DONE:</span>
                    <span className="font-bold text-slate-200">
                      {activeMission.objectives.filter(o => o.status === "COMPLETED").length} / {activeMission.objectives.length} TASKS
                    </span>
                  </div>
                </div>
              ) : (
                <div className="h-28 flex items-center justify-center text-center text-slate-650 text-[10px]">
                  NO ACTIVE MISSION CONSTRAINTS DETECTED
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right 1 col: Recent Events activity logs */}
        <div className="p-4 border border-slate-800 bg-[#111827] rounded shadow-md space-y-4 h-[440px] flex flex-col justify-between">
          <div className="space-y-3 flex-1 overflow-hidden flex flex-col">
            <h3 className="text-xs font-semibold text-slate-400 tracking-wider flex items-center gap-1.5 uppercase select-none border-b border-slate-900 pb-2">
              <Radio className="h-3.5 w-3.5 text-cyan-400" />
              VEHICLE_LOGS // LATEST
            </h3>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1 select-text">
              {roverEvents.length > 0 ? (
                roverEvents.map((evt) => (
                  <div key={evt.id} className="p-2 rounded border border-slate-900 bg-slate-950/40 text-[9px] space-y-1">
                    <div className="flex justify-between text-slate-550 font-bold">
                      <span className={cn(
                        evt.severity === "CRITICAL" ? "text-rose-500" :
                        evt.severity === "WARNING" ? "text-amber-500" :
                        "text-emerald-500"
                      )}>{evt.severity}</span>
                      <span className="tabular-nums">{evt.timestamp}</span>
                    </div>
                    <p className="text-slate-300 leading-normal">{evt.description}</p>
                  </div>
                ))
              ) : (
                <div className="h-full flex items-center justify-center text-center text-slate-600 text-[9px] leading-relaxed">
                  NO EVENT HISTORY RECORDED FOR THIS NODE
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
