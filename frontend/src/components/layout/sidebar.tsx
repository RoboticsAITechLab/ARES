"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Map, Activity, ExternalLink, ShieldAlert, Wifi, Layers } from "lucide-react";
import { MISSION_INFO, MISSION_METRICS } from "@/lib/constants";
import { cn } from "@/lib/utils";

const iconMap = {
  LayoutDashboard: LayoutDashboard,
  Map: Map,
  Activity: Activity,
};

export default function Sidebar() {
  const pathname = usePathname();

  const links = [
    { name: "Mission Control", path: "/mission-control", icon: "LayoutDashboard" },
    { name: "Live Map", path: "/live-map", icon: "Map" },
    { name: "Telemetry", path: "/telemetry", icon: "Activity" },
  ];

  const getContextMetadata = () => {
    switch (pathname) {
      case "/live-map":
        return (
          <>
            <div className="flex justify-between">
              <span className="text-slate-500">ACTIVE SECTOR:</span>
              <span className="text-slate-200 font-semibold">SEC-05</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">COVERAGE AREA:</span>
              <span className="text-cyan-300 font-semibold">{MISSION_METRICS.areaExplored}%</span>
            </div>
            <div className="flex justify-between border-t border-slate-900/60 pt-2 mt-1">
              <span className="text-slate-500">HAZARDS DETECTED:</span>
              <span className="text-rose-400 font-bold">{MISSION_METRICS.hazardsDetected} ACTIVE</span>
            </div>
          </>
        );
      case "/telemetry":
        return (
          <>
            <div className="flex justify-between">
              <span className="text-slate-500">SYSTEM HEALTH:</span>
              <span className="text-slate-200 font-semibold">{MISSION_METRICS.fleetHealth}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">DSN LINK:</span>
              <span className="text-emerald-400 font-bold">{MISSION_METRICS.commsStatus}</span>
            </div>
            <div className="flex justify-between border-t border-slate-900/60 pt-2 mt-1">
              <span className="text-slate-500">ACTIVE ALERTS:</span>
              <span className="text-amber-400 font-bold">{MISSION_METRICS.activeAlertsCount} ACTIVE</span>
            </div>
          </>
        );
      case "/mission-control":
      default:
        return (
          <>
            <div className="flex justify-between">
              <span className="text-slate-500">MISSION ID:</span>
              <span className="text-slate-200 font-semibold">{MISSION_INFO.id}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-slate-500">CURRENT PHASE:</span>
              <span className="text-cyan-300 font-semibold text-[9px] uppercase mt-0.5 max-w-full truncate" title={MISSION_INFO.phaseLabel}>
                {MISSION_INFO.phase}
              </span>
            </div>
            <div className="flex justify-between pt-1 border-t border-slate-900/60">
              <span className="text-slate-500">FLEET HEALTH:</span>
              <span className="text-emerald-400 font-bold">{MISSION_METRICS.fleetHealth}%</span>
            </div>
            <div className="h-1 w-full bg-slate-900 rounded-full overflow-hidden">
              <div 
                className="h-full bg-emerald-500" 
                style={{ width: `${MISSION_METRICS.fleetHealth}%` }}
              ></div>
            </div>
          </>
        );
    }
  };

  return (
    <aside className="w-64 border-r border-slate-800 bg-[#0A0F1C] flex flex-col h-full shrink-0 select-none">
      {/* Brand Header */}
      <div className="h-16 border-b border-slate-800 px-5 flex items-center gap-3">
        <div className="flex h-2.5 w-2.5 rounded-full bg-cyan-500"></div>
        <div className="flex flex-col font-mono">
          <span className="text-[10px] text-slate-500 tracking-wider font-bold">OPERATIONS CENTER</span>
          <span className="text-sm font-bold tracking-widest text-white">{MISSION_INFO.name}</span>
        </div>
      </div>

      {/* Mission Meta Panel (Context-Aware) */}
      <div className="p-5 border-b border-slate-800/80 bg-slate-950/40 font-mono space-y-3">
        <div className="flex items-center gap-1.5 text-[9px] text-cyan-400 font-bold tracking-widest uppercase">
          <Layers className="h-3.5 w-3.5" />
          <span>CONTEXT_METADATA</span>
        </div>
        
        <div className="space-y-2 text-[10px]">
          {getContextMetadata()}
        </div>
      </div>

      {/* Navigation Links - Opens in NEW TAB */}
      <nav className="flex-1 px-4 py-6 space-y-1">
        <div className="px-3 pb-2 text-[9px] font-mono text-slate-500 tracking-widest uppercase">
          OPERATIONAL INTERFACES
        </div>
        {links.map((link) => {
          const IconComponent = iconMap[link.icon as keyof typeof iconMap];
          const isActive = pathname === link.path;

          return (
            <Link
              key={link.path}
              href={link.path}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "flex items-center justify-between px-3 py-2.5 rounded border font-mono text-xs transition-all duration-150 group cursor-pointer",
                isActive
                  ? "bg-[#111827] text-cyan-400 border-cyan-500/30 font-semibold shadow-[0_0_10px_rgba(6,182,212,0.03)]"
                  : "text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-900/30 hover:border-slate-800"
              )}
            >
              <div className="flex items-center gap-3">
                {IconComponent && <IconComponent className={cn("h-4.5 w-4.5", isActive ? "text-cyan-400" : "text-slate-400")} />}
                <span>{link.name.toUpperCase()}</span>
              </div>
              <ExternalLink className="h-3 w-3 text-slate-500 opacity-60 group-hover:opacity-100 group-hover:text-cyan-400 transition" />
            </Link>
          );
        })}
      </nav>

      {/* Bottom Status Block */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/20 font-mono text-[9px] space-y-2 text-slate-500">
        <div className="flex justify-between items-center">
          <span>DSN RELAY</span>
          <span className="text-emerald-400 font-bold flex items-center gap-1">
            <Wifi className="h-3 w-3" />
            {MISSION_METRICS.commsStatus}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span>ALERTS TALLY</span>
          {MISSION_METRICS.activeAlertsCount > 0 ? (
            <span className="text-amber-400 font-bold flex items-center gap-1">
              <ShieldAlert className="h-3 w-3" />
              {MISSION_METRICS.activeAlertsCount} ACTIVE
            </span>
          ) : (
            <span className="text-slate-500 font-bold">0 ACTIVE</span>
          )}
        </div>
        <div className="flex justify-between items-center border-t border-slate-900/60 pt-2 mt-1">
          <span>SYS STATUS</span>
          <span className="text-cyan-400 font-bold">OPERATIONAL</span>
        </div>
      </div>
    </aside>
  );
}
