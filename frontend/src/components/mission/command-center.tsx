"use client";

import { Play, ShieldAlert, Send, CornerDownLeft, Sliders, Radio } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CommandCenter() {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="font-mono text-xs font-semibold text-slate-400 tracking-wider flex items-center gap-1.5">
          <Sliders className="h-3.5 w-3.5 text-cyan-400" />
          DIRECTIVES_PANEL // MANUAL_INTERRUPT
        </h2>
        <span className="font-mono text-[9px] text-slate-500 uppercase tracking-widest bg-slate-900 border border-slate-800 px-2 py-0.5 rounded">
          STATUS: ONLINE
        </span>
      </div>

      <div className="p-4 rounded border border-slate-800 bg-[#111827] space-y-4 font-mono">
        {/* Scout Mobility Controls */}
        <div>
          <div className="text-[9px] text-slate-500 mb-2 uppercase tracking-widest font-bold">
            SCOUT DISPATCH / RECOVERY DIRECTIVES
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              className="text-[10px] h-9 border-slate-800 bg-slate-900/60 text-slate-300 hover:text-cyan-400 hover:border-cyan-500/30 hover:bg-slate-950 font-mono flex items-center justify-center gap-1.5 cursor-pointer uppercase tracking-wider"
            >
              <Send className="h-3 w-3 text-cyan-500" />
              <span>DEPLOY SCOUT 1</span>
            </Button>
            <Button
              variant="outline"
              className="text-[10px] h-9 border-slate-800 bg-slate-900/60 text-slate-300 hover:text-cyan-400 hover:border-cyan-500/30 hover:bg-slate-950 font-mono flex items-center justify-center gap-1.5 cursor-pointer uppercase tracking-wider"
            >
              <Send className="h-3 w-3 text-cyan-500" />
              <span>DEPLOY SCOUT 2</span>
            </Button>
            <Button
              variant="outline"
              className="text-[10px] h-9 border-slate-800 bg-slate-900/60 text-slate-300 hover:text-cyan-400 hover:border-cyan-500/30 hover:bg-slate-950 font-mono flex items-center justify-center gap-1.5 cursor-pointer uppercase tracking-wider"
            >
              <CornerDownLeft className="h-3 w-3 text-slate-400" />
              <span>RECALL SCOUT 1</span>
            </Button>
            <Button
              variant="outline"
              className="text-[10px] h-9 border-slate-800 bg-slate-900/60 text-slate-300 hover:text-cyan-400 hover:border-cyan-500/30 hover:bg-slate-950 font-mono flex items-center justify-center gap-1.5 cursor-pointer uppercase tracking-wider"
            >
              <CornerDownLeft className="h-3 w-3 text-slate-400" />
              <span>RECALL SCOUT 2</span>
            </Button>
          </div>
        </div>

        {/* Global Mission Commands */}
        <div>
          <div className="text-[9px] text-slate-500 mb-2 uppercase tracking-widest font-bold">
            MISSION TIMELINE OVERRIDES
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              className="text-[10px] h-10 border-emerald-950 bg-emerald-950/20 text-emerald-400 hover:bg-emerald-950/40 hover:text-emerald-300 hover:border-emerald-500/40 font-mono flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider font-bold"
            >
              <Play className="h-3.5 w-3.5" />
              <span>START MISSION</span>
            </Button>
            <Button
              variant="outline"
              className="text-[10px] h-10 border-rose-950 bg-rose-950/20 text-rose-400 hover:bg-rose-950/40 hover:text-rose-300 hover:border-rose-500/40 font-mono flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider font-bold"
            >
              <ShieldAlert className="h-3.5 w-3.5" />
              <span>ABORT MISSION</span>
            </Button>
          </div>
        </div>

        {/* Console footer metadata */}
        <div className="text-[8px] text-slate-500 border-t border-slate-800/80 pt-2 flex justify-between items-center">
          <span className="flex items-center gap-1">
            <Radio className="h-3 w-3 text-cyan-500" />
            TX BANDWIDTH: 144Kbps // DSN DUPLEX
          </span>
          <span>LATENCY: ~14.2 min (ONE-WAY)</span>
        </div>
      </div>
    </div>
  );
}
