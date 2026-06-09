"use client";

import { useState } from "react";
import { useMissionStore } from "@/store/mission-store";
import { MissionEvent, EventCategory, EventSeverity } from "@/domain/events/types";
import { List, Filter, Bell, Info as InfoIcon, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";

export default function EventsPage() {
  const { events } = useMissionStore();

  const [selectedEventId, setSelectedEventId] = useState<string | null>(events[0]?.id || null);
  const [severityFilter, setSeverityFilter] = useState<"ALL" | EventSeverity>("ALL");
  const [categoryFilter, setCategoryFilter] = useState<"ALL" | EventCategory>("ALL");

  const selectedEvent = events.find(e => e.id === selectedEventId);

  // Apply filters
  const filteredEvents = events.filter((e) => {
    const matchesSev = severityFilter === "ALL" || e.severity === severityFilter;
    const matchesCat = categoryFilter === "ALL" || e.category === categoryFilter;
    return matchesSev && matchesCat;
  });

  const getSeverityClass = (sev: EventSeverity) => {
    switch (sev) {
      case "CRITICAL":
        return "text-rose-400 border-rose-500/25 bg-rose-500/5";
      case "WARNING":
        return "text-amber-400 border-amber-500/20 bg-amber-500/5";
      case "INFO":
      default:
        return "text-emerald-400 border-emerald-500/25 bg-emerald-500/5";
    }
  };

  return (
    <div className="space-y-6 font-mono text-slate-100 animate-fade-in">
      {/* Page Header */}
      <div className="p-4 rounded border border-slate-800 bg-[#111827] flex items-center justify-between shadow-lg select-none">
        <div className="flex items-center gap-3">
          <List className="h-5 w-5 text-cyan-400" />
          <div>
            <div className="text-[10px] text-slate-500 tracking-wider font-bold">MISSION CONSOLE LOGS</div>
            <h1 className="text-sm font-black tracking-widest text-white uppercase">
              EVENT_COCKPIT // REAL_TIME_STREAM
            </h1>
          </div>
        </div>
        <div className="text-[10px] text-slate-500 uppercase font-bold">
          TOTAL_LOGS: {events.length}
        </div>
      </div>

      {/* Filter panel */}
      <div className="p-4 rounded border border-slate-800 bg-[#111827] flex flex-col sm:flex-row gap-4 justify-between items-center shadow-md select-none">
        <div className="flex flex-wrap items-center gap-4 text-[10px]">
          {/* Severity */}
          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-bold uppercase">SEVERITY:</span>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value as any)}
              className="bg-slate-950 border border-slate-800 text-slate-350 p-1.5 rounded focus:outline-none font-bold"
            >
              <option value="ALL">ALL SEVERITIES</option>
              <option value="INFO">INFO</option>
              <option value="WARNING">WARNING</option>
              <option value="CRITICAL">CRITICAL</option>
            </select>
          </div>

          {/* Category */}
          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-bold uppercase">CATEGORY:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as any)}
              className="bg-slate-950 border border-slate-800 text-slate-350 p-1.5 rounded focus:outline-none font-bold"
            >
              <option value="ALL">ALL CATEGORIES</option>
              <option value="MISSION">MISSION</option>
              <option value="ROVER">ROVER</option>
              <option value="SCOUT">SCOUT</option>
              <option value="COMMS">COMMS</option>
              <option value="SYSTEM">SYSTEM</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main split dashboard */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-stretch">
        
        {/* Logs terminal box (takes 3 cols) */}
        <div className="xl:col-span-3 border border-slate-800 bg-[#111827] rounded flex flex-col h-[500px] overflow-hidden shadow-md">
          {/* Scanline CRT overlay */}
          <div className="crt-monitor relative flex-1 flex flex-col overflow-hidden bg-[#060913]">
            <div className="crt-scanline"></div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-2 text-[10px] leading-relaxed select-text font-mono">
              {filteredEvents.length > 0 ? (
                filteredEvents.map((evt) => (
                  <div
                    key={evt.id}
                    onClick={() => setSelectedEventId(evt.id)}
                    className={cn(
                      "flex gap-3 hover:bg-slate-900/30 py-1 transition rounded px-2 cursor-pointer border",
                      selectedEventId === evt.id
                        ? "bg-slate-900/50 border-cyan-500/20 text-cyan-400"
                        : "border-transparent text-slate-400"
                    )}
                  >
                    <span className="text-slate-600 select-none tabular-nums shrink-0">{evt.timestamp}</span>
                    <span className={cn(
                      "font-bold select-none shrink-0 w-8 truncate uppercase",
                      evt.severity === "CRITICAL" ? "text-rose-500" :
                      evt.severity === "WARNING" ? "text-amber-500" :
                      "text-emerald-500"
                    )}>
                      [{evt.category}]
                    </span>
                    <span className="text-slate-300 flex-1 truncate">{evt.description}</span>
                  </div>
                ))
              ) : (
                <div className="h-full flex items-center justify-center text-slate-600 font-bold select-none">
                  NO LOG ENTRIES COMPATIBLE WITH ACTIVE CONSOLE FILTERS
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Event details panel sidebar (1 col) */}
        <div className="xl:col-span-1 h-full">
          <div className="p-4 border border-slate-800 bg-[#111827] rounded shadow-md h-[500px] flex flex-col justify-between">
            <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
              <h3 className="text-xs font-bold text-slate-450 tracking-wider flex items-center gap-1.5 uppercase select-none border-b border-slate-900 pb-2">
                <Bell className="h-4 w-4 text-cyan-400 animate-status-pulse" />
                LOG_EXAMINER
              </h3>

              {selectedEvent ? (
                <div className="space-y-3.5 text-[10px] text-slate-300 overflow-y-auto pr-1 flex-1">
                  <div className="space-y-1">
                    <span className="text-slate-500 font-bold uppercase block">Timestamp</span>
                    <span className="font-extrabold text-slate-100 tabular-nums">{selectedEvent.timestamp}</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-slate-500 font-bold uppercase block">Source Node</span>
                    <span className="font-extrabold text-slate-200 uppercase">{selectedEvent.source}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <span className="text-slate-500 font-bold uppercase block">Category</span>
                      <span className="font-bold text-cyan-400 uppercase">{selectedEvent.category}</span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-slate-500 font-bold uppercase block">Severity</span>
                      <span className={cn("font-bold px-1.5 py-0.2 rounded border uppercase text-[8px] max-w-fit select-none", getSeverityClass(selectedEvent.severity))}>
                        {selectedEvent.severity}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-1 border-t border-slate-900 pt-3">
                    <span className="text-slate-500 font-bold uppercase block">Description Log</span>
                    <p className="text-slate-200 leading-normal text-[11px] font-medium break-words">
                      {selectedEvent.description}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center text-slate-650 text-[10px] leading-relaxed border border-dashed border-slate-850 rounded p-4">
                  <InfoIcon className="h-5 w-5 text-slate-700 mb-1.5" />
                  SELECT AN EVENT STREAM ENTRY ON THE LEFT PANEL TO REVIEW DRILL-DOWN PARAMETERS
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
