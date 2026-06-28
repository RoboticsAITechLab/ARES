"use client";

import { useState } from "react";
import { useMissionStore } from "@/store/mission-store";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Rocket, ShieldAlert, Cpu, Calendar, Route, FolderOpenDot } from "lucide-react";
import { cn } from "@/lib/utils";

export default function DeployScoutPage() {
  const { scouts, missions, routes, deployScout } = useMissionStore();

  const [step, setStep] = useState(1);
  const [selectedScoutId, setSelectedScoutId] = useState("");
  const [selectedMissionId, setSelectedMissionId] = useState("");
  const [selectedRouteId, setSelectedRouteId] = useState("");

  const dockableScouts = scouts.filter(s => s.status === "DOCKED");
  const activeMissions = missions.filter(m => m.status === "ACTIVE" || m.status === "PLANNED" || m.status === "READY");
  const activeRoutes = routes; // allow any route

  const chosenScout = scouts.find(s => s.id === selectedScoutId);
  const chosenMission = missions.find(m => m.id === selectedMissionId);
  const chosenRoute = routes.find(r => r.id === selectedRouteId);

  const handleLaunch = () => {
    if (!selectedScoutId || !selectedMissionId || !selectedRouteId) return;

    deployScout(selectedScoutId, selectedMissionId, selectedRouteId);
    setStep(4); // completion step
  };

  const isNextDisabled = () => {
    if (step === 1) return !selectedScoutId;
    if (step === 2) return !selectedMissionId;
    if (step === 3) return !selectedRouteId;
    return false;
  };

  return (
    <div className="space-y-6 font-mono text-slate-100 animate-fade-in max-w-xl mx-auto">
      {/* Header breadcrumb */}
      <div className="flex justify-between items-center select-none">
        <Link href="/scouts" className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-200 text-[10px] uppercase font-bold">
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Scouts Ops</span>
        </Link>
      </div>

      {/* Main Container */}
      <div className="p-5 border border-slate-800 bg-[#111827] rounded shadow-md space-y-5">
        <h2 className="text-xs font-black text-cyan-400 tracking-wider uppercase border-b border-slate-800 pb-2 select-none flex items-center gap-2">
          <Rocket className="h-4 w-4" />
          SCOUT_DISPATCH // COMPLIANCE_SEQUENCE
        </h2>

        {/* Steps progress indicator */}
        {step < 4 && (
          <div className="flex justify-between text-[8px] text-slate-500 font-bold select-none border-b border-slate-900 pb-3">
            <span className={cn(step === 1 ? "text-cyan-400" : step > 1 ? "text-slate-300" : "")}>1. SELECT NODE</span>
            <span className={cn(step === 2 ? "text-cyan-400" : step > 2 ? "text-slate-300" : "")}>2. OBJECTIVES LINK</span>
            <span className={cn(step === 3 ? "text-cyan-400" : "")}>3. VECTOR PATH</span>
          </div>
        )}

        {/* Step 1: Select Scout */}
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="text-[10px] font-bold text-slate-300 uppercase">Select Available Scout Node</h3>
            <div className="space-y-2">
              {dockableScouts.length > 0 ? (
                dockableScouts.map(s => (
                  <button
                    key={s.id}
                    onClick={() => setSelectedScoutId(s.id)}
                    className={cn(
                      "w-full text-left p-3 rounded border text-[10px] font-bold flex justify-between items-center cursor-pointer transition",
                      selectedScoutId === s.id
                        ? "bg-cyan-500/10 border-cyan-500/40 text-cyan-400"
                        : "border-slate-850 bg-slate-950/40 text-slate-400 hover:bg-slate-900/60"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <Cpu className="h-4 w-4" />
                      <span>{s.name}</span>
                    </div>
                    <span>{s.battery}% BAT</span>
                  </button>
                ))
              ) : (
                <div className="p-8 text-center text-rose-400 border border-dashed border-rose-500/20 bg-rose-500/5 rounded text-[10px] leading-relaxed">
                  <ShieldAlert className="h-5 w-5 text-rose-500 mx-auto mb-2" />
                  CRITICAL: NO DOCKED SCOUT CORE UNITS AVAILABLE. RECALL ACTIVE VEHICLES TO RE-DOCK.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 2: Select Mission */}
        {step === 2 && (
          <div className="space-y-4">
            <h3 className="text-[10px] font-bold text-slate-300 uppercase">Assign Operational Mission</h3>
            <div className="space-y-2">
              {activeMissions.length > 0 ? (
                activeMissions.map(m => (
                  <button
                    key={m.id}
                    onClick={() => setSelectedMissionId(m.id)}
                    className={cn(
                      "w-full text-left p-3 rounded border text-[10px] font-bold flex flex-col gap-1 cursor-pointer transition",
                      selectedMissionId === m.id
                        ? "bg-cyan-500/10 border-cyan-500/40 text-cyan-400"
                        : "border-slate-850 bg-slate-950/40 text-slate-400 hover:bg-slate-900/60"
                    )}
                  >
                    <div className="flex items-center gap-2 font-extrabold uppercase">
                      <Calendar className="h-4 w-4" />
                      <span>{m.name}</span>
                    </div>
                    <span className="text-[8px] text-slate-500 font-normal">{m.description}</span>
                  </button>
                ))
              ) : (
                <div className="p-8 text-center text-slate-500 border border-dashed border-slate-800 rounded text-[10px]">
                  NO PLANS DEPLOYED. ARCHITECT A PLAN UNDER PLANNER PAGE FIRST.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 3: Select Route */}
        {step === 3 && (
          <div className="space-y-4">
            <h3 className="text-[10px] font-bold text-slate-300 uppercase">Assign Navigation Vector Path</h3>
            <div className="space-y-2">
              {activeRoutes.length > 0 ? (
                activeRoutes.map(r => (
                  <button
                    key={r.id}
                    onClick={() => setSelectedRouteId(r.id)}
                    className={cn(
                      "w-full text-left p-3 rounded border text-[10px] font-bold flex flex-col gap-1 cursor-pointer transition",
                      selectedRouteId === r.id
                        ? "bg-cyan-500/10 border-cyan-500/40 text-cyan-400"
                        : "border-slate-850 bg-slate-950/40 text-slate-400 hover:bg-slate-900/60"
                    )}
                  >
                    <div className="flex items-center gap-2 font-extrabold uppercase">
                      <Route className="h-4 w-4" />
                      <span>{r.name}</span>
                    </div>
                    <span className="text-[8px] text-slate-500 font-normal">{r.waypoints.length} Target Waypoints loaded</span>
                  </button>
                ))
              ) : (
                <div className="p-8 text-center text-slate-500 border border-dashed border-slate-800 rounded text-[10px]">
                  NO ROUTE ASSETS LOADED. DEFINE TARGET WAYPOINTS UNDER PLANNER ROUTES.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 4: Success confirmation */}
        {step === 4 && (
          <div className="text-center py-8 space-y-4">
            <Rocket className="h-12 w-12 text-emerald-400 mx-auto animate-bounce" />
            <h3 className="text-xs font-black text-emerald-400 uppercase tracking-widest">DISPATCH ORDER ACKNOWLEDGED</h3>
            <p className="text-[10px] text-slate-400 leading-normal max-w-sm mx-auto">
              Scout unit <span className="text-white font-extrabold">{chosenScout?.name}</span> has been dispatched to execute delta routes on mission: <span className="text-white font-extrabold">{chosenMission?.name}</span>. Telemetry streams mapped to active relays.
            </p>
            <div className="pt-4 select-none">
              <Link href="/scouts" className="inline-flex items-center justify-center px-4 py-1.5 rounded border border-slate-800 bg-slate-900 text-slate-400 hover:text-white uppercase font-bold text-[10px]">
                Return to Scouts ops
              </Link>
            </div>
          </div>
        )}

        {/* Step Buttons controls */}
        {step < 4 && (
          <div className="flex justify-between pt-4 border-t border-slate-900 select-none">
            {step > 1 ? (
              <Button
                onClick={() => setStep(step - 1)}
                className="text-[10px] h-9 bg-slate-900 border border-slate-800 text-slate-450 hover:text-slate-200 cursor-pointer uppercase font-bold"
              >
                Back
              </Button>
            ) : (
              <div></div>
            )}

            {step < 3 ? (
              <Button
                disabled={isNextDisabled()}
                onClick={() => setStep(step + 1)}
                className="text-[10px] h-9 bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-bold cursor-pointer uppercase disabled:opacity-50"
              >
                Next Step
              </Button>
            ) : (
              <Button
                disabled={isNextDisabled()}
                onClick={handleLaunch}
                className="text-[10px] h-9 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black cursor-pointer uppercase disabled:opacity-50"
              >
                Initiate Launch
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

