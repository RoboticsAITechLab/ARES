"use client";

interface MapRouteProps {
  points: { x: number; y: number }[];
  colorClass?: string;
  dashed?: boolean;
}

export default function MapRoute({
  points,
  colorClass = "stroke-cyan-500/30",
  dashed = true,
}: MapRouteProps) {
  if (points.length < 2) return null;

  const pathString = points
    .map((p, idx) => `${idx === 0 ? "M" : "L"} ${p.x} ${p.y}`)
    .join(" ");

  return (
    <path
      d={pathString}
      className={`fill-none ${colorClass} transition-all duration-300`}
      strokeWidth="1"
      strokeDasharray={dashed ? "3,3" : "none"}
    />
  );
}
