"use client";

import { Play, ShieldAlert, Send, CornerDownLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CommandCenter() {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="font-mono text-xs font-semibold text-slate-400 tracking-wider">
          COMMAND_CENTER // OPERATION_PANEL
        </h2>
        <span className="font-mono text-[9px] text-slate-500 uppercase tracking-widest">
          STATUS: READY
        </span>
      </div>

      <div className="p-4 rounded border border-slate-800 bg-[#111827] space-y-4 font-mono">
        {/* Section 1: Scout Directives */}
        <div>
          <div className="text-[10px] text-slate-500 mb-2 uppercase tracking-widest">
            SCOUT MOBILITY DIRECTIVES
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              className="text-xs h-9 border-slate-800 bg-slate-900/60 text-slate-300 hover:text-cyan-400 hover:border-cyan-500/30 hover:bg-slate-950 font-mono flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Send className="h-3.5 w-3.5" />
              <span>DEPLOY SCOUT 1</span>
            </Button>
            <Button
              variant="outline"
              className="text-xs h-9 border-slate-800 bg-slate-900/60 text-slate-300 hover:text-cyan-400 hover:border-cyan-500/30 hover:bg-slate-950 font-mono flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Send className="h-3.5 w-3.5" />
              <span>DEPLOY SCOUT 2</span>
            </Button>
            <Button
              variant="outline"
              className="text-xs h-9 border-slate-800 bg-slate-900/60 text-slate-300 hover:text-cyan-400 hover:border-cyan-500/30 hover:bg-slate-950 font-mono flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <CornerDownLeft className="h-3.5 w-3.5" />
              <span>RECALL SCOUT 1</span>
            </Button>
            <Button
              variant="outline"
              className="text-xs h-9 border-slate-800 bg-slate-900/60 text-slate-300 hover:text-cyan-400 hover:border-cyan-500/30 hover:bg-slate-950 font-mono flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <CornerDownLeft className="h-3.5 w-3.5" />
              <span>RECALL SCOUT 2</span>
            </Button>
          </div>
        </div>

        {/* Section 2: Core Mission Control */}
        <div>
          <div className="text-[10px] text-slate-500 mb-2 uppercase tracking-widest">
            MISSION DIRECTIVES
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              className="text-xs h-10 border-emerald-950 bg-emerald-950/20 text-emerald-400 hover:bg-emerald-950/40 hover:text-emerald-300 hover:border-emerald-500/40 font-mono flex items-center justify-center gap-2 cursor-pointer"
            >
              <Play className="h-4 w-4" />
              <span className="font-bold">START MISSION</span>
            </Button>
            <Button
              variant="outline"
              className="text-xs h-10 border-rose-950 bg-rose-950/20 text-rose-400 hover:bg-rose-950/40 hover:text-rose-300 hover:border-rose-500/40 font-mono flex items-center justify-center gap-2 cursor-pointer"
            >
              <ShieldAlert className="h-4 w-4" />
              <span className="font-bold">ABORT MISSION</span>
            </Button>
          </div>
        </div>

        {/* Console status footer */}
        <div className="text-[9px] text-slate-500 border-t border-slate-800/80 pt-2 flex justify-between">
          <span>TX INTERRUPT: ONLINE</span>
          <span>LATENCY: 14.2m (MARS-EARTH)</span>
        </div>
      </div>
    </div>
  );
}
