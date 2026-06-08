"use client";

import { Check, Compass, Radio, Target } from "lucide-react";

export default function MissionTimeline() {
  const steps = [
    { label: "MISSION CREATED", time: "MET 000d:00h", status: "complete" },
    { label: "MOTHER ROVER ONLINE", time: "MET 000d:02h", status: "complete" },
    { label: "SCOUT-1 DEPLOYED", time: "MET 003d:12h", status: "complete" },
    { label: "SCOUT-2 DEPLOYED", time: "MET 005d:08h", status: "complete" },
    { label: "EXPLORATION ACTIVE", time: "SOL 142 CURRENT", status: "active" },
  ];

  return (
    <div className="space-y-4 font-mono">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-semibold text-slate-400 tracking-wider flex items-center gap-1.5 uppercase">
          <Compass className="h-3.5 w-3.5 text-cyan-400" />
          CHRONOLOGICAL_MILESTONES // MET_CHECKLIST
        </h2>
        <span className="text-[8px] text-cyan-400 uppercase font-bold">
          PHASE_IV ACTIVE
        </span>
      </div>

      <div className="p-4 rounded border border-slate-800 bg-[#111827] space-y-4">
        <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-[1px] before:bg-slate-800">
          {steps.map((step, idx) => (
            <div key={idx} className="relative flex items-start justify-between gap-4 text-[10px]">
              {/* Stepper Dot */}
              <div className="absolute -left-6 top-1">
                {step.status === "complete" ? (
                  <div className="h-5 w-5 rounded-full bg-emerald-500/10 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                    <Check className="h-3 w-3" />
                  </div>
                ) : (
                  <div className="h-5 w-5 rounded-full bg-cyan-500/10 border border-cyan-500/40 flex items-center justify-center text-cyan-400 relative">
                    <div className="h-1.5 w-1.5 rounded-full bg-cyan-400"></div>
                  </div>
                )}
              </div>

              {/* Step info */}
              <div className="flex flex-col">
                <span className={`font-bold ${step.status === "active" ? "text-cyan-400" : "text-slate-300"}`}>
                  {step.label}
                </span>
                <span className="text-[8px] text-slate-500 uppercase mt-0.5">SEQ_{idx + 1} CONFIRMED</span>
              </div>

              {/* Timestamp */}
              <span className={`text-[9px] font-semibold tracking-wide ${step.status === "active" ? "text-cyan-400" : "text-slate-500"}`}>
                {step.time}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
