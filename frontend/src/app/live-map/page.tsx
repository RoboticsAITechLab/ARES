"use client";

import { MapPin, Info, Navigation, RefreshCw, Layers } from "lucide-react";
import { mockRovers } from "@/lib/mock-data";

export default function LiveMapPage() {
  const mapWidth = 600;
  const mapHeight = 350;

  // Projection coordinate mapping helpers
  const projectCoords = (lat: number, lon: number) => {
    const minLat = 18.60;
    const maxLat = 18.70;
    const minLon = 226.10;
    const maxLon = 226.30;

    const x = ((lon - minLon) / (maxLon - minLon)) * mapWidth;
    const y = mapHeight - ((lat - minLat) / (maxLat - minLat)) * mapHeight;

    return { x, y };
  };

  const motherRover = mockRovers.find((r) => r.type === "mother")!;
  const scoutRovers = mockRovers.filter((r) => r.type === "scout");

  // Coordinates of historical paths (mock traces)
  const motherPath = [
    { lat: 18.6500, lon: 226.1200 },
    { lat: 18.6510, lon: 226.1600 },
    { lat: 18.6521, lon: 226.2045 }
  ];

  const scout1Path = [
    { lat: 18.6521, lon: 226.2045 },
    { lat: 18.6700, lon: 226.2200 },
    { lat: 18.6845, lon: 226.2512 }
  ];

  const scout2Path = [
    { lat: 18.6521, lon: 226.2045 },
    { lat: 18.6300, lon: 226.1800 },
    { lat: 18.6214, lon: 226.1593 }
  ];

  const hazards = [
    { lat: 18.6750, lon: 226.1400, label: "BOULDER FIELD [HAZ-01]" },
    { lat: 18.6150, lon: 226.2200, label: "STEEP CRATER SLOPE [HAZ-02]" },
  ];

  const getSVGPathString = (points: { lat: number; lon: number }[]) => {
    return points
      .map((p, idx) => {
        const { x, y } = projectCoords(p.lat, p.lon);
        return `${idx === 0 ? "M" : "L"} ${x} ${y}`;
      })
      .join(" ");
  };

  return (
    <div className="space-y-6 font-mono">
      {/* Page Header */}
      <div className="p-4 rounded border border-slate-800 bg-[#111827] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Navigation className="h-5 w-5 text-cyan-400 rotate-45" />
          <div>
            <div className="text-[10px] text-slate-500 tracking-wider">TACTICAL NAVIGATION SUITE</div>
            <h1 className="text-sm font-bold text-white tracking-widest uppercase">
              GRID_MAP_TOPOGRAPHY // VEHICLE_VECTORING
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-slate-500">
          <RefreshCw className="h-3 w-3 animate-spin text-cyan-400" />
          <span>MAP_REFRESH_PASSIVE (SOL 142)</span>
        </div>
      </div>

      {/* Main Grid Viewport */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-start">
        {/* Map Viewport Container */}
        <div className="xl:col-span-3 border border-slate-800 bg-[#111827] rounded p-4 flex flex-col gap-4 relative">
          
          <div id="threejs-map-viewport" className="hidden">
            {/* Future Canvas element location */}
          </div>

          <div className="flex justify-between items-center text-[10px] text-slate-400 border-b border-slate-850 pb-2">
            <span className="text-cyan-400 font-bold uppercase">JEZERO TOPOGRAPHIC VECTOR GRID</span>
            <span>SCALE: 1px = 12.5 meters</span>
          </div>

          {/* SVG Map Grid */}
          <div className="relative border border-slate-900 bg-slate-950 rounded overflow-hidden aspect-video flex items-center justify-center p-2">
            <svg
              viewBox={`0 0 ${mapWidth} ${mapHeight}`}
              className="w-full h-full text-slate-900"
            >
              {/* Grid Background Pattern */}
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(30, 41, 59, 0.4)" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />

              {/* Exploration Coverage Overlay */}
              <polygon
                points={`
                  ${projectCoords(18.63, 226.10).x},${projectCoords(18.63, 226.10).y}
                  ${projectCoords(18.69, 226.15).x},${projectCoords(18.69, 226.15).y}
                  ${projectCoords(18.67, 226.24).x},${projectCoords(18.67, 226.24).y}
                  ${projectCoords(18.61, 226.20).x},${projectCoords(18.61, 226.20).y}
                `}
                className="fill-cyan-500/5 stroke-cyan-500/10"
                strokeWidth="1.5"
                strokeDasharray="4,4"
              />

              {/* Deployment Bounded Zones */}
              <circle
                cx={projectCoords(18.65, 226.15).x}
                cy={projectCoords(18.65, 226.15).y}
                r="45"
                className="fill-none stroke-slate-800"
                strokeWidth="1"
                strokeDasharray="6,6"
              />
              <text
                x={projectCoords(18.65, 226.15).x - 40}
                y={projectCoords(18.65, 226.15).y + 55}
                fill="rgba(148, 163, 184, 0.3)"
                fontSize="6"
                fontWeight="bold"
              >
                PRIMARY DEPLOYMENT ZONE [DZ-A]
              </text>

              {/* Sector Grid Labels */}
              <text x="50" y="50" fill="rgba(148, 163, 184, 0.2)" fontSize="9" fontWeight="bold">SEC-01</text>
              <text x="250" y="50" fill="rgba(148, 163, 184, 0.2)" fontSize="9" fontWeight="bold">SEC-02</text>
              <text x="450" y="50" fill="rgba(148, 163, 184, 0.2)" fontSize="9" fontWeight="bold">SEC-03</text>
              <text x="50" y="200" fill="rgba(148, 163, 184, 0.2)" fontSize="9" fontWeight="bold">SEC-04</text>
              <text x="250" y="200" fill="rgba(148, 163, 184, 0.2)" fontSize="9" fontWeight="bold">SEC-05</text>
              <text x="450" y="200" fill="rgba(148, 163, 184, 0.2)" fontSize="9" fontWeight="bold">SEC-06</text>

              {/* Rover Path Traces */}
              <path d={getSVGPathString(motherPath)} className="fill-none stroke-cyan-500/30" strokeWidth="1" strokeDasharray="3,3" />
              <path d={getSVGPathString(scout1Path)} className="fill-none stroke-amber-500/30" strokeWidth="1" strokeDasharray="3,3" />
              <path d={getSVGPathString(scout2Path)} className="fill-none stroke-slate-500/30" strokeWidth="1" strokeDasharray="3,3" />

              {/* Latitude / Longitude ticks */}
              <text x="10" y="20" fill="rgba(148, 163, 184, 0.3)" fontSize="8">LAT 18.70</text>
              <text x="10" y={mapHeight - 10} fill="rgba(148, 163, 184, 0.3)" fontSize="8">LAT 18.60</text>
              <text x="10" y="340" fill="rgba(148, 163, 184, 0.3)" fontSize="8">LON 226.10</text>
              <text x={mapWidth - 65} y="340" fill="rgba(148, 163, 184, 0.3)" fontSize="8">LON 226.30</text>

              {/* Hazard Markers (Red warnings) */}
              {hazards.map((haz, idx) => {
                const { x, y } = projectCoords(haz.lat, haz.lon);
                return (
                  <g key={idx}>
                    <line x1={x - 6} y1={y} x2={x + 6} y2={y} stroke="#EF4444" strokeWidth="1" />
                    <line x1={x} y1={y - 6} x2={x} y2={y + 6} stroke="#EF4444" strokeWidth="1" />
                    <circle cx={x} cy={y} r="3" className="fill-none stroke-rose-500/40" strokeWidth="0.8" />
                    <text x={x + 8} y={y + 3} fill="#EF4444" fontSize="6" fontWeight="bold">{haz.label}</text>
                  </g>
                );
              })}

              {/* Mother Rover Map Marker & Footprint - Scaled up by 150% */}
              {(() => {
                const { x, y } = projectCoords(motherRover.latitude, motherRover.longitude);
                return (
                  <g key={motherRover.id}>
                    {/* Footprint outer ring (increased from 18 to 27) */}
                    <circle cx={x} cy={y} r="27" className="fill-none stroke-cyan-500/15" strokeWidth="1.2" strokeDasharray="3,3" />
                    {/* Footprint inner ring (increased from 9 to 14) */}
                    <circle cx={x} cy={y} r="14" className="fill-cyan-500/10 stroke-cyan-500/30" strokeWidth="1.2" />
                    {/* Core center dot (increased from 4 to 8) */}
                    <circle cx={x} cy={y} r="8" className="fill-cyan-400 stroke-slate-950" strokeWidth="2" />
                    {/* Target Crosshairs for Mother Rover */}
                    <line x1={x - 12} y1={y} x2={x + 12} y2={y} stroke="#06B6D4" strokeWidth="0.8" strokeOpacity="0.4" />
                    <line x1={x} y1={y - 12} x2={x} y2={y + 12} stroke="#06B6D4" strokeWidth="0.8" strokeOpacity="0.4" />
                    
                    <text x={x + 12} y={y - 12} fill="#06B6D4" fontSize="9" fontWeight="extrabold">{motherRover.name.toUpperCase()}</text>
                  </g>
                );
              })()}

              {/* Scout Rovers Markers - Left intentionally smaller */}
              {scoutRovers.map((rover) => {
                const { x, y } = projectCoords(rover.latitude, rover.longitude);
                const isWarning = rover.status === "warning";
                
                return (
                  <g key={rover.id}>
                    <circle cx={x} cy={y} r="6" className={isWarning ? "fill-none stroke-amber-500/20" : "fill-none stroke-slate-500/20"} strokeWidth="1" />
                    <circle
                      cx={x}
                      cy={y}
                      r="3"
                      className={isWarning ? "fill-amber-500 stroke-slate-950" : "fill-slate-300 stroke-slate-950"}
                      strokeWidth="1.2"
                    />
                    <text
                      x={x + 8}
                      y={y + 3}
                      fill={isWarning ? "#F59E0B" : "#D1D5DB"}
                      fontSize="7"
                      fontWeight="bold"
                    >
                      {rover.name.toUpperCase()}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          <div className="text-[10px] text-slate-500 flex items-center gap-1.5 bg-slate-950/40 px-3 py-2 rounded border border-slate-900 leading-normal">
            <Info className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
            <span>Operational coordinates mapped via passive orbital relays. Future UI expansion includes WebGL bindings for 3D terrain exploration grids.</span>
          </div>
        </div>

        {/* Legend sidebar */}
        <div className="space-y-4">
          <div className="p-4 border border-slate-800 bg-[#111827] rounded space-y-4">
            <h3 className="text-xs font-semibold text-slate-400 tracking-wider flex items-center gap-1.5 uppercase">
              <Layers className="h-3.5 w-3.5 text-cyan-400" />
              MAP_LEGEND
            </h3>
            
            <div className="space-y-2.5 text-[9px] text-slate-400">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-cyan-400"></span>
                <span className="font-bold text-slate-200">ARES MOTHER ROVER (HERO CORE)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-slate-300"></span>
                <span className="font-bold text-slate-200">SCOUT UNITS (NOMINAL)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-amber-500"></span>
                <span className="font-bold text-amber-500">SCOUT UNITS (WARNING)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3.5 w-0.5 bg-rose-500 block"></span>
                <span className="h-0.5 w-3 bg-rose-500 -ml-2 block"></span>
                <span className="font-bold text-rose-400">HAZARD POINT</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 border border-dashed border-cyan-500/25 bg-cyan-500/5 block"></span>
                <span className="font-bold text-slate-300">EXPLORED AREA COVERAGE</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 border border-dashed border-slate-800 block"></span>
                <span className="font-bold text-slate-300">DEPLOYMENT RANGE BOUND</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
