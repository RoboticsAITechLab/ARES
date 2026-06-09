"use client";

import { useRef, useState, useEffect } from "react";
import { useMissionStore } from "@/lib/store";
import RoverMarker from "./RoverMarker";
import RadarPulse from "./RadarPulse";
import { Info, Maximize, Minimize } from "lucide-react";
import { Button } from "./ui/button";

export default function MissionMap() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const mapWidth = 600;
  const mapHeight = 350;

  const rovers = useMissionStore((state) => state.rovers);
  const motherRover = rovers.find((r) => r.type === "mother")!;
  const scoutRovers = rovers.filter((r) => r.type === "scout");

  // Coordinate projection helper
  const projectCoords = (lat: number, lon: number) => {
    const minLat = 18.60;
    const maxLat = 18.70;
    const minLon = 226.10;
    const maxLon = 226.30;

    const x = ((lon - minLon) / (maxLon - minLon)) * mapWidth;
    const y = mapHeight - ((lat - minLat) / (maxLat - minLat)) * mapHeight;

    return { x, y };
  };

  // Live paths that connect mock history to current coordinates in the store
  const motherPath = [
    { lat: 18.6500, lon: 226.1200 },
    { lat: 18.6510, lon: 226.1600 },
    { lat: motherRover.latitude, lon: motherRover.longitude }
  ];

  const scout1Path = [
    { lat: 18.6521, lon: 226.2045 },
    { lat: 18.6700, lon: 226.2200 },
    { lat: scoutRovers[0]?.latitude || 18.6845, lon: scoutRovers[0]?.longitude || 226.2512 }
  ];

  const scout2Path = [
    { lat: 18.6521, lon: 226.2045 },
    { lat: 18.6300, lon: 226.1800 },
    { lat: scoutRovers[1]?.latitude || 18.6214, lon: scoutRovers[1]?.longitude || 226.1593 }
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

  const toggleFullscreen = () => {
    if (!mapContainerRef.current) return;
    if (!document.fullscreenElement) {
      mapContainerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(err => {
        console.error("Error enabling fullscreen:", err);
      });
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false));
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const motherXY = projectCoords(motherRover.latitude, motherRover.longitude);

  return (
    <div 
      ref={mapContainerRef} 
      className={`border border-slate-800 bg-[#111827] rounded p-4 flex flex-col gap-4 relative transition-all duration-300 ${
        isFullscreen ? "h-screen w-screen p-8 bg-[#050811] z-50 rounded-none border-none" : ""
      }`}
    >
      <div className="flex justify-between items-center text-[10px] text-slate-400 border-b border-slate-800/80 pb-2">
        <span className="text-cyan-400 font-bold uppercase select-none">JEZERO TOPOGRAPHIC VECTOR GRID</span>
        <div className="flex items-center gap-3">
          <span className="hidden sm:inline select-none">SCALE: 1px = 12.5m</span>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleFullscreen} 
            className="h-5 w-5 hover:bg-slate-800 text-slate-400 hover:text-white"
          >
            {isFullscreen ? <Minimize className="h-3.5 w-3.5" /> : <Maximize className="h-3.5 w-3.5" />}
          </Button>
        </div>
      </div>

      {/* SVG Map Grid */}
      <div className="relative border border-slate-900 bg-[#060913] rounded overflow-hidden aspect-video flex items-center justify-center p-1">
        <svg
          viewBox={`0 0 ${mapWidth} ${mapHeight}`}
          className="w-full h-full text-slate-900 select-none font-mono"
        >
          {/* Grid Background Pattern */}
          <defs>
            <pattern id="gridPattern" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(30, 41, 59, 0.35)" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#gridPattern)" />

          {/* Exploration Coverage Overlay */}
          <polygon
            points={`
              ${projectCoords(18.63, 226.10).x},${projectCoords(18.63, 226.10).y}
              ${projectCoords(18.69, 226.15).x},${projectCoords(18.69, 226.15).y}
              ${projectCoords(18.67, 226.24).x},${projectCoords(18.67, 226.24).y}
              ${projectCoords(18.61, 226.20).x},${projectCoords(18.61, 226.20).y}
            `}
            className="fill-cyan-500/5 stroke-cyan-500/10"
            strokeWidth="1.2"
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
            className="fill-slate-600 font-bold"
            fontSize="6"
          >
            PRIMARY DEPLOYMENT ZONE [DZ-A]
          </text>

          {/* Sector Grid Labels */}
          <text x="50" y="50" className="fill-slate-700/40 font-bold" fontSize="8">SEC-01</text>
          <text x="250" y="50" className="fill-slate-700/40 font-bold" fontSize="8">SEC-02</text>
          <text x="450" y="50" className="fill-slate-700/40 font-bold" fontSize="8">SEC-03</text>
          <text x="50" y="200" className="fill-slate-700/40 font-bold" fontSize="8">SEC-04</text>
          <text x="250" y="200" className="fill-slate-700/40 font-bold" fontSize="8">SEC-05</text>
          <text x="450" y="200" className="fill-slate-700/40 font-bold" fontSize="8">SEC-06</text>

          {/* Rover Path Traces */}
          <path d={getSVGPathString(motherPath)} className="fill-none stroke-cyan-500/20" strokeWidth="1" strokeDasharray="3,3" />
          <path d={getSVGPathString(scout1Path)} className="fill-none stroke-amber-500/20" strokeWidth="1" strokeDasharray="3,3" />
          <path d={getSVGPathString(scout2Path)} className="fill-none stroke-emerald-500/20" strokeWidth="1" strokeDasharray="3,3" />

          {/* Latitude / Longitude ticks */}
          <text x="10" y="20" className="fill-slate-600/50" fontSize="7">LAT 18.70</text>
          <text x="10" y={mapHeight - 10} className="fill-slate-600/50" fontSize="7">LAT 18.60</text>
          <text x="10" y="340" className="fill-slate-600/50" fontSize="7">LON 226.10</text>
          <text x={mapWidth - 65} y="340" className="fill-slate-600/50" fontSize="7">LON 226.30</text>

          {/* Hazard Markers (Red warnings) */}
          {hazards.map((haz, idx) => {
            const { x, y } = projectCoords(haz.lat, haz.lon);
            return (
              <g key={idx}>
                <line x1={x - 6} y1={y} x2={x + 6} y2={y} stroke="#EF4444" strokeWidth="1.2" />
                <line x1={x} y1={y - 6} x2={x} y2={y + 6} stroke="#EF4444" strokeWidth="1.2" />
                <circle cx={x} cy={y} r="3" className="fill-none stroke-rose-500/40" strokeWidth="0.8" />
                <text x={x + 8} y={y + 3} fill="#EF4444" fontSize="6" className="font-bold">{haz.label}</text>
              </g>
            );
          })}

          {/* Radar Pulse surrounding the Mother Rover (Dynamic) */}
          <RadarPulse cx={motherXY.x} cy={motherXY.y} colorClass="stroke-cyan-500" />

          {/* Mother Rover Map Marker */}
          <RoverMarker 
            x={motherXY.x} 
            y={motherXY.y} 
            name={motherRover.name}
            type="mother"
            status={motherRover.status}
            battery={motherRover.battery}
            signal={motherRover.signal}
          />

          {/* Scout Rovers Markers */}
          {scoutRovers.map((scout, idx) => {
            const { x, y } = projectCoords(scout.latitude, scout.longitude);
            return (
              <RoverMarker 
                key={scout.id}
                x={x} 
                y={y} 
                name={scout.name}
                type="scout"
                status={scout.status}
                battery={scout.battery}
                signal={scout.signal}
              />
            );
          })}
        </svg>
      </div>

      <div className="text-[10px] text-slate-500 flex items-center gap-2 bg-slate-950/40 px-3 py-2.5 rounded border border-slate-900 leading-normal select-none">
        <Info className="h-4 w-4 text-cyan-400 shrink-0" />
        <span>Tactical coordinate grids mapped via passive orbital telemetry. Move cursor over rover nodes for live battery and signal quality diagnostics.</span>
      </div>
    </div>
  );
}
