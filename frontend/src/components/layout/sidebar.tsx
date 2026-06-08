"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Map, Activity, ShieldAlert, Cpu } from "lucide-react";
import { MISSION_INFO } from "@/lib/constants";
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

  return (
    <aside className="w-64 border-r border-slate-800 bg-[#0A0F1C] flex flex-col h-full shrink-0 select-none">
      {/* Brand Header */}
      <div className="h-16 border-b border-slate-800 px-6 flex items-center gap-3">
        <div className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
        </div>
        <div className="flex flex-col">
          <span className="font-mono text-xs text-slate-500 tracking-wider font-bold">SYSTEM CONTROL</span>
          <span className="font-mono text-sm font-semibold tracking-widest text-white">{MISSION_INFO.name}</span>
        </div>
      </div>

      {/* Target Marker */}
      <div className="px-6 py-4 bg-slate-950/40 border-b border-slate-900/60">
        <div className="flex items-center gap-2 text-[10px] font-mono text-cyan-400 tracking-widest uppercase">
          <Cpu className="h-3.5 w-3.5" />
          <span>LOCATION TARGET</span>
        </div>
        <div className="font-mono text-xs text-slate-300 mt-1 font-semibold truncate">
          {MISSION_INFO.target}
        </div>
        <div className="font-mono text-[10px] text-slate-500 mt-0.5">
          SOL {MISSION_INFO.sol} // MET SYNCED
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-6 space-y-1.5">
        <div className="px-3 pb-2 text-[10px] font-mono text-slate-500 tracking-widest uppercase">
          OPERATIONAL VIEWS
        </div>
        {links.map((link) => {
          const IconComponent = iconMap[link.icon as keyof typeof iconMap];
          const isActive = pathname === link.path;

          return (
            <Link
              key={link.path}
              href={link.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-md font-mono text-xs transition-all duration-200 border",
                isActive
                  ? "bg-[#111827] text-cyan-400 border-cyan-500/30 shadow-[0_0_10px_rgba(6,182,212,0.05)] font-semibold"
                  : "text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-900/40 hover:border-slate-800"
              )}
            >
              {IconComponent && <IconComponent className={cn("h-4.5 w-4.5", isActive ? "text-cyan-400" : "text-slate-400")} />}
              <span>{link.name.toUpperCase()}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Status Block */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/20 font-mono text-[10px] space-y-2 text-slate-500">
        <div className="flex justify-between items-center">
          <span>COMMS LINK</span>
          <span className="text-emerald-400 font-semibold">SECURE // ON</span>
        </div>
        <div className="flex justify-between items-center">
          <span>DSN STATION</span>
          <span className="text-slate-400 truncate max-w-[120px]" title={MISSION_INFO.groundStation}>
            DSN-43
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span>UI STATUS</span>
          <span className="text-cyan-400 font-semibold">SYS_NOMINAL</span>
        </div>
      </div>
    </aside>
  );
}
