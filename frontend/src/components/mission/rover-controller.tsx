"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  ArrowUp, 
  ArrowDown, 
  ArrowLeft, 
  ArrowRight, 
  ArrowUpLeft,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowDownRight,
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
  const { addLog, isEmergencyStop, rovers } = useMissionStore();
  
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
    wl: false,
    wr: false,
    sl: false,
    sr: false,
    Space: false
  });

  const wsClientRef = useRef<AresWebSocketClient | null>(null);
  const pressedKeysRef = useRef<Set<string>>(new Set());
  const lastSentCommandRef = useRef<string>("stop");

  const motherRover = rovers.find(r => r.id === "mother-rover" || r.type === "mother");

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

  const updateMovement = () => {
    const keys = pressedKeysRef.current;
    let nextDir: string | null = null;

    const w = keys.has("w") || keys.has("arrowup");
    const s = keys.has("s") || keys.has("arrowdown");
    const a = keys.has("a") || keys.has("arrowleft");
    const d = keys.has("d") || keys.has("arrowright");

    if (w) {
      if (a) nextDir = "forward-left";
      else if (d) nextDir = "forward-right";
      else nextDir = "forward";
    } else if (s) {
      if (a) nextDir = "backward-left";
      else if (d) nextDir = "backward-right";
      else nextDir = "backward";
    } else if (a) {
      nextDir = "left";
    } else if (d) {
      nextDir = "right";
    }

    if (nextDir) {
      if (lastSentCommandRef.current !== nextDir) {
        lastSentCommandRef.current = nextDir;
        sendRoverCommand("move", nextDir);
      }
    } else {
      if (lastSentCommandRef.current !== "stop") {
        lastSentCommandRef.current = "stop";
        sendRoverCommand("stop");
      }
    }
  };

  // Keyboard Event Listeners
  useEffect(() => {
    if (!isKeyboardActive || isEmergencyStop || connectionStatus !== "connected") return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (["w", "s", "a", "d", "arrowup", "arrowdown", "arrowleft", "arrowright", " "].includes(key) || e.code === "Space") {
        e.preventDefault();
        
        if (key === " " || e.code === "Space") {
          if (!pressedKeysRef.current.has("space")) {
            pressedKeysRef.current.add("space");
            setActiveKeys(prev => ({ ...prev, Space: true }));
            if (lastSentCommandRef.current !== "stop") {
              lastSentCommandRef.current = "stop";
              sendRoverCommand("stop");
            }
          }
          return;
        }

        const mapKey = ["arrowup", "w"].includes(key) ? "w" :
                       ["arrowdown", "s"].includes(key) ? "s" :
                       ["arrowleft", "a"].includes(key) ? "a" : "d";

        if (!pressedKeysRef.current.has(key)) {
          pressedKeysRef.current.add(key);
          setActiveKeys(prev => ({ ...prev, [mapKey]: true }));
          updateMovement();
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (["w", "s", "a", "d", "arrowup", "arrowdown", "arrowleft", "arrowright", " "].includes(key) || e.code === "Space") {
        e.preventDefault();
        
        if (key === " " || e.code === "Space") {
          pressedKeysRef.current.delete("space");
          setActiveKeys(prev => ({ ...prev, Space: false }));
          return;
        }

        const mapKey = ["arrowup", "w"].includes(key) ? "w" :
                       ["arrowdown", "s"].includes(key) ? "s" :
                       ["arrowleft", "a"].includes(key) ? "a" : "d";

        pressedKeysRef.current.delete(key);
        setActiveKeys(prev => ({ ...prev, [mapKey]: false }));
        updateMovement();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      // Reset keys on unmount/deactivation
      pressedKeysRef.current.clear();
      setActiveKeys({ w: false, a: false, s: false, d: false, Space: false });
    };
  }, [isKeyboardActive, isEmergencyStop, connectionStatus]);

  const handleSpeedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const targetSpeed = parseFloat(e.target.value);
    setSpeed(targetSpeed);
    sendRoverCommand("speed", targetSpeed);
  };

  const handleButtonPress = (dir: string, mapKey: string) => {
    setActiveKeys(prev => ({ ...prev, [mapKey]: true }));
    sendRoverCommand("move", dir);
  };

  const handleButtonRelease = (mapKey: string) => {
    setActiveKeys(prev => ({ ...prev, [mapKey]: false }));
    sendRoverCommand("stop");
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
              onMouseDown={() => handleButtonPress("forward", "w")}
              onMouseUp={() => handleButtonRelease("w")}
              onMouseLeave={() => handleButtonRelease("w")}
              onTouchStart={() => handleButtonPress("forward", "w")}
              onTouchEnd={() => handleButtonRelease("w")}
              onTouchCancel={() => handleButtonRelease("w")}
              className={cn(
                "absolute top-1 w-9 h-9 rounded border flex items-center justify-center transition-all cursor-pointer select-none touch-none z-10",
                activeKeys.w
                  ? "bg-cyan-500 text-white border-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.6)]"
                  : "bg-slate-900/90 text-slate-400 border-slate-800 hover:text-cyan-400 hover:border-cyan-500/40"
              )}
              title="Move Forward (W / Up Arrow)"
            >
              <ArrowUp className="h-4 w-4" />
            </button>

            {/* Top Left (Forward Left) */}
            <button
              onMouseDown={() => handleButtonPress("forward-left", "wl")}
              onMouseUp={() => handleButtonRelease("wl")}
              onMouseLeave={() => handleButtonRelease("wl")}
              onTouchStart={() => handleButtonPress("forward-left", "wl")}
              onTouchEnd={() => handleButtonRelease("wl")}
              onTouchCancel={() => handleButtonRelease("wl")}
              className={cn(
                "absolute top-5 left-5 w-8 h-8 rounded border flex items-center justify-center transition-all cursor-pointer select-none touch-none z-10",
                activeKeys.wl
                  ? "bg-cyan-500 text-white border-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.6)]"
                  : "bg-slate-900/90 text-slate-400 border-slate-800 hover:text-cyan-400 hover:border-cyan-500/40"
              )}
              title="Forward Left"
            >
              <ArrowUpLeft className="h-3.5 w-3.5" />
            </button>

            {/* Top Right (Forward Right) */}
            <button
              onMouseDown={() => handleButtonPress("forward-right", "wr")}
              onMouseUp={() => handleButtonRelease("wr")}
              onMouseLeave={() => handleButtonRelease("wr")}
              onTouchStart={() => handleButtonPress("forward-right", "wr")}
              onTouchEnd={() => handleButtonRelease("wr")}
              onTouchCancel={() => handleButtonRelease("wr")}
              className={cn(
                "absolute top-5 right-5 w-8 h-8 rounded border flex items-center justify-center transition-all cursor-pointer select-none touch-none z-10",
                activeKeys.wr
                  ? "bg-cyan-500 text-white border-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.6)]"
                  : "bg-slate-900/90 text-slate-400 border-slate-800 hover:text-cyan-400 hover:border-cyan-500/40"
              )}
              title="Forward Right"
            >
              <ArrowUpRight className="h-3.5 w-3.5" />
            </button>

            {/* Turn Left Button */}
            <button
              onMouseDown={() => handleButtonPress("left", "a")}
              onMouseUp={() => handleButtonRelease("a")}
              onMouseLeave={() => handleButtonRelease("a")}
              onTouchStart={() => handleButtonPress("left", "a")}
              onTouchEnd={() => handleButtonRelease("a")}
              onTouchCancel={() => handleButtonRelease("a")}
              className={cn(
                "absolute left-1 w-9 h-9 rounded border flex items-center justify-center transition-all cursor-pointer select-none touch-none z-10",
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
                "w-12 h-12 rounded-full border flex flex-col items-center justify-center transition-all cursor-pointer font-black text-[9px] tracking-wide select-none z-20",
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
              onMouseDown={() => handleButtonPress("right", "d")}
              onMouseUp={() => handleButtonRelease("d")}
              onMouseLeave={() => handleButtonRelease("d")}
              onTouchStart={() => handleButtonPress("right", "d")}
              onTouchEnd={() => handleButtonRelease("d")}
              onTouchCancel={() => handleButtonRelease("d")}
              className={cn(
                "absolute right-1 w-9 h-9 rounded border flex items-center justify-center transition-all cursor-pointer select-none touch-none z-10",
                activeKeys.d
                  ? "bg-cyan-500 text-white border-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.6)]"
                  : "bg-slate-900/90 text-slate-400 border-slate-800 hover:text-cyan-400 hover:border-cyan-500/40"
              )}
              title="Turn Right (D / Right Arrow)"
            >
              <ArrowRight className="h-4 w-4" />
            </button>

            {/* Bottom Left (Backward Left) */}
            <button
              onMouseDown={() => handleButtonPress("backward-left", "sl")}
              onMouseUp={() => handleButtonRelease("sl")}
              onMouseLeave={() => handleButtonRelease("sl")}
              onTouchStart={() => handleButtonPress("backward-left", "sl")}
              onTouchEnd={() => handleButtonRelease("sl")}
              onTouchCancel={() => handleButtonRelease("sl")}
              className={cn(
                "absolute bottom-5 left-5 w-8 h-8 rounded border flex items-center justify-center transition-all cursor-pointer select-none touch-none z-10",
                activeKeys.sl
                  ? "bg-cyan-500 text-white border-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.6)]"
                  : "bg-slate-900/90 text-slate-400 border-slate-800 hover:text-cyan-400 hover:border-cyan-500/40"
              )}
              title="Backward Left"
            >
              <ArrowDownLeft className="h-3.5 w-3.5" />
            </button>

            {/* Bottom Right (Backward Right) */}
            <button
              onMouseDown={() => handleButtonPress("backward-right", "sr")}
              onMouseUp={() => handleButtonRelease("sr")}
              onMouseLeave={() => handleButtonRelease("sr")}
              onTouchStart={() => handleButtonPress("backward-right", "sr")}
              onTouchEnd={() => handleButtonRelease("sr")}
              onTouchCancel={() => handleButtonRelease("sr")}
              className={cn(
                "absolute bottom-5 right-5 w-8 h-8 rounded border flex items-center justify-center transition-all cursor-pointer select-none touch-none z-10",
                activeKeys.sr
                  ? "bg-cyan-500 text-white border-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.6)]"
                  : "bg-slate-900/90 text-slate-400 border-slate-800 hover:text-cyan-400 hover:border-cyan-500/40"
              )}
              title="Backward Right"
            >
              <ArrowDownRight className="h-3.5 w-3.5" />
            </button>

            {/* Backward Button */}
            <button
              onMouseDown={() => handleButtonPress("backward", "s")}
              onMouseUp={() => handleButtonRelease("s")}
              onMouseLeave={() => handleButtonRelease("s")}
              onTouchStart={() => handleButtonPress("backward", "s")}
              onTouchEnd={() => handleButtonRelease("s")}
              onTouchCancel={() => handleButtonRelease("s")}
              className={cn(
                "absolute bottom-1 w-9 h-9 rounded border flex items-center justify-center transition-all cursor-pointer select-none touch-none z-10",
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

        {/* IMU Orientation (MPU9250 Integration) */}
        {motherRover && (
          <div className="border-t border-slate-900 pt-3 mt-2 space-y-2 select-none">
            <span className="flex items-center gap-1.5 text-[9px] text-slate-450 font-bold uppercase tracking-widest">
              <Compass className="h-3.5 w-3.5 text-cyan-400" />
              MPU9250 IMU TELEMETRY
            </span>
            <div className="grid grid-cols-3 gap-2 bg-slate-950/60 p-2 rounded border border-slate-900/80 text-[9px] font-mono">
              <div className="flex flex-col items-center justify-center border-r border-slate-900/80">
                <span className="text-[7px] text-slate-500 font-bold uppercase">PITCH</span>
                <span className="font-extrabold text-cyan-400 tracking-wide mt-0.5">
                  {motherRover.pitch !== undefined ? `${Number(motherRover.pitch).toFixed(1)}°` : "0.0°"}
                </span>
              </div>
              <div className="flex flex-col items-center justify-center border-r border-slate-900/80">
                <span className="text-[7px] text-slate-500 font-bold uppercase">ROLL</span>
                <span className="font-extrabold text-cyan-400 tracking-wide mt-0.5">
                  {motherRover.roll !== undefined ? `${Number(motherRover.roll).toFixed(1)}°` : "0.0°"}
                </span>
              </div>
              <div className="flex flex-col items-center justify-center">
                <span className="text-[7px] text-slate-500 font-bold uppercase">YAW / HDG</span>
                <span className="font-extrabold text-cyan-400 tracking-wide mt-0.5">
                  {motherRover.heading !== undefined ? `${Number(motherRover.heading).toFixed(1)}°` : "0.0°"}
                </span>
              </div>
            </div>
            {/* Attitude horizon indicator */}
            <div className="h-10 bg-slate-950/90 rounded border border-slate-900/80 overflow-hidden relative flex items-center justify-center">
              <div 
                className="absolute w-full h-[1.5px] bg-cyan-500/40 shadow-[0_0_8px_rgba(6,182,212,0.5)] transition-all duration-100 ease-out"
                style={{
                  transform: `rotate(${motherRover.roll || 0}deg) translateY(${(motherRover.pitch || 0) * 0.4}px)`
                }}
              />
              <div className="absolute h-full w-[1.5px] bg-slate-800/40" />
              <div className="absolute w-2.5 h-2.5 rounded-full border border-cyan-400/60 pointer-events-none flex items-center justify-center">
                <div className="w-0.5 h-0.5 bg-cyan-400 rounded-full" />
              </div>
            </div>
          </div>
        )}

        {/* Help tooltip */}
        <div className="text-[7.5px] text-slate-500 leading-normal border-t border-slate-900 pt-2 flex items-center gap-1.5">
          <Radio className="h-3 w-3 text-amber-500/80 shrink-0" />
          <span>Hold WASD keys or click D-Pad buttons to move. Releasing stops the rover.</span>
        </div>
      </div>
    </div>
  );
}
