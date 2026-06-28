"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  ArrowUp, 
  ArrowDown, 
  ArrowLeft, 
  ArrowRight, 
  Square, 
  Gauge, 
  Radio, 
  Keyboard, 
  Navigation,
  Compass
} from "lucide-react";
import { Button } from "../ui/button";
import { AresWebSocketClient } from "@/services/websocket/websocketClient";
import { useConnectionStore } from "@/store/connection-store";
import { useMissionStore } from "@/store/mission-store";
import { cn } from "@/lib/utils";

export default function RoverController() {
  const { connectionStatus } = useConnectionStore();
  const { addLog, isEmergencyStop } = useMissionStore();
  
  const [controlMode, setControlMode] = useState<"manual" | "auto">("manual");
  const [speed, setSpeed] = useState<number>(0.5);
  const [lastCommand, setLastCommand] = useState<string>("NONE");
  const [isKeyboardActive, setIsKeyboardActive] = useState<boolean>(true);

  // Tracks active key presses for visual feedback
  const [activeKeys, setActiveKeys] = useState<{ [key: string]: boolean }>({
    w: false,
    a: false,
    s: false,
    d: false,
    Space: false
  });

  const wsClientRef = useRef<AresWebSocketClient | null>(null);

  useEffect(() => {
    wsClientRef.current = AresWebSocketClient.getInstance();
  }, []);

  const sendRoverCommand = (command: string, value?: any) => {
    if (isEmergencyStop) {
      addLog("Rover Controller", "SYSTEM", "WARNING", "Command blocked: Emergency Stop (ABORT) active!");
      return;
    }

    if (connectionStatus !== "connected") {
      addLog("Rover Controller", "SYSTEM", "WARNING", "Command failed: No DSN link connection.");
      return;
    }

    if (wsClientRef.current) {
      wsClientRef.current.send({
        type: "rover_command",
        command,
        value
      });
      
      let logDesc = "";
      if (command === "move") {
        logDesc = `Manual vector drive: MOVE ${String(value).toUpperCase()} at base velocity`;
      } else if (command === "stop") {
        logDesc = `Manual vector drive: STOP / DE-ACCELERATE`;
      } else if (command === "speed") {
        logDesc = `Manual speed throttle set to ${value} m/s`;
      }

      setLastCommand(`${command.toUpperCase()}${value ? ` (${value})` : ""}`);
      addLog("Rover Controller", "COMMS", "INFO", logDesc);
    }
  };

  // Keyboard Event Listeners
  useEffect(() => {
    if (!isKeyboardActive || isEmergencyStop || connectionStatus !== "connected") return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (["w", "arrowup"].includes(key)) {
        e.preventDefault();
        if (!activeKeys.w) {
          setActiveKeys(prev => ({ ...prev, w: true }));
          sendRoverCommand("move", "forward");
        }
      } else if (["s", "arrowdown"].includes(key)) {
        e.preventDefault();
        if (!activeKeys.s) {
          setActiveKeys(prev => ({ ...prev, s: true }));
          sendRoverCommand("move", "backward");
        }
      } else if (["a", "arrowleft"].includes(key)) {
        e.preventDefault();
        if (!activeKeys.a) {
          setActiveKeys(prev => ({ ...prev, a: true }));
          sendRoverCommand("move", "left");
        }
      } else if (["d", "arrowright"].includes(key)) {
        e.preventDefault();
        if (!activeKeys.d) {
          setActiveKeys(prev => ({ ...prev, d: true }));
          sendRoverCommand("move", "right");
        }
      } else if (e.code === "Space" || key === " ") {
        e.preventDefault();
        if (!activeKeys.Space) {
          setActiveKeys(prev => ({ ...prev, Space: true }));
          sendRoverCommand("stop");
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (["w", "arrowup"].includes(key)) {
        setActiveKeys(prev => ({ ...prev, w: false }));
      } else if (["s", "arrowdown"].includes(key)) {
        setActiveKeys(prev => ({ ...prev, s: false }));
      } else if (["a", "arrowleft"].includes(key)) {
        setActiveKeys(prev => ({ ...prev, a: false }));
      } else if (["d", "arrowright"].includes(key)) {
        setActiveKeys(prev => ({ ...prev, d: false }));
      } else if (e.code === "Space" || key === " ") {
        setActiveKeys(prev => ({ ...prev, Space: false }));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [isKeyboardActive, activeKeys, isEmergencyStop, connectionStatus]);

  const handleSpeedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const targetSpeed = parseFloat(e.target.value);
    setSpeed(targetSpeed);
    sendRoverCommand("speed", targetSpeed);
  };

  return (
    <div className="relative overflow-hidden rounded border border-slate-800 bg-[#111827] shadow-lg flex flex-col select-none font-mono">
      {/* Header Banner */}
      <div className="border-b border-slate-800 bg-slate-900/90 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Navigation className="h-4 w-4 text-cyan-400 animate-pulse" />
          <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest">
            ROVER VECTOR FLIGHT CONTROL
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setControlMode(controlMode === "manual" ? "auto" : "manual")}
            className={cn(
              "text-[8px] h-5 px-2 font-bold rounded border uppercase tracking-wider",
              controlMode === "manual" 
                ? "border-cyan-500/30 bg-cyan-950/20 text-cyan-400" 
                : "border-emerald-500/30 bg-emerald-950/20 text-emerald-400"
            )}
          >
            {controlMode.toUpperCase()} PILOT
          </Button>
          
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsKeyboardActive(!isKeyboardActive)}
            title="Toggle WASD Keyboard Controls"
            className={cn(
              "text-[8px] h-5 px-2 font-bold rounded border uppercase tracking-wider flex items-center gap-1",
              isKeyboardActive 
                ? "border-amber-500/30 bg-amber-950/20 text-amber-400" 
                : "border-slate-800 bg-slate-955 text-slate-500"
            )}
          >
            <Keyboard className="h-2.5 w-2.5" />
            <span>{isKeyboardActive ? "KEY_ON" : "KEY_OFF"}</span>
          </Button>
        </div>
      </div>

      {/* Main Control Panel Layout */}
      <div className="p-4 space-y-4">
        {/* Speed & Mode Info */}
        <div className="grid grid-cols-2 gap-3 text-[9px] text-slate-400">
          <div className="bg-slate-950/60 p-2 rounded border border-slate-900/80 flex flex-col justify-between">
            <span className="text-slate-500 uppercase tracking-widest font-bold">LAST DIRECTIVE</span>
            <span className="text-slate-200 mt-1 font-bold truncate">{lastCommand}</span>
          </div>
          <div className="bg-slate-950/60 p-2 rounded border border-slate-900/80 flex flex-col justify-between">
            <span className="text-slate-500 uppercase tracking-widest font-bold">DSN SIGNAL LINK</span>
            <span className={cn(
              "font-bold mt-1",
              connectionStatus === "connected" ? "text-cyan-400" : "text-rose-500"
            )}>
              {connectionStatus === "connected" ? "STABLE LOCK" : "NO LINK"}
            </span>
          </div>
        </div>

        {/* Tactical D-Pad Interface */}
        <div className="flex flex-col items-center justify-center py-2">
          <div className="relative w-36 h-36 bg-slate-950/80 rounded-full border border-slate-800 p-1 flex items-center justify-center">
            {/* Compass Heading Indicator Lines */}
            <div className="absolute inset-0 rounded-full border border-dashed border-cyan-500/10 pointer-events-none"></div>
            
            {/* Forward Button */}
            <button
              onClick={() => sendRoverCommand("move", "forward")}
              className={cn(
                "absolute top-2 w-10 h-10 rounded border flex items-center justify-center transition-all cursor-pointer",
                activeKeys.w
                  ? "bg-cyan-500 text-white border-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.6)]"
                  : "bg-slate-900/90 text-slate-400 border-slate-800 hover:text-cyan-400 hover:border-cyan-500/40"
              )}
              title="Move Forward (W / Up Arrow)"
            >
              <ArrowUp className="h-4 w-4" />
            </button>

            {/* Turn Left Button */}
            <button
              onClick={() => sendRoverCommand("move", "left")}
              className={cn(
                "absolute left-2 w-10 h-10 rounded border flex items-center justify-center transition-all cursor-pointer",
                activeKeys.a
                  ? "bg-cyan-500 text-white border-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.6)]"
                  : "bg-slate-900/90 text-slate-400 border-slate-800 hover:text-cyan-400 hover:border-cyan-500/40"
              )}
              title="Turn Left (A / Left Arrow)"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>

            {/* STOP / BRAKE Button (Center) */}
            <button
              onClick={() => sendRoverCommand("stop")}
              className={cn(
                "w-12 h-12 rounded-full border flex flex-col items-center justify-center transition-all cursor-pointer font-black text-[9px] tracking-wide",
                activeKeys.Space
                  ? "bg-rose-600 text-white border-rose-500 shadow-[0_0_12px_rgba(239,68,68,0.7)]"
                  : "bg-slate-900 text-rose-500 border-rose-950/60 hover:bg-rose-950/20 hover:border-rose-600"
              )}
              title="Emergency Stop (Space)"
            >
              <Square className="h-3.5 w-3.5 fill-current" />
            </button>

            {/* Turn Right Button */}
            <button
              onClick={() => sendRoverCommand("move", "right")}
              className={cn(
                "absolute right-2 w-10 h-10 rounded border flex items-center justify-center transition-all cursor-pointer",
                activeKeys.d
                  ? "bg-cyan-500 text-white border-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.6)]"
                  : "bg-slate-900/90 text-slate-400 border-slate-800 hover:text-cyan-400 hover:border-cyan-500/40"
              )}
              title="Turn Right (D / Right Arrow)"
            >
              <ArrowRight className="h-4 w-4" />
            </button>

            {/* Backward Button */}
            <button
              onClick={() => sendRoverCommand("move", "backward")}
              className={cn(
                "absolute bottom-2 w-10 h-10 rounded border flex items-center justify-center transition-all cursor-pointer",
                activeKeys.s
                  ? "bg-cyan-500 text-white border-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.6)]"
                  : "bg-slate-900/90 text-slate-400 border-slate-800 hover:text-cyan-400 hover:border-cyan-500/40"
              )}
              title="Move Backward (S / Down Arrow)"
            >
              <ArrowDown className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Speed Throttle Slider */}
        <div className="space-y-1.5 pt-1">
          <div className="flex justify-between items-center text-[9px] text-slate-400">
            <span className="flex items-center gap-1 font-bold uppercase">
              <Gauge className="h-3 w-3 text-cyan-400" />
              VELOCITY SETTING (THROTTLE)
            </span>
            <span className="font-extrabold text-cyan-400">{speed.toFixed(1)} m/s</span>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min="0.0"
              max="2.0"
              step="0.1"
              value={speed}
              onChange={handleSpeedChange}
              disabled={controlMode === "auto"}
              className="w-full h-1 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-cyan-500 border border-slate-800/80 disabled:opacity-30 disabled:cursor-not-allowed"
            />
          </div>
        </div>

        {/* Help tooltip */}
        <div className="text-[7.5px] text-slate-500 leading-normal border-t border-slate-900 pt-2 flex items-center gap-1.5">
          <Radio className="h-3 w-3 text-amber-500/80 shrink-0" />
          <span>Use WASD keys on your keyboard for drive controls. SPACEBAR triggers deceleration brake.</span>
        </div>
      </div>
    </div>
  );
}
