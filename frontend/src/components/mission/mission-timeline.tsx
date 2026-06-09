"use client";

import { Check, Compass } from "lucide-react";
import { useMissionStore } from "@/store/mission-store";

export default function MissionTimeline() {
  const { missions } = useMissionStore();
  const currentMission = missions.find(m => m.status === "ACTIVE") || missions[0];

  if (!currentMission) {
    return (
      <div className="h-32 flex items-center justify-center border border-dashed border-slate-800 rounded font-mono text-slate-500 text-[10px] uppercase">
        No active mission history.
      </div>
    );
  }

  const steps = currentMission.stateHistory || [];

  return (
    <div className="space-y-4 font-mono">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-semibold text-slate-400 tracking-wider flex items-center gap-1.5 uppercase">
          <Compass className="h-3.5 w-3.5 text-cyan-400" />
          CHRONOLOGICAL_MILESTONES // MET_CHECKLIST
        </h2>
        <span className="text-[8px] text-cyan-400 uppercase font-bold truncate max-w-[120px]" title={currentMission.name}>
          {currentMission.name}
        </span>
      </div>

      <div className="p-4 rounded border border-slate-800 bg-[#111827] space-y-4">
        <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-[1px] before:bg-slate-800 max-h-[200px] overflow-y-auto pr-1">
          {steps.map((step, idx) => {
            const isLast = idx === steps.length - 1;
            return (
              <div key={idx} className="relative flex items-start justify-between gap-4 text-[10px]">
                {/* Stepper Dot */}
                <div className="absolute -left-6 top-1">
                  {isLast && currentMission.status === "ACTIVE" ? (
                    <div className="h-5 w-5 rounded-full bg-cyan-500/10 border border-cyan-500/40 flex items-center justify-center text-cyan-400 relative">
                      <div className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse"></div>
                    </div>
                  ) : (
                    <div className="h-5 w-5 rounded-full bg-emerald-500/10 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                      <Check className="h-3 w-3" />
                    </div>
                  )}
                </div>

                {/* Step info */}
                <div className="flex flex-col">
                  <span className={`font-bold ${isLast ? "text-cyan-400" : "text-slate-300"}`}>
                    {step.state}
                  </span>
                  <span className="text-[8px] text-slate-500 uppercase mt-0.5">{step.reason}</span>
                </div>

                {/* Timestamp */}
                <span className={`text-[9px] font-semibold tracking-wide ${isLast ? "text-cyan-400" : "text-slate-500"}`}>
                  {step.timestamp}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
