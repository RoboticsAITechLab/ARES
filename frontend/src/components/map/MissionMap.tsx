"use client";

import { useRef, useState, useEffect } from "react";
import { useMissionStore } from "@/store/mission-store";
import MapGrid from "./MapGrid";
import MapGeofence from "./MapGeofence";
import MapWaypoint from "./MapWaypoint";
import MapRoute from "./MapRoute";
import MapMarker from "./MapMarker";
import MapControls from "./MapControls";
import RadarPulse from "../RadarPulse";
import { Info } from "lucide-react";

interface MissionMapProps {
  selectedRoverId?: string | null;
}

export default function MissionMap({ selectedRoverId }: MissionMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Layer Toggles
  const [showRoutes, setShowRoutes] = useState(true);
  const [showGeofence, setShowGeofence] = useState(true);

  const mapWidth = 600;
  const mapHeight = 350;

  const { fleet, map } = useMissionStore();
  const routes = map.routes;

  const gridToLatLon = (x: number, y: number) => {
    const minLat = 18.60;
    const maxLat = 18.70;
    const minLon = 226.10;
    const maxLon = 226.30;
    return {
      latitude: minLat + (y / 100) * (maxLat - minLat),
      longitude: minLon + (x / 100) * (maxLon - minLon)
    };
  };

  const virtualRovers: any[] = [];
  if (fleet.mother) {
    const { latitude, longitude } = gridToLatLon(fleet.mother.x, fleet.mother.y);
    virtualRovers.push({
      ...fleet.mother,
      latitude,
      longitude,
      type: "mother" as const
    });
  }
  fleet.scouts.forEach(s => {
    const { latitude, longitude } = gridToLatLon(s.x, s.y);
    virtualRovers.push({
      ...s,
      latitude,
      longitude,
      type: "scout" as const
    });
  });

  // Project lat/lon to local SVG viewBox coords (600x350)
  const projectCoords = (lat: number, lon: number) => {
    const minLat = 18.60;
    const maxLat = 18.70;
    const minLon = 226.10;
    const maxLon = 226.30;

    const x = ((lon - minLon) / (maxLon - minLon)) * mapWidth;
    const y = mapHeight - ((lat - minLat) / (maxLat - minLat)) * mapHeight;

    return { x, y };
  };

  const toggleFullscreen = () => {
    if (!mapContainerRef.current) return;
    if (!document.fullscreenElement) {
      mapContainerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(err => {
        console.error("Error entering fullscreen:", err);
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

  // Filter rovers to highlight selected one if applicable
  const motherRover = virtualRovers.find(r => r.type === "mother");
  const scoutRovers = virtualRovers.filter(r => r.type === "scout");

  const motherXY = motherRover 
    ? projectCoords(motherRover.latitude, motherRover.longitude)
    : { x: 300, y: 175 };

  return (
    <div 
      ref={mapContainerRef} 
      className={`border border-slate-800 bg-[#111827] rounded p-4 flex flex-col gap-4 relative transition-all duration-300 shadow-md ${
        isFullscreen ? "h-screen w-screen p-8 bg-[#050811] z-50 rounded-none border-none" : ""
      }`}
    >
      {/* Map SVG Wrapper */}
      <div className="relative border border-slate-900 bg-[#060913] rounded overflow-hidden aspect-video flex items-center justify-center p-1">
        <svg
          viewBox={`0 0 ${mapWidth} ${mapHeight}`}
          className="w-full h-full text-slate-900 select-none font-mono"
        >
          {/* 1. Static Grids */}
          <MapGrid width={mapWidth} height={mapHeight} />

          {/* 2. Geofence Areas layer - disabled for Level 2 */}
          {/* {showGeofence && <MapGeofence projectCoords={projectCoords} />} */}

          {/* 3. Waypoints & Route Overlays layer - disabled for Level 2 */}
          {/* {showRoutes && routes.map((route) => {
            // Map waypoints to projected points
            const projectedPoints = route.waypoints.map(wp => projectCoords(wp.latitude, wp.longitude));
            
            // Choose color class based on route name/assignment
            const colorClass = route.id === "route-1" ? "stroke-cyan-500/25" : "stroke-emerald-500/25";

            return (
              <g key={route.id}>
                <MapRoute points={projectedPoints} colorClass={colorClass} dashed={true} />

                {route.waypoints.map((wp) => {
                  const xy = projectCoords(wp.latitude, wp.longitude);
                  return (
                    <MapWaypoint 
                      key={wp.id}
                      x={xy.x}
                      y={xy.y}
                      name={wp.name}
                      type={wp.type}
                      priority={wp.priority}
                      description={wp.description}
                      notes={wp.notes}
                    />
                  );
                })}
              </g>
            );
          })} */}

          {/* 4. Active Transmission Radar Pulses */}
          {motherRover && <RadarPulse cx={motherXY.x} cy={motherXY.y} colorClass="stroke-cyan-500" />}
          {scoutRovers
            .filter(s => s.status.toLowerCase() === "exploring" || s.status.toLowerCase() === "deployed" || s.status.toLowerCase() === "active")
            .map(s => {
              const xy = projectCoords(s.latitude, s.longitude);
              return <RadarPulse key={s.id} cx={xy.x} cy={xy.y} colorClass="stroke-emerald-500" />;
            })
          }

          {/* 5. Rover Vehicle Markers */}
          {virtualRovers
            .filter(r => r.status.toLowerCase() !== "offline")
            .map(rover => {
              const xy = projectCoords(rover.latitude, rover.longitude);
              const isTargeted = selectedRoverId === rover.id;
              
              return (
                <g key={rover.id} className={isTargeted ? "scale-110 origin-center transition" : ""}>
                  <MapMarker 
                    x={xy.x}
                    y={xy.y}
                    name={rover.id.toUpperCase()}
                    type={rover.type}
                    status={rover.status}
                    battery={rover.battery}
                    signal={rover.signal}
                  />
                  {isTargeted && (
                    <circle 
                      cx={xy.x} 
                      cy={xy.y} 
                      r="16" 
                      className="fill-none stroke-cyan-400 stroke-[1.5] animate-pulse" 
                    />
                  )}
                </g>
              );
            })
          }
        </svg>

        {/* Floating Layer and Fullscreen Controls */}
        <MapControls 
          isFullscreen={isFullscreen}
          onToggleFullscreen={toggleFullscreen}
          showRoutes={showRoutes}
          onToggleRoutes={() => setShowRoutes(!showRoutes)}
          showGeofence={showGeofence}
          onToggleGeofence={() => setShowGeofence(!showGeofence)}
        />
      </div>

      <div className="text-[10px] text-slate-500 flex items-center gap-2 bg-slate-950/40 px-3 py-2.5 rounded border border-slate-900 leading-normal select-none">
        <Info className="h-4 w-4 text-cyan-400 shrink-0" />
        <span>Operations map overlay system. Toggle overlays or tap coordinate markers to explore rover diagnostic telemetry feeds.</span>
      </div>
    </div>
  );
}
