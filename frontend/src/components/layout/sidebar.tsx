"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Calendar, 
  Cpu, 
  Map, 
  Activity, 
  List, 
  Radio, 
  Settings, 
  Sliders, 
  Layers, 
  ChevronRight, 
  Wifi, 
  ShieldAlert 
} from "lucide-react";
import { MISSION_INFO } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useMissionStore } from "@/store/mission-store";
import { useConnectionStore } from "@/store/connection-store";

const iconMap = {
  LayoutDashboard,
  Calendar,
  Cpu,
  Map,
  Activity,
  List,
  Radio,
  Settings,
  Sliders
};

export default function Sidebar() {
  const pathname = usePathname();
  const { isSidebarOpen, setSidebarOpen, fleet, events, systemHealth, theme, layoutDensity } = useMissionStore();
  const { connectionStatus } = useConnectionStore();


  useEffect(() => {
    if (typeof window !== "undefined") {
      const root = window.document.documentElement;
      root.classList.remove("theme-dark", "theme-mars", "theme-matrix", "density-comfortable", "density-compact");
      root.classList.add(`theme-${theme}`);
      root.classList.add(`density-${layoutDensity}`);
    }
  }, [theme, layoutDensity]);
  
  const links = [
    { name: "Mission Control", path: "/mission-control", icon: "LayoutDashboard" },
    { name: "Live Map", path: "/map", icon: "Map" },
    { name: "Telemetry", path: "/telemetry", icon: "Activity" }
  ];

  const motherRover = fleet.mother;
  const activeAlertsCount = events.filter(a => a.severity === "CRITICAL" || a.severity === "WARNING").length;

  const getContextMetadata = () => {
    switch (pathname) {
      case "/map":
        return (
          <>
            <div className="flex justify-between">
              <span className="text-slate-500 font-semibold uppercase">ACTIVE SECTOR:</span>
              <span className="text-slate-200 font-extrabold">SEC-05</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-semibold uppercase">COVERAGE AREA:</span>
              <span className="text-cyan-400 font-extrabold">34.20%</span>
            </div>
            <div className="flex justify-between border-t border-slate-900/60 pt-2 mt-1">
              <span className="text-slate-500 font-semibold uppercase">HAZARDS SECTOR:</span>
              <span className="text-rose-500 font-extrabold animate-pulse">6 ACTIVE</span>
            </div>
          </>
        );
      case "/telemetry":
        return (
          <>
            <div className="flex justify-between">
              <span className="text-slate-500 font-semibold uppercase">SYSTEM HEALTH:</span>
              <span className="text-slate-200 font-extrabold">91%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-semibold uppercase">DSN LINK:</span>
              <span className="text-emerald-400 font-extrabold uppercase animate-glow">{systemHealth.telemetryFeed}</span>
            </div>
            <div className="flex justify-between border-t border-slate-900/60 pt-2 mt-1">
              <span className="text-slate-500 font-semibold uppercase">ACTIVE ALERTS:</span>
              <span className="text-amber-500 font-extrabold">{activeAlertsCount} ACTIVE</span>
            </div>
          </>
        );
      case "/mission-control":
      default:
        return (
          <>
            <div className="flex justify-between">
              <span className="text-slate-500 font-semibold uppercase">MISSION ID:</span>
              <span className="text-slate-200 font-extrabold">{MISSION_INFO.id}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-slate-500 font-semibold uppercase">CURRENT PHASE:</span>
              <span className="text-cyan-400 font-extrabold text-[9px] uppercase mt-0.5 truncate" title={MISSION_INFO.phaseLabel}>
                {MISSION_INFO.phase}
              </span>
            </div>
            <div className="flex justify-between pt-1 border-t border-slate-900/60">
              <span className="text-slate-500 font-semibold uppercase">FLEET HEALTH:</span>
              <span className={motherRover ? "text-emerald-400 font-extrabold" : "text-rose-500 font-bold"}>
                {motherRover ? `${motherRover.battery}%` : "OFFLINE"}
              </span>
            </div>
            <div className="h-1 w-full bg-slate-900 rounded-full overflow-hidden">
              <div 
                className="h-full bg-emerald-500 animate-pulse" 
                style={{ width: motherRover ? `${motherRover.battery}%` : "0%" }}
              ></div>
            </div>
          </>
        );
    }
  };

  return (
    <>
      {/* Mobile Backdrop blur overlay */}
      {isSidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)} 
          className="fixed inset-0 bg-[#050811]/80 backdrop-blur-xs z-40 md:hidden transition-opacity duration-300"
        />
      )}

      <aside className={cn(
        "w-64 border-r border-slate-800 bg-[#0A0F1C] flex flex-col h-full shrink-0 select-none transition-transform duration-300 z-50",
        "fixed md:relative inset-y-0 left-0",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        {/* Brand Header */}
        <div className="h-16 border-b border-slate-800 px-5 flex items-center gap-3">
          <div className="flex h-2.5 w-2.5 rounded-full bg-cyan-500 animate-status-pulse"></div>
          <div className="flex flex-col font-mono">
            <span className="text-[10px] text-slate-500 tracking-wider font-bold">OPERATIONS CENTER</span>
            <span className="text-sm font-black tracking-widest text-white">{MISSION_INFO.name}</span>
          </div>
        </div>

        {/* Mission Meta Panel (Context-Aware) */}
        <div className="p-5 border-b border-slate-800 bg-slate-950/40 font-mono space-y-3">
          <div className="flex items-center gap-1.5 text-[9px] text-cyan-400 font-bold tracking-widest uppercase">
            <Layers className="h-3.5 w-3.5 text-cyan-400" />
            <span>CONTEXT_METADATA</span>
          </div>
          
          <div className="space-y-2 text-[10px]">
            {getContextMetadata()}
          </div>
        </div>

        {/* Navigation Links - SPA Mode */}
        <nav className="flex-1 px-4 py-4 space-y-0.5 font-mono overflow-y-auto">
          <div className="px-3 pb-2 text-[9px] text-slate-500 tracking-widest uppercase font-bold">
            OPERATIONAL INTERFACES
          </div>
          {links.map((link) => {
            const IconComponent = iconMap[link.icon as keyof typeof iconMap];
            const isActive = pathname === link.path || pathname?.startsWith(link.path + "/");

            return (
              <Link
                key={link.path}
                href={link.path}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center justify-between px-3 py-2 rounded border text-xs transition-all duration-150 group cursor-pointer",
                  isActive
                    ? "bg-[#111827] text-cyan-400 border-cyan-500/40 font-extrabold shadow-[0_0_15px_rgba(6,182,212,0.04)]"
                    : "text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-900/30 hover:border-slate-800"
                )}
              >
                <div className="flex items-center gap-3">
                  {IconComponent && <IconComponent className={cn("h-4 w-4", isActive ? "text-cyan-400" : "text-slate-400")} />}
                  <span className="tracking-wider text-[11px]">{link.name.toUpperCase()}</span>
                </div>
                <ChevronRight className={cn("h-3 w-3 transition-transform duration-150 text-slate-500 group-hover:text-cyan-400", isActive && "text-cyan-400 translate-x-0.5")} />
              </Link>
            );
          })}
        </nav>

        {/* Bottom Status Block */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/20 font-mono text-[9px] space-y-2 text-slate-500">
          <div className="flex justify-between items-center">
            <span>DSN RELAY</span>
            <span className={cn(
              "font-bold flex items-center gap-1 animate-glow",
              connectionStatus === "connected" ? "text-emerald-400" :
              connectionStatus === "connecting" ? "text-amber-400 animate-pulse" : "text-rose-500"
            )}>
              <Wifi className="h-3 w-3" />
              {connectionStatus.toUpperCase()}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span>ALERTS TALLY</span>
            {activeAlertsCount > 0 ? (
              <span className="text-amber-400 font-bold flex items-center gap-1">
                <ShieldAlert className="h-3 w-3 animate-status-pulse" />
                {activeAlertsCount} ACTIVE
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
    </>
  );
}
