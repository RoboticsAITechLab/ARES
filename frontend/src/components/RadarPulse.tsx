"use client";

import { cn } from "@/lib/utils";

interface RadarPulseProps {
  cx: number;
  cy: number;
  colorClass?: string;
}

export default function RadarPulse({
  cx,
  cy,
  colorClass = "stroke-cyan-500",
}: RadarPulseProps) {
  return (
    <g className="pointer-events-none">
      {/* Concentric radar waves utilizing GPU-friendly keyframe animations */}
      <circle
        cx={cx}
        cy={cy}
        r="10"
        className={cn("fill-none stroke-[1.2] opacity-0 animate-radar", colorClass)}
        style={{ animationDelay: "0s" }}
      />
      <circle
        cx={cx}
        cy={cy}
        r="10"
        className={cn("fill-none stroke-[1.2] opacity-0 animate-radar", colorClass)}
        style={{ animationDelay: "1s" }}
      />
      <circle
        cx={cx}
        cy={cy}
        r="10"
        className={cn("fill-none stroke-[1.2] opacity-0 animate-radar", colorClass)}
        style={{ animationDelay: "2s" }}
      />
    </g>
  );
}
