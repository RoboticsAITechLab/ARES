"use client";

import { useMissionStore } from "@/store/mission-store";
import { AresWebSocketClient } from "@/services/websocket/websocketClient";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { 
  Radio, 
  Wifi, 
  Battery, 
  Play, 
  Anchor, 
  ShieldAlert, 
  Cpu, 
  Compass, 
  Thermometer, 
  Gauge, 
  Activity
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function ScoutsPage() {
  const { scouts } = useMissionStore();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "text-emerald-400 border-emerald-500/25 bg-emerald-500/10 shadow-[0_0_10px_rgba(16,185,129,0.1)]";
      case "READY_FOR_DEPLOYMENT":
        return "text-cyan-400 border-cyan-500/25 bg-cyan-500/10 animate-pulse";
      case "DOCKED":
        return "text-slate-400 border-slate-800 bg-slate-900/40";
      case "LOST_LINK":
        return "text-amber-500 border-amber-500/25 bg-amber-500/10 animate-pulse";
      case "EMERGENCY_STOP":
        return "text-rose-500 border-rose-500/25 bg-rose-500/10 animate-pulse";
      case "OFFLINE":
      default:
        return "text-rose-455 border-rose-500/25 bg-rose-500/5 animate-pulse";
    }
  };

  const sendCommand = (target: string, command: string, value: any) => {
    try {
      const client = AresWebSocketClient.getInstance();
      client.send({
        type: "rover_command",
        target,
        command,
        value,
        timestamp: Date.now()
      });
    } catch (e) {
      console.error("[ARES UI] WebSocket send failed:", e);
    }
  };

  const handleDeployScout = (id: string) => {
    sendCommand("ARES-MOTHER-01", "deploy", "deployScout");
  };

  const handleSetActive = (id: string) => {
    sendCommand(id, "SET_STATE", "ACTIVE");
  };

  const handleDockScout = (id: string) => {
    sendCommand("ARES-MOTHER-01", "deploy", "retractScout");
  };

  const handleEstop = (id: string) => {
    sendCommand(id, "estop", "");
  };

  const activeScout = scouts[0] || {
    id: "ARES-SCOUT-01",
    name: "ARES-SCOUT-01",
    status: "OFFLINE",
    battery: 0,
    signal: 0,
    temperature: 0,
    speed: 0,
    heading: 0,
    pitch: 0,
    roll: 0,
    obstacleDistance: 0
  };

  return (
    <div className="space-y-6 font-mono text-slate-100 animate-fade-in">
      {/* Page Header */}
      <div className="p-4 rounded border border-slate-800 bg-[#111827] flex items-center justify-between shadow-lg select-none">
        <div className="flex items-center gap-3">
          <Radio className="h-5 w-5 text-cyan-400 animate-pulse" />
          <div>
            <div className="text-[10px] text-slate-500 tracking-wider font-bold">RECONNAISSANCE SYSTEMS DOCK</div>
            <h1 className="text-sm font-black tracking-widest text-white uppercase">
              SCOUT_FLEET_OPERATIONS // LOGISTICS
            </h1>
          </div>
        </div>

        <Link href="/scouts/deploy" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded border border-cyan-500/40 bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 transition font-bold uppercase text-[10px] select-none">
          <Play className="h-3.5 w-3.5" />
          <span>Launch Dispatcher</span>
        </Link>
      </div>

      {/* Main grids */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left Section: Active Scouts list & Live Telemetry Dashboard */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Scout Telemetry Dashboard */}
          <div className="border border-slate-800 bg-[#111827]/80 backdrop-blur-md rounded overflow-hidden shadow-lg p-5 space-y-5">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-xs font-black text-cyan-400 uppercase tracking-widest flex items-center gap-2">
                <Activity className="h-4 w-4 text-cyan-400" />
                Live Telemetry: {activeScout.name}
              </h3>
              <span className={cn("inline-block px-2.5 py-0.5 rounded border text-[9px] font-black uppercase tracking-wider", getStatusColor(activeScout.status))}>
                {activeScout.status}
              </span>
            </div>

            {/* Grid of Gauges */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-3 bg-slate-950/40 border border-slate-850 rounded flex flex-col justify-between h-20">
                <div className="flex justify-between text-[8px] text-slate-500 font-bold">
                  <span>BATTERY</span>
                  <Battery className="h-3.5 w-3.5 text-cyan-505" />
                </div>
                <div className="text-lg font-black text-slate-100 tabular-nums">
                  {activeScout.battery !== undefined ? activeScout.battery.toFixed(1) : 0}%
                </div>
              </div>

              <div className="p-3 bg-slate-950/40 border border-slate-850 rounded flex flex-col justify-between h-20">
                <div className="flex justify-between text-[8px] text-slate-500 font-bold">
                  <span>LINK STRENGTH</span>
                  <Wifi className="h-3.5 w-3.5 text-cyan-505" />
                </div>
                <div className="text-lg font-black text-slate-100 tabular-nums">
                  {activeScout.signal || 0}%
                </div>
              </div>

              <div className="p-3 bg-slate-950/40 border border-slate-850 rounded flex flex-col justify-between h-20">
                <div className="flex justify-between text-[8px] text-slate-500 font-bold">
                  <span>TEMPERATURE</span>
                  <Thermometer className="h-3.5 w-3.5 text-cyan-505" />
                </div>
                <div className="text-lg font-black text-slate-100 tabular-nums">
                  {activeScout.temperature !== undefined ? activeScout.temperature.toFixed(1) : 0}°C
                </div>
              </div>

              <div className="p-3 bg-slate-950/40 border border-slate-850 rounded flex flex-col justify-between h-20">
                <div className="flex justify-between text-[8px] text-slate-500 font-bold">
                  <span>VELOCITY</span>
                  <Gauge className="h-3.5 w-3.5 text-cyan-505" />
                </div>
                <div className="text-lg font-black text-slate-100 tabular-nums">
                  {activeScout.speed !== undefined ? activeScout.speed.toFixed(2) : 0} m/s
                </div>
              </div>
            </div>

            {/* IMU and Sonar */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-950/20 border border-slate-850/80 rounded space-y-3">
                <div className="text-[9px] font-bold text-slate-400 border-b border-slate-900 pb-1 flex items-center gap-1.5">
                  <Compass className="h-3.5 w-3.5 text-cyan-400" />
                  IMU ORIENTATION SENSORS
                </div>
                <div className="grid grid-cols-3 gap-2 text-[10px] font-bold text-slate-300">
                  <div>
                    <span className="block text-[8px] text-slate-500">HEADING</span>
                    <span className="text-slate-100 tabular-nums">{activeScout.heading !== undefined ? activeScout.heading.toFixed(1) : 0}°</span>
                  </div>
                  <div>
                    <span className="block text-[8px] text-slate-500">PITCH</span>
                    <span className="text-slate-100 tabular-nums">{activeScout.pitch !== undefined ? activeScout.pitch.toFixed(1) : 0}°</span>
                  </div>
                  <div>
                    <span className="block text-[8px] text-slate-500">ROLL</span>
                    <span className="text-slate-100 tabular-nums">{activeScout.roll !== undefined ? activeScout.roll.toFixed(1) : 0}°</span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-950/20 border border-slate-850/80 rounded space-y-3">
                <div className="text-[9px] font-bold text-slate-400 border-b border-slate-900 pb-1 flex items-center gap-1.5">
                  <Activity className="h-3.5 w-3.5 text-cyan-400" />
                  HC-SR04 OBSTACLE SONAR
                </div>
                <div className="flex justify-between items-center text-[10px] font-bold text-slate-350">
                  <span>COLLISION DISTANCE:</span>
                  <span className="text-cyan-400 font-extrabold tabular-nums">
                    {activeScout.obstacleDistance !== undefined ? activeScout.obstacleDistance.toFixed(1) : 0} cm
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Section: Human-Assisted Status Controls Sequence */}
        <div className="border border-slate-800 bg-[#111827] rounded overflow-hidden shadow-lg p-4 space-y-5">
          <h3 className="text-xs font-black text-cyan-400 tracking-wider flex items-center gap-1.5 uppercase select-none border-b border-slate-900 pb-2">
            <Cpu className="h-4 w-4 text-cyan-400" />
            Deployment Sequence
          </h3>

          <div className="space-y-4">
            
            {/* Step 1: Deploy */}
            <div className={cn(
              "p-3 rounded border text-[10px] space-y-2.5 transition",
              activeScout.status === "DOCKED"
                ? "bg-cyan-500/5 border-cyan-500/30 text-slate-200"
                : "bg-slate-950/20 border-slate-850 text-slate-500"
            )}>
              <div className="flex justify-between items-center font-bold">
                <span>STAGE 1: ACTUATE LATCH DOOR</span>
                {activeScout.status !== "DOCKED" && <span className="text-emerald-500 text-[8px]">✓ COMPLETED</span>}
              </div>
              <p className="text-[8px] text-slate-400 leading-normal">
                Opens the Mother Rover rear bay latch door and prepares the Scout electronics.
              </p>
              {activeScout.status === "DOCKED" && (
                <Button 
                  onClick={() => handleDeployScout(activeScout.id)} 
                  className="w-full text-[9px] h-8 bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-black uppercase cursor-pointer"
                >
                  Open Door & Deploy
                </Button>
              )}
            </div>

            {/* Step 2: Active */}
            <div className={cn(
              "p-3 rounded border text-[10px] space-y-2.5 transition",
              activeScout.status === "READY_FOR_DEPLOYMENT"
                ? "bg-cyan-500/5 border-cyan-500/30 text-slate-200"
                : "bg-slate-950/20 border-slate-850 text-slate-500"
            )}>
              <div className="flex justify-between items-center font-bold">
                <span>STAGE 2: CONFIRM ACTIVE DEPLOY</span>
                {activeScout.status === "ACTIVE" && <span className="text-emerald-500 text-[8px]">✓ COMPLETED</span>}
              </div>
              <p className="text-[8px] text-slate-400 leading-normal">
                Click this after manually removing the Scout from the Mother bay and placing it on the ground.
              </p>
              {activeScout.status === "READY_FOR_DEPLOYMENT" && (
                <div className="flex gap-2">
                  <Button 
                    onClick={() => handleSetActive(activeScout.id)} 
                    className="flex-1 text-[9px] h-8 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black uppercase cursor-pointer"
                  >
                    Confirm Active
                  </Button>
                  <Button 
                    onClick={() => handleDockScout(activeScout.id)} 
                    className="text-[9px] h-8 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 font-bold uppercase cursor-pointer"
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </div>

            {/* Step 3: Dock */}
            <div className={cn(
              "p-3 rounded border text-[10px] space-y-2.5 transition",
              activeScout.status === "ACTIVE" || activeScout.status === "LOST_LINK" || activeScout.status === "EMERGENCY_STOP"
                ? "bg-cyan-500/5 border-cyan-500/30 text-slate-200"
                : "bg-slate-950/20 border-slate-850 text-slate-500"
            )}>
              <div className="flex justify-between items-center font-bold">
                <span>STAGE 3: RETRACT / DOCK UNIT</span>
              </div>
              <p className="text-[8px] text-slate-400 leading-normal">
                Click this once you have placed the Scout unit back inside the Mother's rear bay. Closes door.
              </p>
              {(activeScout.status === "ACTIVE" || activeScout.status === "LOST_LINK" || activeScout.status === "EMERGENCY_STOP") && (
                <div className="space-y-2">
                  <Button 
                    onClick={() => handleDockScout(activeScout.id)} 
                    className="w-full text-[9px] h-8 bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-black uppercase cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Anchor className="h-3.5 w-3.5" />
                    Dock Scout (Close Door)
                  </Button>
                  <Button 
                    onClick={() => handleEstop(activeScout.id)} 
                    className="w-full text-[9px] h-8 bg-rose-500 hover:bg-rose-600 text-white font-black uppercase cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <ShieldAlert className="h-3.5 w-3.5" />
                    EMERGENCY STOP SCOUT
                  </Button>
                </div>
              )}
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
}
