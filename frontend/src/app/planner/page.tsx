"use client";

import { useState } from "react";
import { useMissionStore } from "@/store/mission-store";
import { Mission, MissionState, MissionObjective } from "@/domain/missions/types";
import { Button } from "@/components/ui/button";
import { Calendar, Plus, Trash2, Shield, User, Play, Archive, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export default function PlannerPage() {
  const { missions, addMission, updateMissionStatus, rovers } = useMissionStore();

  const [activeTab, setActiveTab] = useState<"ACTIVE" | "PLANNED" | "ARCHIVED">("ACTIVE");
  
  // Form States
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"LOW" | "MEDIUM" | "HIGH">("MEDIUM");
  const [duration, setDuration] = useState(48);
  const [objectives, setObjectives] = useState<{ label: string }[]>([{ label: "" }]);
  const [selectedRovers, setSelectedRovers] = useState<string[]>([]);

  const filteredMissions = missions.filter((m) => {
    if (activeTab === "ACTIVE") return m.status === "ACTIVE" || m.status === "LAUNCHED";
    if (activeTab === "PLANNED") return m.status === "PLANNED" || m.status === "READY" || m.status === "DRAFT";
    return m.status === "ARCHIVED" || m.status === "COMPLETED" || m.status === "FAILED" || m.status === "ABORTED";
  });

  const handleAddObjectiveRow = () => {
    setObjectives([...objectives, { label: "" }]);
  };

  const handleRemoveObjectiveRow = (idx: number) => {
    setObjectives(objectives.filter((_, i) => i !== idx));
  };

  const handleObjectiveChange = (idx: number, val: string) => {
    const next = [...objectives];
    next[idx].label = val;
    setObjectives(next);
  };

  const handleToggleRover = (roverId: string) => {
    if (selectedRovers.includes(roverId)) {
      setSelectedRovers(selectedRovers.filter(id => id !== roverId));
    } else {
      setSelectedRovers([...selectedRovers, roverId]);
    }
  };

  const handleCreateMission = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const formattedObjectives: MissionObjective[] = objectives
      .filter((o) => o.label.trim())
      .map((o, idx) => ({
        id: `obj-${Date.now()}-${idx}`,
        label: o.label,
        status: "PENDING" as const,
        description: o.label
      }));

    addMission({
      name,
      description,
      priority,
      duration,
      objectives: formattedObjectives,
      assignedRoverIds: selectedRovers
    });

    // Reset Form
    setName("");
    setDescription("");
    setPriority("MEDIUM");
    setDuration(48);
    setObjectives([{ label: "" }]);
    setSelectedRovers([]);
    setShowCreateForm(false);
    setActiveTab("PLANNED");
  };

  return (
    <div className="space-y-6 font-mono animate-fade-in text-slate-100">
      {/* Header */}
      <div className="p-4 rounded border border-slate-800 bg-[#111827] flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <Calendar className="h-5 w-5 text-cyan-400" />
          <div>
            <div className="text-[10px] text-slate-500 tracking-wider font-bold">MISSION ARCHITECT SUITE</div>
            <h1 className="text-sm font-black tracking-widest text-white uppercase">
              STRATEGIC_PLANNING // OPERATIONS_FLOW
            </h1>
          </div>
        </div>

        <Button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="bg-cyan-500/10 border border-cyan-500/40 text-cyan-400 hover:bg-cyan-500/20 text-[10px] font-bold h-8 flex items-center gap-1.5 uppercase cursor-pointer"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>{showCreateForm ? "Cancel Plan" : "Draft Mission"}</span>
        </Button>
      </div>

      {showCreateForm ? (
        /* Create Mission Form Panel */
        <form onSubmit={handleCreateMission} className="p-5 border border-slate-800 bg-[#111827] rounded space-y-4 shadow-md max-w-2xl mx-auto">
          <h2 className="text-xs font-bold text-cyan-400 tracking-wider uppercase border-b border-slate-800 pb-2">
            PLAN_NEW_MISSION // INITIAL_PARAMETERS
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[9px] text-slate-400 font-bold block uppercase">Mission Identifier</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Ares Delta Survey"
                className="w-full text-[11px] bg-slate-950 border border-slate-850 p-2 rounded focus:outline-none focus:border-cyan-500/40 text-slate-200"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <label className="text-[9px] text-slate-400 font-bold block uppercase">Priority Level</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                  className="w-full text-[11px] bg-slate-950 border border-slate-850 p-2 rounded focus:outline-none focus:border-cyan-500/40 text-slate-200"
                >
                  <option value="LOW">LOW</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="HIGH">HIGH</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] text-slate-400 font-bold block uppercase">Est. Sols Duration</label>
                <input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(parseInt(e.target.value) || 24)}
                  className="w-full text-[11px] bg-slate-950 border border-slate-850 p-2 rounded focus:outline-none focus:border-cyan-500/40 text-slate-200"
                  min="1"
                  required
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[9px] text-slate-400 font-bold block uppercase">Scope / Objective Briefing</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe Martian strategic targets..."
              rows={2}
              className="w-full text-[11px] bg-slate-950 border border-slate-850 p-2 rounded focus:outline-none focus:border-cyan-500/40 text-slate-200 leading-normal"
            />
          </div>

          {/* Objective builder */}
          <div className="space-y-2.5">
            <div className="flex justify-between items-center border-b border-slate-800 pb-1.5">
              <label className="text-[9px] text-slate-400 font-bold block uppercase">Tactical Sub-Objectives</label>
              <Button
                type="button"
                onClick={handleAddObjectiveRow}
                className="h-5 text-[8px] bg-slate-950 border border-slate-800 text-cyan-400 hover:bg-slate-900 cursor-pointer"
              >
                + Add Task
              </Button>
            </div>

            <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
              {objectives.map((obj, idx) => (
                <div key={idx} className="flex gap-2">
                  <input
                    type="text"
                    value={obj.label}
                    onChange={(e) => handleObjectiveChange(idx, e.target.value)}
                    placeholder={`Objective #${idx + 1}`}
                    className="flex-1 text-[11px] bg-slate-950 border border-slate-850 p-2 rounded focus:outline-none focus:border-cyan-500/40 text-slate-200"
                    required
                  />
                  {objectives.length > 1 && (
                    <Button
                      type="button"
                      onClick={() => handleRemoveObjectiveRow(idx)}
                      className="bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 h-9 px-3 shrink-0 cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Rover Fleet Assignment */}
          <div className="space-y-2">
            <label className="text-[9px] text-slate-400 font-bold block uppercase border-b border-slate-800 pb-1.5">
              Rover Fleet Node Assignments
            </label>
            <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto pr-1 pt-1">
              {rovers.map((rover) => {
                const isAssigned = selectedRovers.includes(rover.id);
                return (
                  <button
                    key={rover.id}
                    type="button"
                    onClick={() => handleToggleRover(rover.id)}
                    className={cn(
                      "text-left p-2 rounded border text-[10px] font-bold flex justify-between items-center cursor-pointer transition",
                      isAssigned
                        ? "bg-cyan-500/10 border-cyan-500/40 text-cyan-400"
                        : "border-slate-850 bg-slate-950/40 text-slate-400 hover:bg-slate-900/60"
                    )}
                  >
                    <span>{rover.name}</span>
                    <span className="text-[8px] opacity-70 uppercase font-normal">({rover.type})</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
            <Button
              type="button"
              onClick={() => setShowCreateForm(false)}
              className="text-[10px] h-9 bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 cursor-pointer uppercase"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="text-[10px] h-9 bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-bold cursor-pointer uppercase"
            >
              Initialize Mission Plan
            </Button>
          </div>
        </form>
      ) : (
        /* Planner Dashboard Tabs & List */
        <div className="space-y-4">
          <div className="flex gap-1.5 border-b border-slate-800/80 pb-0.5 text-[10px] select-none">
            {(["ACTIVE", "PLANNED", "ARCHIVED"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "px-4 py-2 border-b-2 font-bold cursor-pointer transition uppercase",
                  activeTab === tab
                    ? "border-cyan-400 text-cyan-400"
                    : "border-transparent text-slate-500 hover:text-slate-350"
                )}
              >
                {tab} PLANS
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredMissions.length > 0 ? (
              filteredMissions.map((mission) => {
                const progressPercent = Math.round(
                  (mission.objectives.filter(o => o.status === "COMPLETED").length / mission.objectives.length) * 100
                ) || 0;

                return (
                  <div key={mission.id} className="p-4 rounded border border-slate-800 bg-[#111827] flex flex-col justify-between gap-4 shadow shadow-cyan-950/20">
                    <div className="space-y-2">
                      <div className="flex justify-between items-start select-none">
                        <span className={`text-[8px] font-bold px-2 py-0.5 rounded border ${
                          mission.priority === "HIGH" ? "border-rose-500/30 bg-rose-500/10 text-rose-400" :
                          mission.priority === "MEDIUM" ? "border-amber-500/35 bg-amber-500/10 text-amber-400" :
                          "border-slate-850 bg-slate-900 text-slate-400"
                        }`}>
                          {mission.priority} PRIORITY
                        </span>
                        
                        <div className="flex items-center gap-1.5">
                          {mission.status === "PLANNED" && (
                            <Button
                              onClick={() => updateMissionStatus(mission.id, "ACTIVE", "Dispatched manually")}
                              className="h-5 text-[8px] bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 cursor-pointer font-bold uppercase"
                            >
                              Launch
                            </Button>
                          )}
                          
                          <span className="text-[8px] font-bold px-2 py-0.5 rounded border border-slate-800 bg-slate-950/40 text-slate-400 select-none">
                            {mission.status}
                          </span>
                        </div>
                      </div>

                      <h3 className="text-xs font-black tracking-wider text-white uppercase">{mission.name}</h3>
                      <p className="text-[10px] text-slate-400 leading-normal line-clamp-2">{mission.description}</p>
                    </div>

                    <div className="space-y-3 pt-3 border-t border-slate-900/60 font-mono">
                      {/* Progress meter */}
                      <div className="space-y-1 text-[9px] select-none">
                        <div className="flex justify-between text-slate-500 font-bold">
                          <span>TASKS DISPATCH:</span>
                          <span className="text-slate-350">{progressPercent}%</span>
                        </div>
                        <div className="h-1 w-full bg-slate-950 rounded-full overflow-hidden">
                          <div className="h-full bg-cyan-500" style={{ width: `${progressPercent}%` }}></div>
                        </div>
                      </div>

                      <div className="flex justify-between items-center text-[9px] text-slate-500">
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3 text-slate-600" />
                          OP: {mission.assignedOperator}
                        </span>
                        <span>DUR: {mission.duration} SOLS</span>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-2 p-12 text-center border border-dashed border-slate-800 rounded text-slate-500 text-xs">
                NO PLANNED STRATEGIC MISSION OUTLINES RECORDED
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
