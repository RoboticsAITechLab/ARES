"use client";

interface MapGeofenceProps {
  projectCoords: (lat: number, lon: number) => { x: number; y: number };
}

export default function MapGeofence({ projectCoords }: MapGeofenceProps) {
  const p1 = projectCoords(18.63, 226.10);
  const p2 = projectCoords(18.69, 226.15);
  const p3 = projectCoords(18.67, 226.24);
  const p4 = projectCoords(18.61, 226.20);

  const deploymentCenter = projectCoords(18.65, 226.15);

  return (
    <g className="pointer-events-none select-none">
      {/* Exploration Geofence Polygon */}
      <polygon
        points={`${p1.x},${p1.y} ${p2.x},${p2.y} ${p3.x},${p3.y} ${p4.x},${p4.y}`}
        className="fill-cyan-500/5 stroke-cyan-500/10"
        strokeWidth="1.2"
        strokeDasharray="4,4"
      />

      {/* Primary Deployment Boundary */}
      <circle
        cx={deploymentCenter.x}
        cy={deploymentCenter.y}
        r="45"
        className="fill-none stroke-slate-800/80"
        strokeWidth="1"
        strokeDasharray="6,6"
      />
      <text
        x={deploymentCenter.x - 40}
        y={deploymentCenter.y + 55}
        className="fill-slate-600 font-mono font-bold"
        fontSize="6"
      >
        PRIMARY DEPLOYMENT ZONE [DZ-A]
      </text>
    </g>
  );
}
