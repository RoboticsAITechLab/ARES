"use client";

interface MapGridProps {
  width: number;
  height: number;
}

export default function MapGrid({ width, height }: MapGridProps) {
  return (
    <>
      <defs>
        <pattern id="gridPattern2" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(30, 41, 59, 0.35)" strokeWidth="0.5" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#gridPattern2)" className="pointer-events-none" />

      {/* Sector Labels */}
      <g className="fill-slate-700/40 font-mono font-bold text-[8px] pointer-events-none select-none">
        <text x="50" y="50">SEC-01</text>
        <text x="250" y="50">SEC-02</text>
        <text x="450" y="50">SEC-03</text>
        <text x="50" y="200">SEC-04</text>
        <text x="250" y="200">SEC-05</text>
        <text x="450" y="200">SEC-06</text>
      </g>

      {/* Coordinate Boundary Ticks */}
      <g className="fill-slate-600/50 font-mono text-[7px] pointer-events-none select-none">
        <text x="10" y="20">LAT 18.70</text>
        <text x="10" y={height - 10}>LAT 18.60</text>
        <text x="10" y="340">LON 226.10</text>
        <text x={width - 65} y="340">LON 226.30</text>
      </g>
    </>
  );
}
