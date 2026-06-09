"use client";

import { useState } from "react";
import { useMissionStore } from "@/store/mission-store";
import { 
  Play, 
  CheckCircle2, 
  AlertOctagon, 
  Activity, 
  Radio, 
  Clock, 
  User, 
  FileText,
  Compass,
  ArrowLeft,
  Battery,
  Wifi,
  Cpu,
  Navigation
} from "lucide-react";
import Link from "next/link";

export default function MissionExecutionPage() {
  const { 
    missions, 
    rovers, 
    events, 
    updateMissionStatus, 
    updateObjectiveStatus,
    simulationConfig
  } = useMissionStore();

  const [selectedMissionId, setSelectedMissionId] = useState<string>(
    missions.find(m => m.status === "ACTIVE")?.id || missions[0]?.id || ""
  );

  const currentMission = missions.find(m => m.id === selectedMissionId);

  if (!currentMission) {
    return (
      <div className="h-64 flex flex-col items-center justify-center border border-dashed border-slate-800 rounded font-mono text-slate-500">
        <AlertOctagon className="h-8 w-8 text-rose-500 mb-2" />
        NO ACTIVE MISSION ASSETS CONFIGURED IN THE DATABASE.
      </div>
    );
  }

  // Get rovers assigned to this mission
  const assignedRovers = rovers.filter(r => currentMission.assignedRoverIds.includes(r.id));

  // Compute objective completion percentage
  const completedObjectives = currentMission.objectives.filter(o => o.status === "COMPLETED").length;
  const totalObjectives = currentMission.objectives.length;
  const completionPercent = totalObjectives > 0 ? Math.round((completedObjectives / totalObjectives) * 100) : 0;

  // Filter events belonging to this mission
  const missionEvents = events.filter(e => 
    e.source === currentMission.name || 
    assignedRovers.some(r => r.name === e.source) || 
    e.description.includes(currentMission.name)
  );

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "border-emerald-500/30 bg-emerald-500/10 text-emerald-400 font-extrabold animate-status-pulse";
      case "READY":
        return "border-cyan-500/30 bg-cyan-500/10 text-cyan-400 font-bold";
      case "PLANNED":
        return "border-slate-700 bg-slate-900 text-slate-400";
      case "COMPLETED":
        return "border-blue-500/30 bg-blue-500/10 text-blue-400 font-bold";
      case "ABORTED":
        return "border-rose-500/40 bg-rose-500/10 text-rose-400 font-extrabold animate-pulse";
      default:
        return "border-slate-800 bg-[#111827]/40 text-slate-500";
    }
  };

  const getObjectiveStatusClass = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "text-emerald-400";
      case "ACTIVE":
        return "text-cyan-400 font-extrabold animate-pulse";
      case "FAILED":
        return "text-rose-400 font-bold";
      default:
        return "text-slate-500";
    }
  };

  return (
    <div className="space-y-6 font-mono select-none animate-fade-in">
      {/* Top Breadcrumb & Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link 
          href="/mission-control" 
          className="flex items-center gap-1.5 text-[10px] text-slate-400 hover:text-cyan-400 font-bold uppercase transition"
        >
          <ArrowLeft className="h-4 w-4" />
          RETURN TO MISSION DASHBOARD
        </Link>

        {/* Mission Selector */}
        <div className="flex items-center gap-2 text-[10px]">
          <span className="text-slate-500 font-bold uppercase">MONITOR MISSION:</span>
          <select 
            value={selectedMissionId}
            onChange={(e) => setSelectedMissionId(e.target.value)}
            className="bg-[#0C1222] border border-slate-800 text-slate-200 text-[10px] px-3 py-1.5 rounded focus:outline-none focus:border-cyan-500/50 font-bold cursor-pointer"
          >
            {missions.map(m => (
              <option key={m.id} value={m.id}>
                {m.name} ({m.status})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left 2 Columns: Mission Status, Controls, Objectives and Rovers */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Mission Overview Card */}
          <div className="p-5 border border-slate-800 bg-[#0C1222] rounded shadow-md relative cyber-card space-y-4">
            <div className="flex items-center justify-between border-b border-slate-850 pb-3">
              <div>
                <span className="text-[8px] text-slate-500 font-bold uppercase tracking-widest">REAL-TIME COMMAND UNIT</span>
                <h2 className="text-sm font-black text-white tracking-widest uppercase">{currentMission.name}</h2>
              </div>
              <span className={`text-[9px] px-2 py-0.5 rounded border uppercase tracking-widest ${getStatusBadgeClass(currentMission.status)}`}>
                {currentMission.status}
              </span>
            </div>

            <p className="text-[10px] text-slate-300 leading-relaxed">
              {currentMission.description}
            </p>

            {/* Quick Metadata */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2 text-[9px] text-slate-400">
              <div className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-slate-500" />
                <div>
                  <div className="font-bold text-[8px] text-slate-500">PLAN TIME (SOLS)</div>
                  <div className="text-slate-200 font-extrabold">{currentMission.duration} Sols</div>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-slate-500" />
                <div>
                  <div className="font-bold text-[8px] text-slate-500">MISSION CONTROLLER</div>
                  <div className="text-slate-200 font-extrabold">{currentMission.createdBy}</div>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <Navigation className="h-3.5 w-3.5 text-slate-500" />
                <div>
                  <div className="font-bold text-[8px] text-slate-500">ASSIGNED ROVERS</div>
                  <div className="text-slate-200 font-extrabold">{assignedRovers.length} Units</div>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <Activity className="h-3.5 w-3.5 text-slate-500" />
                <div>
                  <div className="font-bold text-[8px] text-slate-500">SIM INTERVALS</div>
                  <div className="text-slate-200 font-extrabold uppercase">{simulationConfig.speed}</div>
                </div>
              </div>
            </div>

            {/* Command Controls */}
            <div className="flex flex-wrap gap-3 pt-4 border-t border-slate-850">
              {currentMission.status !== "ACTIVE" && currentMission.status !== "ABORTED" && currentMission.status !== "COMPLETED" && (
                <button
                  onClick={() => updateMissionStatus(currentMission.id, "ACTIVE", "Manual pilot launch")}
                  className="flex items-center gap-1.5 px-4 py-2 border border-emerald-500 bg-emerald-500/10 text-emerald-400 rounded text-[10px] font-extrabold uppercase hover:bg-emerald-500/20 transition cursor-pointer"
                >
                  <Play className="h-3.5 w-3.5" />
                  LAUNCH MISSION PHASE
                </button>
              )}

              {currentMission.status === "ACTIVE" && (
                <>
                  <button
                    onClick={() => updateMissionStatus(currentMission.id, "COMPLETED", "Objectives met")}
                    className="flex items-center gap-1.5 px-4 py-2 border border-blue-500 bg-blue-500/10 text-blue-400 rounded text-[10px] font-extrabold uppercase hover:bg-blue-500/20 transition cursor-pointer"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    COMPLETE MISSION
                  </button>

                  <button
                    onClick={() => updateMissionStatus(currentMission.id, "ABORTED", "Operator override directive")}
                    className="flex items-center gap-1.5 px-4 py-2 border border-rose-500 bg-rose-500/10 text-rose-400 rounded text-[10px] font-extrabold uppercase hover:bg-rose-500/20 transition cursor-pointer"
                  >
                    <AlertOctagon className="h-3.5 w-3.5" />
                    ABORT MISSION
                  </button>
                </>
              )}

              {currentMission.status === "ABORTED" && (
                <div className="text-[10px] text-rose-400 font-bold border border-rose-500/20 bg-rose-500/5 px-3 py-2 rounded w-full flex items-center gap-2">
                  <AlertOctagon className="h-4 w-4 shrink-0 text-rose-500 animate-pulse" />
                  <span>MISSION SAFE-MODE ABORT OVERRIDE COMPLETED. SYSTEMS COOLDOWN ACTIVE.</span>
                </div>
              )}

              {currentMission.status === "COMPLETED" && (
                <div className="text-[10px] text-emerald-400 font-bold border border-emerald-500/20 bg-emerald-500/5 px-3 py-2 rounded w-full flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                  <span>MISSION COMPLETED. SCIENTIFIC PAYLOAD SECURED IN ARCHIVES.</span>
                </div>
              )}
            </div>
          </div>

          {/* Objectives Check-In Checklist */}
          <div className="p-5 border border-slate-800 bg-[#0C1222] rounded shadow-md relative cyber-card space-y-4">
            <div className="flex items-center justify-between border-b border-slate-850 pb-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-cyan-400" />
                <h3 className="text-xs font-bold text-white tracking-widest uppercase">
                  OBJECTIVES CHECK-IN // VERIFICATION
                </h3>
              </div>
              <div className="text-[10px] text-slate-400 font-bold">
                MET: <span className="text-cyan-400 font-extrabold">{completionPercent}% COMPLETE</span>
              </div>
            </div>

            {/* Objective Progress Bar */}
            <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
              <div 
                className="h-full bg-cyan-500 transition-all duration-300"
                style={{ width: `${completionPercent}%` }}
              />
            </div>

            {/* Interactive List */}
            <div className="space-y-3 pt-2">
              {currentMission.objectives.map((obj) => (
                <div 
                  key={obj.id} 
                  className="p-3 border border-slate-850 bg-slate-950/30 rounded flex items-start justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-[8px] font-bold px-1.5 py-0.2 rounded border uppercase tracking-wider ${
                        obj.status === "COMPLETED" 
                          ? "border-emerald-500/20 bg-emerald-500/5 text-emerald-400"
                          : obj.status === "ACTIVE"
                          ? "border-cyan-500/20 bg-cyan-500/5 text-cyan-400"
                          : "border-slate-800 text-slate-500"
                      }`}>
                        {obj.status}
                      </span>
                      <span className="text-xs font-semibold text-slate-200">{obj.label}</span>
                    </div>
                    <p className="text-[9px] text-slate-500 pl-2 leading-relaxed">{obj.description}</p>
                  </div>

                  {/* Objective Status Interactive Changer */}
                  {currentMission.status === "ACTIVE" && (
                    <select
                      value={obj.status}
                      onChange={(e) => updateObjectiveStatus(currentMission.id, obj.id, e.target.value as any)}
                      className="bg-slate-900 border border-slate-800 text-slate-300 text-[8px] px-2 py-1 rounded focus:outline-none focus:border-cyan-500/40 cursor-pointer"
                    >
                      <option value="PENDING">PENDING</option>
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="COMPLETED">COMPLETED</option>
                      <option value="FAILED">FAILED</option>
                    </select>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Active Assigned Rovers Telemetry */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-400 tracking-wider uppercase">
              ASSIGNED ROVERS DIAGNOSTIC LINK
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {assignedRovers.length > 0 ? (
                assignedRovers.map((rover) => (
                  <div key={rover.id} className="p-4 rounded border border-slate-850 bg-[#0C1222] space-y-4 shadow-md">
                    <div className="flex justify-between items-center border-b border-slate-850 pb-2">
                      <div>
                        <h4 className="text-xs font-extrabold text-white tracking-widest uppercase">{rover.name}</h4>
                        <span className="text-[8px] text-slate-500 font-bold uppercase">{rover.id}</span>
                      </div>
                      <span className={`text-[8px] px-1.5 py-0.2 rounded border font-extrabold uppercase ${
                        rover.status === "ERROR"
                          ? "border-rose-500/20 text-rose-500 animate-pulse"
                          : rover.status === "EXPLORING"
                          ? "border-emerald-500/20 text-emerald-400"
                          : "border-slate-800 text-slate-400"
                      }`}>
                        {rover.status}
                      </span>
                    </div>

                    {/* Progress bars telemetry */}
                    <div className="space-y-2 text-[9px] text-slate-400 font-mono">
                      
                      {/* Battery */}
                      <div className="space-y-1">
                        <div className="flex justify-between font-bold">
                          <span className="flex items-center gap-1">
                            <Battery className="h-3.5 w-3.5 text-cyan-400" /> POWER STORAGE
                          </span>
                          <span className="text-slate-200 font-extrabold">{rover.battery}%</span>
                        </div>
                        <div className="h-1 w-full bg-slate-950 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${rover.battery < 40 ? "bg-rose-500 animate-pulse" : "bg-cyan-500"}`} 
                            style={{ width: `${rover.battery}%` }}
                          />
                        </div>
                      </div>

                      {/* Signal */}
                      <div className="space-y-1">
                        <div className="flex justify-between font-bold">
                          <span className="flex items-center gap-1">
                            <Wifi className="h-3.5 w-3.5 text-cyan-400" /> DSN LINK SIGNAL
                          </span>
                          <span className="text-slate-200 font-extrabold">{rover.signal}%</span>
                        </div>
                        <div className="h-1 w-full bg-slate-950 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-cyan-500" 
                            style={{ width: `${rover.signal}%` }}
                          />
                        </div>
                      </div>

                      {/* Coordinates */}
                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-950 font-mono">
                        <div>
                          <div className="text-[7px] text-slate-500 font-extrabold">LATITUDE</div>
                          <div className="text-slate-300 font-bold text-[9px]">{rover.latitude.toFixed(6)}</div>
                        </div>
                        <div>
                          <div className="text-[7px] text-slate-500 font-extrabold">LONGITUDE</div>
                          <div className="text-slate-300 font-bold text-[9px]">{rover.longitude.toFixed(6)}</div>
                        </div>
                        <div>
                          <div className="text-[7px] text-slate-500 font-extrabold">SPEED</div>
                          <div className="text-slate-300 font-bold text-[9px]">{rover.speed} m/s</div>
                        </div>
                        <div>
                          <div className="text-[7px] text-slate-500 font-extrabold">TEMPERATURE</div>
                          <div className="text-slate-300 font-bold text-[9px]">{rover.temperature}°C</div>
                        </div>
                      </div>

                    </div>
                  </div>
                ))
              ) : (
                <div className="sm:col-span-2 h-20 flex items-center justify-center border border-dashed border-slate-850 rounded text-slate-600 font-semibold text-[10px]">
                  NO ROVERS REGISTERED TO THIS MISSION VECTOR.
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Right Column: Comms Relay Quality & Event Logs Cockpit */}
        <div className="space-y-6 lg:col-span-1">
          
          {/* Scientific Signal Transceiver */}
          <div className="p-5 border border-slate-800 bg-[#0C1222] rounded shadow-md relative cyber-card space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-850 pb-3">
              <Radio className="h-4 w-4 text-cyan-400" />
              <h3 className="text-xs font-bold text-white tracking-widest uppercase">
                DSN_SIGNAL_OSCILLOSCOPE
              </h3>
            </div>

            <div className="bg-[#050811] p-3 rounded border border-slate-850 flex flex-col items-center">
              {/* Simulated wave */}
              <svg className="w-full h-16 stroke-cyan-500/50 fill-none" viewBox="0 0 100 20" preserveAspectRatio="none">
                <path d="M0,10 Q10,2 20,10 T40,10 T60,10 T80,10 T100,10" strokeWidth="1.2" className="animate-pulse" />
                <path d="M0,10 Q5,15 15,10 T30,10 T50,10 T70,10 T90,10 T100,10" strokeWidth="0.5" strokeDasharray="1,2" opacity="0.6" />
              </svg>
              <div className="flex justify-between w-full text-[8px] text-slate-500 mt-2 font-bold uppercase">
                <span>COMMS BAND: HIGH-GAIN</span>
                <span>LATENCY: ~21.2 MIN</span>
              </div>
            </div>

            <div className="space-y-2 text-[9px] font-mono text-slate-400">
              <div className="flex justify-between">
                <span>RECEPTOR STATUS:</span>
                <span className="text-emerald-400 font-bold">LOCK_STABLE</span>
              </div>
              <div className="flex justify-between">
                <span>BUFFER LEVEL:</span>
                <span className="text-slate-200">0.02%</span>
              </div>
              <div className="flex justify-between">
                <span>TRANSMISSION RATE:</span>
                <span className="text-cyan-400 font-bold">244 kb/s</span>
              </div>
            </div>
          </div>

          {/* Mission Filtered Logs Cockpit */}
          <div className="p-5 border border-slate-800 bg-[#0C1222] rounded shadow-md relative flex flex-col h-[400px]">
            <h3 className="text-xs font-bold text-slate-400 tracking-wider flex items-center gap-1.5 uppercase mb-4">
              <FileText className="h-4 w-4 text-cyan-400" />
              MISSION_FLIGHT_LOGS
            </h3>

            <div className="crt-monitor relative flex-1 overflow-hidden rounded border border-slate-900 bg-[#060913] flex flex-col">
              <div className="crt-scanline" />
              <div className="flex-1 overflow-y-auto p-3.5 space-y-2.5 text-[9px] leading-relaxed font-mono">
                {missionEvents.length > 0 ? (
                  missionEvents.map((log) => (
                    <div key={log.id} className="space-y-0.5 border-b border-slate-900 pb-1.5">
                      <div className="flex justify-between text-[7px] text-slate-500 font-extrabold uppercase">
                        <span>{log.timestamp}</span>
                        <span className={log.severity === "CRITICAL" ? "text-rose-500" : log.severity === "WARNING" ? "text-amber-500" : "text-cyan-500"}>
                          [{log.severity}]
                        </span>
                      </div>
                      <p className="text-slate-300 leading-normal">{log.description}</p>
                    </div>
                  ))
                ) : (
                  <div className="h-full flex items-center justify-center text-slate-600 font-bold text-center select-none uppercase">
                    NO LOG SEGMENTS LINKED TO THIS MISSION VECTOR.
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
