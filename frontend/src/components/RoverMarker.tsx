"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface RoverMarkerProps {
  x: number;
  y: number;
  name: string;
  type: "mother" | "scout";
  status: string;
  battery: number;
  signal: number;
}

export default function RoverMarker({
  x,
  y,
  name,
  type,
  status,
  battery,
  signal,
}: RoverMarkerProps) {
  const [isHovered, setIsHovered] = useState(false);

  const isMother = type === "mother";
  const isWarning = status === "warning";
  const isCritical = status === "critical";

  let markerColor = "fill-slate-400 stroke-slate-950";
  let labelColor = "fill-slate-400";
  let ringColor = "stroke-slate-500/20";

  if (isMother) {
    markerColor = "fill-cyan-400 stroke-slate-950";
    labelColor = "fill-cyan-400 font-extrabold";
    ringColor = "stroke-cyan-500/15";
  } else if (isCritical) {
    markerColor = "fill-rose-500 stroke-slate-950";
    labelColor = "fill-rose-500 font-bold";
    ringColor = "stroke-rose-500/20";
  } else if (isWarning) {
    markerColor = "fill-amber-500 stroke-slate-950";
    labelColor = "fill-amber-500 font-bold";
    ringColor = "stroke-amber-500/20";
  } else {
    markerColor = "fill-emerald-400 stroke-slate-950";
    labelColor = "fill-emerald-400 font-semibold";
    ringColor = "stroke-emerald-500/20";
  }

  const radius = isMother ? 8 : 4.5;
  const outerRadius = isMother ? 27 : 12;
  const innerRadius = isMother ? 14 : 7;

  return (
    <g
      className="cursor-pointer select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Outer Footprint Ring */}
      <circle
        cx={x}
        cy={y}
        r={outerRadius}
        className={cn("fill-none stroke-[1] transition-all duration-200", ringColor, isHovered && "stroke-[1.8]")}
        strokeDasharray={isMother ? "3,3" : "2,2"}
      />
      {/* Inner Footprint Ring */}
      <circle
        cx={x}
        cy={y}
        r={innerRadius}
        className={cn("fill-none stroke-[1] transition-all duration-200", ringColor, isHovered && "fill-cyan-500/5")}
      />
      {/* Core Center Dot */}
      <circle
        cx={x}
        cy={y}
        r={radius}
        className={cn("transition-all duration-200 origin-center", markerColor)}
        strokeWidth={isHovered ? "2" : "1.2"}
      />

      {/* Target Crosshairs for Mother Rover */}
      {isMother && (
        <>
          <line x1={x - 12} y1={y} x2={x + 12} y2={y} className="stroke-cyan-500/30 stroke-[0.8] pointer-events-none" />
          <line x1={x} y1={y - 12} x2={x} y2={y + 12} className="stroke-cyan-500/30 stroke-[0.8] pointer-events-none" />
        </>
      )}

      {/* Text Label */}
      <text
        x={x + 10}
        y={y - 10}
        className={cn("text-[9px] font-mono tracking-wider pointer-events-none select-none transition-all duration-200", labelColor, isHovered && "text-[10px] font-black")}
      >
        {name.toUpperCase()}
      </text>

      {/* Hover Info Tooltip (SVG details) */}
      {isHovered && (
        <g className="pointer-events-none select-none z-50">
          <rect
            x={x + 10}
            y={y + 5}
            width="90"
            height="40"
            rx="3"
            className="fill-slate-950/95 stroke-slate-800 stroke-[1]"
          />
          <text x={x + 15} y={y + 16} className="fill-slate-300 text-[7px] font-mono font-bold leading-none">
            BAT: {battery}%
          </text>
          <text x={x + 15} y={y + 26} className="fill-slate-300 text-[7px] font-mono font-bold leading-none">
            SIG: {signal}%
          </text>
          <text x={x + 15} y={y + 36} className="fill-slate-400 text-[6px] font-mono uppercase font-bold leading-none">
            STAT: {status}
          </text>
        </g>
      )}
    </g>
  );
}
