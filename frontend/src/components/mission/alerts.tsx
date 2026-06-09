"use client";

import { useState } from "react";
import { AlertCircle, AlertTriangle, CheckCircle, Bell } from "lucide-react";
import { useMissionStore } from "@/store/mission-store";

export default function Alerts() {
  const [filter, setFilter] = useState<"all" | "critical" | "warning" | "nominal">("all");
  const { events } = useMissionStore();

  const filteredAlerts = events.filter((event) => {
    if (filter === "all") return true;
    if (filter === "critical") return event.severity === "CRITICAL";
    if (filter === "warning") return event.severity === "WARNING";
    if (filter === "nominal") return event.severity === "INFO";
    return true;
  });

  const getSeverityIcon = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "critical":
        return <AlertCircle className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />;
      default:
        return <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />;
    }
  };

  const getSeverityClass = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "critical":
        return "border-rose-500/25 bg-rose-500/5 text-rose-200";
      case "warning":
        return "border-amber-500/20 bg-amber-500/5 text-amber-200";
      default:
        return "border-slate-800 bg-[#111827]/40 text-slate-300";
    }
  };

  return (
    <div className="space-y-4 flex flex-col h-full font-mono">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-semibold text-slate-400 tracking-wider flex items-center gap-1.5 uppercase">
          <Bell className="h-3.5 w-3.5 text-cyan-400" />
          DSN_ALERT_TIMELINE // STATUS_LOGS
        </h2>
        <span className="text-[9px] text-slate-500 uppercase tracking-widest bg-slate-900 border border-slate-800 px-2 py-0.5 rounded">
          LIVE FEED
        </span>
      </div>

      {/* Filter Buttons */}
      <div className="flex gap-1 border border-slate-800 bg-[#111827] p-1 rounded text-[9px]">
        {["all", "critical", "warning", "nominal"].map((level) => (
          <button
            key={level}
            onClick={() => setFilter(level as any)}
            className={`flex-1 py-1 rounded transition text-center uppercase tracking-wider font-semibold cursor-pointer ${
              filter === level
                ? "bg-slate-800 text-cyan-400 font-bold"
                : "text-slate-500 hover:text-slate-300"
            }`}
          >
            {level}
          </button>
        ))}
      </div>

      {/* Alerts List */}
      <div className="flex-1 overflow-y-auto space-y-2 max-h-[300px] pr-1">
        {filteredAlerts.length > 0 ? (
          filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-3 rounded border text-xs flex gap-2.5 transition duration-150 ${getSeverityClass(
                alert.severity
              )}`}
            >
              {getSeverityIcon(alert.severity)}
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-[8px] text-slate-500 font-bold uppercase tracking-wider">
                  <span>{alert.source}</span>
                  <span>•</span>
                  <span>{alert.timestamp}</span>
                  <span>•</span>
                  <span className={alert.severity === "CRITICAL" ? "text-rose-500" : alert.severity === "WARNING" ? "text-amber-500" : "text-emerald-500"}>
                    {alert.severity}
                  </span>
                </div>
                <p className="text-[10px] text-slate-300 leading-normal">{alert.description}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="h-28 flex flex-col items-center justify-center border border-dashed border-slate-800 rounded text-slate-500 text-xs">
            NO ACTIVE WARNING SEGMENTS DETECTED
          </div>
        )}
      </div>
    </div>
  );
}
