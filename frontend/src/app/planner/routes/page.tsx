"use client";

import { useState } from "react";
import { useMissionStore } from "@/store/mission-store";
import { Route, Waypoint, WaypointType } from "@/domain/routes/types";
import { Button } from "@/components/ui/button";
import { Map, Plus, Trash2, ArrowUp, ArrowDown, Info, Route as RouteIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export default function RoutePlannerPage() {
  const { routes, addRoute, addWaypoint, removeWaypoint, reorderWaypoints } = useMissionStore();

  const [selectedRouteId, setSelectedRouteId] = useState<string>(routes[0]?.id || "");
  const [newRouteName, setNewRouteName] = useState("");
  const [showCreateRoute, setShowCreateRoute] = useState(false);

  // Form States for clicking canvas to add waypoint
  const [isAddingWp, setIsAddingWp] = useState(false);
  const [clickCoords, setClickCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [wpName, setWpName] = useState("");
  const [wpType, setWpType] = useState<WaypointType>("SCAN");
  const [wpPriority, setWpPriority] = useState<"LOW" | "MEDIUM" | "HIGH">("MEDIUM");
  const [wpDesc, setWpDesc] = useState("");

  const activeRoute = routes.find(r => r.id === selectedRouteId);

  const mapWidth = 600;
  const mapHeight = 350;

  const projectCoords = (lat: number, lon: number) => {
    const minLat = 18.60;
    const maxLat = 18.70;
    const minLon = 226.10;
    const maxLon = 226.30;

    const x = ((lon - minLon) / (maxLon - minLon)) * mapWidth;
    const y = mapHeight - ((lat - minLat) / (maxLat - minLat)) * mapHeight;

    return { x, y };
  };

  const handleCanvasClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!selectedRouteId) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Project pixel coords back to SVG grid scale (600x350)
    const svgX = (clickX / rect.width) * mapWidth;
    const svgY = (clickY / rect.height) * mapHeight;

    const minLat = 18.60;
    const maxLat = 18.70;
    const minLon = 226.10;
    const maxLon = 226.30;

    // Reverse projection formulas
    const lon = parseFloat((minLon + (svgX / mapWidth) * (maxLon - minLon)).toFixed(5));
    const lat = parseFloat((minLat + ((mapHeight - svgY) / mapHeight) * (maxLat - minLat)).toFixed(5));

    setClickCoords({ lat, lon });
    setWpName(`WP-Site-${(activeRoute?.waypoints.length || 0) + 1}`);
    setIsAddingWp(true);
  };

  const handleAddRoute = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRouteName.trim()) return;

    const newId = addRoute(newRouteName);
    setSelectedRouteId(newId);
    setNewRouteName("");
    setShowCreateRoute(false);
  };

  const handleAddWaypointSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clickCoords || !selectedRouteId) return;

    addWaypoint(selectedRouteId, {
      name: wpName,
      latitude: clickCoords.lat,
      longitude: clickCoords.lon,
      type: wpType,
      priority: wpPriority,
      description: wpDesc,
      notes: wpDesc
    });

    setIsAddingWp(false);
    setClickCoords(null);
    setWpDesc("");
  };

  const handleMoveWaypoint = (idx: number, direction: "up" | "down") => {
    if (!activeRoute) return;
    const nextWps = [...activeRoute.waypoints];
    const targetIdx = direction === "up" ? idx - 1 : idx + 1;

    if (targetIdx < 0 || targetIdx >= nextWps.length) return;

    // Swap
    const temp = nextWps[idx];
    nextWps[idx] = nextWps[targetIdx];
    nextWps[targetIdx] = temp;

    reorderWaypoints(selectedRouteId, nextWps);
  };

  const renderIcon = (type: WaypointType, x: number, y: number) => {
    switch (type) {
      case "SCAN":
        return <circle cx={x} cy={y} r="4" className="stroke-cyan-400 fill-none" strokeWidth="1" />;
      case "COLLECT":
        return <rect x={x - 3} y={y - 3} width="6" height="6" className="stroke-emerald-400 fill-none" strokeWidth="1" />;
      case "RELAY":
        return <polygon points={`${x},${y-4} ${x-3.5},${y+3} ${x+3.5},${y+3}`} className="stroke-amber-400 fill-none" strokeWidth="1" />;
      case "OBSERVE":
        return <circle cx={x} cy={y} r="3" className="fill-purple-400" />;
      case "RETURN":
      default:
        return <path d={`M ${x-2} ${y-4} L ${x+3} ${y-2} L ${x-2} ${y} Z`} className="stroke-rose-400 fill-rose-400/20" strokeWidth="1" />;
    }
  };

  return (
    <div className="space-y-6 font-mono text-slate-100 animate-fade-in">
      {/* Header */}
      <div className="p-4 rounded border border-slate-800 bg-[#111827] flex items-center justify-between shadow-lg select-none">
        <div className="flex items-center gap-3">
          <RouteIcon className="h-5 w-5 text-cyan-400" />
          <div>
            <div className="text-[10px] text-slate-500 tracking-wider font-bold">FLIGHT NAVIGATION CONSOLE</div>
            <h1 className="text-sm font-black tracking-widest text-white uppercase">
              ROUTE_PATHWAY_DESIGNER // WAYPOINT_CONFIG
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedRouteId}
            onChange={(e) => setSelectedRouteId(e.target.value)}
            className="text-[10px] bg-slate-950 border border-slate-800 text-slate-300 p-1.5 rounded focus:outline-none focus:border-cyan-500/40 font-bold"
          >
            <option value="" disabled>Select Route Asset</option>
            {routes.map(r => (
              <option key={r.id} value={r.id}>{r.name.toUpperCase()}</option>
            ))}
          </select>

          <Button
            onClick={() => setShowCreateRoute(!showCreateRoute)}
            className="bg-cyan-500/10 border border-cyan-500/40 text-cyan-400 hover:bg-cyan-500/20 text-[10px] h-8 flex items-center gap-1.5 uppercase cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>New Route</span>
          </Button>
        </div>
      </div>

      {showCreateRoute && (
        <form onSubmit={handleAddRoute} className="p-4 border border-slate-800 bg-[#111827] rounded flex items-center gap-3 max-w-md shadow-md">
          <input
            type="text"
            value={newRouteName}
            onChange={(e) => setNewRouteName(e.target.value)}
            placeholder="Route Name (e.g. Ridge Patrol)"
            className="flex-1 text-[11px] bg-slate-950 border border-slate-850 p-2 rounded focus:outline-none text-slate-200"
            required
          />
          <Button type="submit" className="bg-cyan-500 text-slate-950 text-[10px] h-9 px-4 font-bold cursor-pointer uppercase">
            Create
          </Button>
          <Button type="button" onClick={() => setShowCreateRoute(false)} className="bg-slate-900 text-slate-400 text-[10px] h-9 px-4 cursor-pointer uppercase">
            Cancel
          </Button>
        </form>
      )}

      {/* Main split workarea */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-start">
        
        {/* Interactive Canvas grid */}
        <div className="xl:col-span-3 border border-slate-800 bg-[#111827] rounded p-4 flex flex-col gap-4 relative shadow-md">
          <div className="flex justify-between items-center text-[10px] text-slate-450 border-b border-slate-900 pb-2 select-none">
            <span className="text-cyan-400 font-bold uppercase">CLICK MAP GRID TO PLACE TARGET WAYPOINTS</span>
            <span>BOUNDS: Jezero Delta Sector 5</span>
          </div>

          <div className="relative border border-slate-900 bg-[#060913] rounded overflow-hidden aspect-video flex items-center justify-center p-1">
            <svg
              viewBox={`0 0 ${mapWidth} ${mapHeight}`}
              onClick={handleCanvasClick}
              className="w-full h-full text-slate-900 cursor-crosshair font-mono"
            >
              {/* Grid Background */}
              <defs>
                <pattern id="routeGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(30, 41, 59, 0.35)" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#routeGrid)" />

              {/* Draw connected route path if there are waypoints */}
              {activeRoute && activeRoute.waypoints.length > 1 && (
                <path
                  d={activeRoute.waypoints
                    .map((wp, idx) => {
                      const { x, y } = projectCoords(wp.latitude, wp.longitude);
                      return `${idx === 0 ? "M" : "L"} ${x} ${y}`;
                    })
                    .join(" ")
                  }
                  className="fill-none stroke-cyan-500/40"
                  strokeWidth="1.2"
                  strokeDasharray="4,4"
                />
              )}

              {/* Draw Waypoint markers */}
              {activeRoute && activeRoute.waypoints.map((wp, index) => {
                const { x, y } = projectCoords(wp.latitude, wp.longitude);
                return (
                  <g key={wp.id} className="select-none">
                    <circle cx={x} cy={y} r="10" className="fill-slate-950/80 stroke-cyan-500/20" strokeWidth="1" />
                    {renderIcon(wp.type, x, y)}
                    <text x={x + 10} y={y - 8} className="fill-slate-300 text-[8px] font-bold">{wp.name}</text>
                    <circle cx={x} cy={y} r="1.5" className="fill-cyan-400" />
                  </g>
                );
              })}

              {/* Show coordinates of last cursor click marker */}
              {clickCoords && (() => {
                const { x, y } = projectCoords(clickCoords.lat, clickCoords.lon);
                return (
                  <g className="animate-pulse">
                    <circle cx={x} cy={y} r="6" className="fill-none stroke-rose-500" strokeWidth="1" />
                    <line x1={x - 12} y1={y} x2={x + 12} y2={y} stroke="#EF4444" strokeWidth="0.8" />
                    <line x1={x} y1={y - 12} x2={x} y2={y + 12} stroke="#EF4444" strokeWidth="0.8" />
                  </g>
                );
              })()}
            </svg>

            {/* Click to add Form Overlay */}
            {isAddingWp && clickCoords && (
              <div className="absolute top-4 left-4 p-4 rounded border border-slate-800 bg-[#111827]/95 shadow-2xl z-30 max-w-xs font-mono space-y-3">
                <h4 className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest border-b border-slate-800 pb-1">
                  Draft Waypoint
                </h4>
                
                <div className="text-[8px] text-slate-500">
                  COORDS: LA {clickCoords.lat.toFixed(4)} / LO {clickCoords.lon.toFixed(4)}
                </div>

                <form onSubmit={handleAddWaypointSubmit} className="space-y-2.5 text-[10px]">
                  <div className="space-y-1">
                    <label className="text-[7px] text-slate-400 font-bold block">Label</label>
                    <input
                      type="text"
                      value={wpName}
                      onChange={(e) => setWpName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-850 p-1.5 rounded focus:outline-none text-slate-200 text-[10px]"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-1.5">
                    <div>
                      <label className="text-[7px] text-slate-400 font-bold block">Type</label>
                      <select
                        value={wpType}
                        onChange={(e) => setWpType(e.target.value as any)}
                        className="w-full bg-slate-950 border border-slate-850 p-1 rounded focus:outline-none text-slate-200 text-[9px]"
                      >
                        <option value="SCAN">SCAN</option>
                        <option value="COLLECT">COLLECT</option>
                        <option value="RELAY">RELAY</option>
                        <option value="OBSERVE">OBSERVE</option>
                        <option value="RETURN">RETURN</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[7px] text-slate-400 font-bold block">Priority</label>
                      <select
                        value={wpPriority}
                        onChange={(e) => setWpPriority(e.target.value as any)}
                        className="w-full bg-slate-950 border border-slate-850 p-1 rounded focus:outline-none text-slate-200 text-[9px]"
                      >
                        <option value="LOW">LOW</option>
                        <option value="MEDIUM">MED</option>
                        <option value="HIGH">HIGH</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[7px] text-slate-400 font-bold block">Description Notes</label>
                    <input
                      type="text"
                      value={wpDesc}
                      onChange={(e) => setWpDesc(e.target.value)}
                      placeholder="Observation targets..."
                      className="w-full bg-slate-950 border border-slate-850 p-1.5 rounded focus:outline-none text-slate-200 text-[10px]"
                    />
                  </div>

                  <div className="flex gap-1.5 pt-1">
                    <Button type="submit" className="flex-1 bg-cyan-500 text-slate-950 text-[9px] h-7 font-bold cursor-pointer uppercase">
                      Confirm
                    </Button>
                    <Button type="button" onClick={() => { setIsAddingWp(false); setClickCoords(null); }} className="flex-1 bg-slate-900 text-slate-400 text-[9px] h-7 cursor-pointer uppercase">
                      Cancel
                    </Button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>

        {/* Waypoints list editor sidebar */}
        <div className="xl:col-span-1 space-y-4">
          <div className="p-4 border border-slate-800 bg-[#111827] rounded space-y-3 shadow-md flex flex-col h-[480px]">
            <h3 className="text-xs font-bold text-slate-450 tracking-wider flex items-center gap-1.5 uppercase select-none border-b border-slate-850 pb-2">
              <span>WAYPOINTS_LIST</span>
            </h3>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1 select-none">
              {activeRoute && activeRoute.waypoints.length > 0 ? (
                activeRoute.waypoints.map((wp, idx) => (
                  <div key={wp.id} className="p-2.5 rounded border border-slate-850 bg-slate-950/45 flex items-center justify-between gap-2 text-[9px] hover:border-slate-800 transition">
                    <div className="space-y-1 truncate">
                      <div className="flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 shrink-0"></span>
                        <span className="font-extrabold text-slate-200 uppercase truncate">{wp.name}</span>
                      </div>
                      <div className="text-[7px] text-slate-500">
                        LAT {wp.latitude.toFixed(4)} / LON {wp.longitude.toFixed(4)}
                      </div>
                      <div className="flex gap-1 text-[7px] font-bold">
                        <span className="text-cyan-400">TYPE: {wp.type}</span>
                        <span className="text-slate-500">•</span>
                        <span className="text-slate-400">PRI: {wp.priority}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-0.5 shrink-0">
                      <Button
                        size="icon"
                        disabled={idx === 0}
                        onClick={() => handleMoveWaypoint(idx, "up")}
                        className="h-5 w-5 bg-slate-900 border border-slate-850 hover:bg-slate-850 text-slate-400 disabled:opacity-40 cursor-pointer"
                      >
                        <ArrowUp className="h-3 w-3" />
                      </Button>
                      <Button
                        size="icon"
                        disabled={idx === activeRoute.waypoints.length - 1}
                        onClick={() => handleMoveWaypoint(idx, "down")}
                        className="h-5 w-5 bg-slate-900 border border-slate-850 hover:bg-slate-850 text-slate-400 disabled:opacity-40 cursor-pointer"
                      >
                        <ArrowDown className="h-3 w-3" />
                      </Button>
                      <Button
                        size="icon"
                        onClick={() => removeWaypoint(selectedRouteId, wp.id)}
                        className="h-5 w-5 bg-rose-500/10 border border-rose-500/20 text-rose-450 hover:bg-rose-500/20 cursor-pointer"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center text-slate-600 text-[10px] leading-relaxed border border-dashed border-slate-850 rounded p-4">
                  <Info className="h-5 w-5 text-slate-700 mb-1.5" />
                  NO WAYPOINTS ADDED TO THIS ROUTE. CLICK ON THE MAP CANVAS TO DEFINE PATHWAY SITES.
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
