"use client";

import { MapPin, Info, Navigation, RefreshCw } from "lucide-react";
import { mockRovers } from "@/lib/mock-data";

export default function LiveMapPage() {
  // Let's define map limits based on rovers coords
  // Latitude around 18.6, Longitude around 226.2
  // We can scale the Lat/Lon coordinates into a nice SVG viewport box (e.g. 500x300)
  const mapWidth = 600;
  const mapHeight = 350;

  // Coordinate projection mapping helpers
  // Mapping Lat: 18.60 -> 18.70 to y: mapHeight -> 0
  // Mapping Lon: 226.10 -> 226.30 to x: 0 -> mapWidth
  const projectCoords = (lat: number, lon: number) => {
    const minLat = 18.60;
    const maxLat = 18.70;
    const minLon = 226.10;
    const maxLon = 226.30;

    const x = ((lon - minLon) / (maxLon - minLon)) * mapWidth;
    // invert Y since SVG 0 is at top
    const y = mapHeight - ((lat - minLat) / (maxLat - minLat)) * mapHeight;

    return { x, y };
  };

  const motherRover = mockRovers.find((r) => r.type === "mother")!;
  const scoutRovers = mockRovers.filter((r) => r.type === "scout");

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="p-4 rounded border border-slate-800 bg-[#111827] flex items-center justify-between font-mono">
        <div className="flex items-center gap-3">
          <Navigation className="h-5 w-5 text-cyan-400 rotate-45" />
          <div>
            <div className="text-[10px] text-slate-500 tracking-wider">TACTICAL LOCATION PANEL</div>
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
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-start font-mono">
        {/* Map Viewport Container */}
        <div className="xl:col-span-3 border border-slate-800 bg-[#111827]/80 rounded p-4 flex flex-col gap-4 relative">
          
          {/* THREE.JS INTEGRATION EXTENSION POINT */}
          {/*
            To integrate Three.js:
            1. Replace the SVG Map component with a `<Canvas>` or your custom WebGL component.
            2. Bind your orbit controls and pass `mockRovers` as coordinates nodes to plot 3D models.
            3. Target container ID: `#threejs-map-viewport`
          */}
          <div id="threejs-map-viewport" className="hidden">
            {/* Future Canvas element location */}
          </div>

          <div className="flex justify-between items-center text-[10px] text-slate-400 border-b border-slate-800/80 pb-2">
            <span className="text-cyan-400 font-semibold uppercase">JEZERO TOPOGRAPHIC VECTOR GRID</span>
            <span>SCALE: 1px = 12.5 meters</span>
          </div>

          {/* SVG Map Grid */}
          <div className="relative border border-slate-900 bg-slate-950 rounded overflow-hidden aspect-video flex items-center justify-center p-2">
            <svg
              viewBox={`0 0 ${mapWidth} ${mapHeight}`}
              className="w-full h-full text-slate-800/60"
            >
              {/* Grid Lines */}
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />

              {/* Map Coordinates Axis Labeling */}
              <text x="10" y="20" fill="rgba(148, 163, 184, 0.4)" fontSize="8" fontFamily="monospace">LAT: 18.70</text>
              <text x="10" y={mapHeight - 10} fill="rgba(148, 163, 184, 0.4)" fontSize="8" fontFamily="monospace">LAT: 18.60</text>
              <text x="10" y={mapHeight / 2} fill="rgba(148, 163, 184, 0.4)" fontSize="8" fontFamily="monospace">LAT: 18.65</text>
              
              <text x="10" y="340" fill="rgba(148, 163, 184, 0.4)" fontSize="8" fontFamily="monospace">LON: 226.10</text>
              <text x={mapWidth - 60} y="340" fill="rgba(148, 163, 184, 0.4)" fontSize="8" fontFamily="monospace">LON: 226.30</text>
              <text x={mapWidth / 2 - 30} y="340" fill="rgba(148, 163, 184, 0.4)" fontSize="8" fontFamily="monospace">LON: 226.20</text>

              {/* Mother Rover (ARES MotherShip) Map Marker & Radar Ring */}
              {(() => {
                const { x, y } = projectCoords(motherRover.latitude, motherRover.longitude);
                return (
                  <g key={motherRover.id}>
                    {/* Concentric footprint rings */}
                    <circle cx={x} cy={y} r="25" className="fill-none stroke-cyan-500/20" strokeWidth="1" strokeDasharray="3,3" />
                    <circle cx={x} cy={y} r="12" className="fill-cyan-500/10 stroke-cyan-500/40" strokeWidth="1" />
                    {/* Center Core dot */}
                    <circle cx={x} cy={y} r="4.5" className="fill-cyan-400 stroke-slate-950" strokeWidth="1.5" />
                    {/* Label */}
                    <text x={x + 10} y={y - 8} fill="#06B6D4" fontSize="8" fontWeight="bold">{motherRover.name.toUpperCase()}</text>
                  </g>
                );
              })()}

              {/* Scout Rovers Markers */}
              {scoutRovers.map((rover) => {
                const { x, y } = projectCoords(rover.latitude, rover.longitude);
                const isWarning = rover.status === "warning";
                
                return (
                  <g key={rover.id}>
                    <circle cx={x} cy={y} r="8" className={isWarning ? "fill-none stroke-amber-500/30" : "fill-none stroke-slate-500/30"} strokeWidth="1" />
                    <circle
                      cx={x}
                      cy={y}
                      r="3.5"
                      className={isWarning ? "fill-amber-500 stroke-slate-950" : "fill-slate-300 stroke-slate-950"}
                      strokeWidth="1.2"
                    />
                    <text
                      x={x + 8}
                      y={y + 3}
                      fill={isWarning ? "#F59E0B" : "#D1D5DB"}
                      fontSize="7"
                      fontWeight="semibold"
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
            <span>Map coordinates synced via orbital pass relay. Future updates will hook into custom Three.js WebGL terrain and model meshes.</span>
          </div>
        </div>

        {/* Sidebar details panel */}
        <div className="space-y-4">
          <div className="p-4 border border-slate-800 bg-[#111827] rounded space-y-4">
            <h3 className="text-xs font-semibold text-slate-400 tracking-wider">ROVER_LOCATIONS</h3>
            <div className="space-y-3">
              {mockRovers.map((rover) => (
                <div key={rover.id} className="p-2.5 rounded bg-slate-950/40 border border-slate-900 space-y-2 text-[10px]">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-200">{rover.name}</span>
                    <span className={`text-[8px] px-1.5 rounded uppercase font-semibold ${
                      rover.type === "mother" ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20" : "bg-slate-800 text-slate-400"
                    }`}>
                      {rover.type}
                    </span>
                  </div>
                  <div className="text-slate-400 space-y-0.5">
                    <div className="flex justify-between">
                      <span>LAT:</span>
                      <span className="text-slate-200">{rover.latitude.toFixed(6)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>LON:</span>
                      <span className="text-slate-200">{rover.longitude.toFixed(6)}</span>
                    </div>
                    <div className="flex justify-between border-t border-slate-900/60 pt-1 mt-1 text-slate-500 text-[9px]">
                      <span>VELOCITY:</span>
                      <span className="text-slate-400 font-semibold">{rover.speed.toFixed(2)} m/s</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
