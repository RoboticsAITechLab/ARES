"use client";

import { Sliders, SunMoon, Grid, Settings2, ShieldCheck, Heart } from "lucide-react";
import { useMissionStore } from "@/store/mission-store";

export default function SettingsPage() {
  const {
    layoutDensity,
    setLayoutDensity,
    theme,
    setTheme,
    simulationConfig,
    setSimulationSpeed,
  } = useMissionStore();

  const themes = [
    { id: "dark", name: "STANDARD DARK", desc: "Default DSN Command Blue & Cyan", accent: "bg-cyan-500" },
    { id: "mars", name: "MARS DIRECTIVE", desc: "Rusty Red & Orange High Contrast", accent: "bg-red-500" },
    { id: "matrix", name: "MATRIX COCKPIT", desc: "Phosphor Cyber-Green Terminal", accent: "bg-emerald-500" },
  ] as const;

  const densities = [
    { id: "comfortable", name: "COMFORTABLE", desc: "Spacious layout with standard margins, ideal for dual monitors" },
    { id: "compact", name: "COMPACT CORE", desc: "Tighter spacing for data-dense diagnostics on single viewports" },
  ] as const;

  const simSpeeds = [
    { id: "SLOW", name: "SLOW REFRESH", interval: "5.0s refresh cycle", desc: "Low orbital telemetry sync frequency" },
    { id: "NORMAL", name: "NORMAL TICK", interval: "2.0s refresh cycle", desc: "Standard flight ops sync frequency" },
    { id: "FAST", name: "FAST STREAM", interval: "0.5s refresh cycle", desc: "High-speed scientific data logging stream" },
  ] as const;

  return (
    <div className="space-y-6 font-mono select-none animate-fade-in max-w-4xl mx-auto">
      {/* Page Header */}
      <div className="p-4 rounded border border-slate-800 bg-[#111827] flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <Sliders className="h-5 w-5 text-cyan-400 animate-status-pulse" />
          <div>
            <div className="text-[10px] text-slate-500 tracking-wider font-bold">FLIGHT HUB CONFIGURATION</div>
            <h1 className="text-sm font-black text-white tracking-widest uppercase">
              SETTINGS // GROUND_OPS_PREFERENCES
            </h1>
          </div>
        </div>
        <div className="text-[10px] text-slate-500 uppercase font-bold">
          SYS CONFIG: SAVED
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Color Theme Selector */}
        <div className="p-5 border border-slate-800 bg-[#0C1222]/80 rounded shadow-md space-y-4 relative cyber-card">
          <div className="flex items-center gap-2 border-b border-slate-800/80 pb-3">
            <SunMoon className="h-4 w-4 text-cyan-400" />
            <h2 className="text-xs font-bold text-white tracking-widest uppercase">
              VISUAL COMMS THEME
            </h2>
          </div>
          <p className="text-[10px] text-slate-400 leading-normal">
            Adjust the color spectrum filter of all telemetry feeds, widgets, and orbital vector models.
          </p>

          <div className="space-y-3 pt-2">
            {themes.map((t) => (
              <button
                key={t.id}
                onClick={() => setTheme(t.id)}
                className={`w-full text-left p-3.5 rounded border transition flex items-center justify-between cursor-pointer ${
                  theme === t.id
                    ? "bg-[#111827] border-cyan-500/50 shadow-[0_0_10px_rgba(6,182,212,0.05)]"
                    : "border-slate-850 hover:bg-slate-900/30 hover:border-slate-800"
                }`}
              >
                <div>
                  <div className="text-xs font-bold text-white tracking-wider uppercase">{t.name}</div>
                  <div className="text-[9px] text-slate-500 mt-0.5">{t.desc}</div>
                </div>
                <div className={`h-3 w-3 rounded-full ${t.accent} ring-2 ring-slate-950`}></div>
              </button>
            ))}
          </div>
        </div>

        {/* Layout Density Selector */}
        <div className="p-5 border border-slate-800 bg-[#0C1222]/80 rounded shadow-md space-y-4 relative cyber-card">
          <div className="flex items-center gap-2 border-b border-slate-800/80 pb-3">
            <Grid className="h-4 w-4 text-cyan-400" />
            <h2 className="text-xs font-bold text-white tracking-widest uppercase">
              GRID DENSITY
            </h2>
          </div>
          <p className="text-[10px] text-slate-400 leading-normal">
            Compress page spacing, margins, and padding for optimal visualization across specific device screen sizes.
          </p>

          <div className="space-y-3 pt-2">
            {densities.map((d) => (
              <button
                key={d.id}
                onClick={() => setLayoutDensity(d.id)}
                className={`w-full text-left p-3.5 rounded border transition flex flex-col cursor-pointer ${
                  layoutDensity === d.id
                    ? "bg-[#111827] border-cyan-500/50 shadow-[0_0_10px_rgba(6,182,212,0.05)]"
                    : "border-slate-850 hover:bg-slate-900/30 hover:border-slate-800"
                }`}
              >
                <div className="text-xs font-bold text-white tracking-wider uppercase">{d.name}</div>
                <div className="text-[9px] text-slate-500 mt-1 leading-normal">{d.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Simulation Ticker configs */}
        <div className="p-5 border border-slate-800 bg-[#0C1222]/80 rounded shadow-md space-y-4 relative md:col-span-2 cyber-card">
          <div className="flex items-center gap-2 border-b border-slate-800/80 pb-3">
            <Settings2 className="h-4 w-4 text-cyan-400" />
            <h2 className="text-xs font-bold text-white tracking-widest uppercase">
              ORBITAL SIMULATOR FREQUENCY
            </h2>
          </div>
          <p className="text-[10px] text-slate-400 leading-normal">
            Configure the simulation refresh cycles that advance rover telemetry, drain core power batteries, fluctuate antenna signals, and check off mission routing objectives.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            {simSpeeds.map((s) => (
              <button
                key={s.id}
                onClick={() => setSimulationSpeed(s.id)}
                className={`text-left p-3.5 rounded border transition flex flex-col justify-between cursor-pointer ${
                  simulationConfig.speed === s.id
                    ? "bg-[#111827] border-cyan-500/50 shadow-[0_0_10px_rgba(6,182,212,0.05)]"
                    : "border-slate-850 hover:bg-slate-900/30 hover:border-slate-800"
                }`}
              >
                <div>
                  <div className="text-xs font-extrabold text-white tracking-wider uppercase">{s.name}</div>
                  <div className="text-[8px] text-cyan-400 font-bold mt-0.5">{s.interval}</div>
                </div>
                <div className="text-[9px] text-slate-500 mt-2 leading-normal">{s.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Information Panel */}
        <div className="md:col-span-2 p-4 rounded border border-cyan-500/25 bg-cyan-500/5 text-cyan-300 text-[10px] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-4 w-4 text-cyan-400 shrink-0" />
            <div>
              <span className="font-extrabold uppercase">LOCAL PREFERENCES CONFIGURED</span>
              <p className="text-[9px] text-slate-400 mt-0.5">
                All selections are saved client-side and dynamically applied to the ground operations dashboard shell in real-time.
              </p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 bg-slate-950/80 border border-slate-800 rounded font-extrabold text-[8px] text-slate-400 uppercase">
            <Heart className="h-3 w-3 text-cyan-400" />
            ARES_CORE_V2.1.0
          </div>
        </div>
      </div>
    </div>
  );
}
