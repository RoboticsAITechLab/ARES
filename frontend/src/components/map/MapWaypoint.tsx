"use client";

import { useState } from "react";
import { WaypointType } from "../../domain/routes/types";
import { cn } from "@/lib/utils";

interface MapWaypointProps {
  x: number;
  y: number;
  name: string;
  type: WaypointType;
  priority: "LOW" | "MEDIUM" | "HIGH";
  description: string;
  notes?: string;
}

export default function MapWaypoint({
  x,
  y,
  name,
  type,
  priority,
  description,
  notes,
}: MapWaypointProps) {
  const [isHovered, setIsHovered] = useState(false);

  // Custom SVG drawings for each waypoint classification
  const renderIcon = () => {
    switch (type) {
      case "SCAN":
        return (
          <g className="stroke-cyan-400 fill-none" strokeWidth="1">
            <circle cx={x} cy={y} r="5" />
            <line x1={x - 8} y1={y} x2={x + 8} y2={y} />
            <line x1={x} y1={y - 8} x2={x} y2={y + 8} />
          </g>
        );
      case "COLLECT":
        return (
          <g className="stroke-emerald-400 fill-none" strokeWidth="1">
            <path d={`M ${x-3} ${y-5} L ${x+3} ${y-5} M ${x-1} ${y-5} L ${x-1} ${y-1} L ${x-4} ${y+4} A 1 1 0 0 0 ${x+4} ${y+4} L ${x+1} ${y-1} L ${x+1} ${y-5}`} />
            <line x1={x-3} y1={y+2} x2={x+3} y2={y+2} className="stroke-emerald-500/50" />
          </g>
        );
      case "RELAY":
        return (
          <g className="stroke-amber-400 fill-none" strokeWidth="1">
            <line x1={x} y1={y-6} x2={x} y2={y+6} />
            <path d={`M ${x-4} ${y+6} L ${x} ${y-6} L ${x+4} ${y+6}`} />
            <circle cx={x} cy={y-6} r="1.5" className="fill-amber-400" />
          </g>
        );
      case "OBSERVE":
        return (
          <g className="stroke-purple-400 fill-none" strokeWidth="1">
            <path d={`M ${x-6} ${y} C ${x-2} ${y-4} ${x+2} ${y-4} ${x+6} ${y} C ${x+2} ${y+4} ${x-2} ${y+4} ${x-6} ${y} Z`} />
            <circle cx={x} cy={y} r="2" className="fill-purple-400" />
          </g>
        );
      case "RETURN":
      default:
        return (
          <g className="stroke-rose-400 fill-none" strokeWidth="1">
            <line x1={x-3} y1={y-6} x2={x-3} y2={y+6} />
            <path d={`M ${x-3} ${y-6} L ${x+5} ${y-3} L ${x-3} ${y}`} className="fill-rose-400/20" />
          </g>
        );
    }
  };

  const priorityColor = 
    priority === "HIGH" ? "fill-rose-400" :
    priority === "MEDIUM" ? "fill-amber-400" :
    "fill-slate-400";

  return (
    <g
      className="cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Large transparent click target */}
      <circle cx={x} cy={y} r="12" className="fill-transparent stroke-none" />

      {/* Render icon visual */}
      {renderIcon()}

      {/* Hover Tooltip Box */}
      {isHovered && (
        <g className="pointer-events-none select-none z-50">
          <rect
            x={x + 10}
            y={y - 30}
            width="120"
            height="55"
            rx="3"
            className="fill-slate-950/95 stroke-slate-800 stroke-[1]"
          />
          <text x={x + 15} y={y - 18} className="fill-slate-200 text-[8px] font-mono font-bold leading-none">
            {name.toUpperCase()}
          </text>
          <text x={x + 15} y={y - 8} className="fill-slate-450 text-[7px] font-mono leading-none">
            TYPE: <tspan className="fill-cyan-400 font-extrabold">{type}</tspan>
          </text>
          <text x={x + 15} y={y + 2} className={cn("text-[7px] font-mono leading-none", priorityColor)}>
            PRIORITY: {priority}
          </text>
          {notes && (
            <text x={x + 15} y={y + 12} className="fill-slate-500 text-[6px] font-mono truncate leading-none">
              NOTE: {notes.length > 20 ? notes.substring(0, 20) + "..." : notes}
            </text>
          )}
        </g>
      )}
    </g>
  );
}
