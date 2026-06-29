"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  Cpu, Activity, RefreshCw, AlertTriangle, ShieldCheck, 
  Terminal, Settings, Play, Database, Server, Sliders, 
  FileText, ArrowDown, ChevronRight, CheckCircle2, XCircle
} from "lucide-react";
import { useConnectionStore } from "@/store/connection-store";
import { useMissionStore } from "@/store/mission-store";

interface RoverData {
  id: string;
  name: string;
  type: string;
  status: string;
  battery: number;
  signal: number;
  temperature: number;
  firmwareVersion: string;
  targetVersion: string | null;
  updateChannel: string;
  bootReason: string;
  lastCrash: string | null;
  rollbackCount: number;
  otaStatus: string;
  safeMode: boolean;
  group: string;
  healthState: string;
  updateWindow: string;
  allowMissionUpdate: boolean;
}

interface LogLine {
  level: "INFO" | "WARNING" | "ERROR" | "DEBUG";
  message: string;
  timestamp: number;
}

interface RoverEvent {
  id: number;
  roverId: string;
  eventType: string;
  message: string;
  timestamp: string;
}

export default function OtaControlCenter() {
  const { connectionStatus } = useConnectionStore();
  const { fleet } = useMissionStore();
  
  // State management
  const [rovers, setRovers] = useState<RoverData[]>([]);
  const [selectedRoverId, setSelectedRoverId] = useState<string>("mother-rover");
  const [rolloutMode, setRolloutMode] = useState<"single" | "group" | "fleet">("single");
  const [rolloutTarget, setRolloutTarget] = useState<string>("mother-rover");
  const [targetVersion, setTargetVersion] = useState<string>("1.3.0");
  const [updateChannel, setUpdateChannel] = useState<string>("stable");
  
  // Config state
  const [motorSpeed, setMotorSpeed] = useState<number>(60);
  const [servoLimits, setServoLimits] = useState<{ min: number; max: number }>({ min: 10, max: 170 });
  const [cameraQuality, setCameraQuality] = useState<string>("high");
  const [sensorsEnabled, setSensorsEnabled] = useState<boolean>(true);
  const [updateWindow, setUpdateWindow] = useState<string>("02:00");
  const [allowMissionUpdate, setAllowMissionUpdate] = useState<boolean>(false);

  // Logs state
  const [logs, setLogs] = useState<LogLine[]>([]);
  const [logFilter, setLogFilter] = useState<string>("ALL");
  const [logSearch, setLogSearch] = useState<string>("");
  const [autoScroll, setAutoScroll] = useState<boolean>(true);
  const logEndRef = useRef<HTMLDivElement>(null);

  // Diagnostics & Timeline states
  const [diagnosticResults, setDiagnosticResults] = useState<any>(null);
  const [diagnosticRunning, setDiagnosticRunning] = useState<boolean>(false);
  const [events, setEvents] = useState<RoverEvent[]>([]);
  const [otaProgress, setOtaProgress] = useState<number>(0);
  const [otaStatus, setOtaStatus] = useState<string>("idle");

  const activeRover = rovers.find(r => r.id === selectedRoverId) || rovers[0];

  // Fetch initial list of rovers
  const fetchRovers = async () => {
    try {
      const res = await fetch("http://localhost:3001/api/ota/rovers");
      if (res.ok) {
        const data = await res.json();
        setRovers(data);
      } else {
        setRovers([]);
      }
    } catch {
      setRovers([]);
    }
  };

  const fetchHistory = async () => {
    if (selectedRoverId === "none" || !selectedRoverId || (selectedRoverId === "mother-rover" && rovers.length === 0)) {
      setEvents([]);
      return;
    }
    try {
      const res = await fetch(`http://localhost:3001/api/ota/history?roverId=${selectedRoverId}`);
      if (res.ok) {
        const data = await res.json();
        setEvents(data);
      }
    } catch (e) {
      setEvents([]);
    }
  };

  useEffect(() => {
    fetchRovers();
  }, []);

  useEffect(() => {
    if (rovers.length > 0) {
      if (selectedRoverId === "none" || !rovers.some(r => r.id === selectedRoverId)) {
        setSelectedRoverId(rovers[0].id);
      }
    } else {
      setSelectedRoverId("none");
    }
  }, [rovers]);

  useEffect(() => {
    fetchHistory();
    const interval = setInterval(() => {
      fetchRovers();
      fetchHistory();
    }, 4000);
    return () => clearInterval(interval);
  }, [selectedRoverId]);

  // Handle incoming live websocket logs & command acknowledgements
  useEffect(() => {
    const handleLiveLog = (e: Event) => {
      const customEvent = e as CustomEvent;
      const log = customEvent.detail;
      setLogs(prev => [...prev, {
        level: log.level,
        message: log.message,
        timestamp: log.timestamp || Date.now()
      }]);
    };

    const handleCommandAck = (e: Event) => {
      const customEvent = e as CustomEvent;
      const ack = customEvent.detail;
      if (ack.command === "diagnostics") {
        setDiagnosticResults(ack.value);
        setDiagnosticRunning(false);
      }
    };

    const handleOtaStatus = (e: Event) => {
      const customEvent = e as CustomEvent;
      const status = customEvent.detail;
      setOtaStatus(status.status);
      setOtaProgress(status.progress);
    };

    window.addEventListener("rover_log", handleLiveLog);
    window.addEventListener("command_ack", handleCommandAck);
    window.addEventListener("ota_status", handleOtaStatus);

    return () => {
      window.removeEventListener("rover_log", handleLiveLog);
      window.removeEventListener("command_ack", handleCommandAck);
      window.removeEventListener("ota_status", handleOtaStatus);
    };
  }, []);

  // Scroll logs to bottom
  useEffect(() => {
    if (autoScroll && logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs, autoScroll]);

  // API triggers
  const triggerReboot = async () => {
    await fetch("http://localhost:3001/api/ota/reboot", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": "Bearer ares_auth_secret" },
      body: JSON.stringify({ roverId: selectedRoverId })
    });
  };

  const triggerRollback = async () => {
    await fetch("http://localhost:3001/api/ota/rollback", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": "Bearer ares_auth_secret" },
      body: JSON.stringify({ roverId: selectedRoverId })
    });
  };

  const triggerFactoryReset = async () => {
    if (confirm("Are you sure you want to trigger a factory reset? This will erase all remote configurations.")) {
      await fetch("http://localhost:3001/api/ota/factory-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": "Bearer ares_auth_secret" },
        body: JSON.stringify({ roverId: selectedRoverId })
      });
    }
  };

  const triggerDiagnostics = async () => {
    setDiagnosticRunning(true);
    setDiagnosticResults(null);
    await fetch("http://localhost:3001/api/ota/diagnostics", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": "Bearer ares_auth_secret" },
      body: JSON.stringify({ roverId: selectedRoverId })
    });
  };

  const triggerStagedUpdate = async () => {
    await fetch("http://localhost:3001/api/ota/rollout", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": "Bearer ares_auth_secret" },
      body: JSON.stringify({
        mode: rolloutMode,
        target: rolloutMode === "single" ? selectedRoverId : rolloutMode === "group" ? rolloutTarget : "all",
        version: targetVersion
      })
    });
    alert(`Rollout command initiated for ${targetVersion}`);
  };

  const saveConfiguration = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("http://localhost:3001/api/ota/config", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": "Bearer ares_auth_secret" },
      body: JSON.stringify({
        roverId: selectedRoverId,
        updateWindow,
        allowMissionUpdate,
        motorSpeed,
        servoLimits,
        cameraQuality,
        sensorEnable: sensorsEnabled
      })
    });
    alert("Configuration parameters transmitted successfully.");
  };

  const downloadLogs = () => {
    const text = logs.map(l => `[${new Date(l.timestamp).toISOString()}] [${l.level}] ${l.message}`).join("\n");
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${selectedRoverId}-logs.txt`;
    a.click();
  };

  const filteredLogs = logs.filter(l => {
    if (logFilter !== "ALL" && l.level !== logFilter) return false;
    if (logSearch && !l.message.toLowerCase().includes(logSearch.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6 font-mono text-xs text-slate-300 select-none animate-fade-in p-6 bg-[#030712] min-h-screen">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row items-center justify-between p-4 border border-cyan-500/20 bg-slate-900/60 rounded backdrop-blur-md">
        <div className="flex items-center gap-3">
          <Cpu className="h-6 w-6 text-cyan-400 animate-pulse" />
          <div>
            <h1 className="text-sm font-black text-white tracking-widest uppercase">ARES FLEET OPERATIONS & OTA GATEWAY</h1>
            <p className="text-[10px] text-slate-500 mt-0.5">SECURE CRYPTOGRAPHIC UPDATE & RECOVERY INFRASTRUCTURE</p>
          </div>
        </div>
        <div className="flex gap-4 mt-4 md:mt-0">
          <div className="bg-slate-950/80 px-3 py-1.5 rounded border border-slate-800">
            <span className="text-[9px] text-slate-500 block uppercase font-bold">ROVER IDENTITY</span>
            <select 
              value={selectedRoverId} 
              onChange={e => setSelectedRoverId(e.target.value)}
              className="bg-transparent text-cyan-400 font-extrabold outline-none border-none cursor-pointer mt-1"
            >
              {rovers.length === 0 ? (
                <option value="none" className="bg-slate-950 text-rose-500 font-bold">NO HARDWARE CONNECTED</option>
              ) : (
                rovers.map(r => (
                  <option key={r.id} value={r.id} className="bg-slate-950 text-cyan-400">{r.name}</option>
                ))
              )}
            </select>
          </div>
          <div className="bg-slate-950/80 px-3 py-1.5 rounded border border-slate-800 flex flex-col justify-center">
            <span className="text-[9px] text-slate-500 block uppercase font-bold">GATEWAY STATUS</span>
            <span className={`font-bold mt-1 uppercase ${connectionStatus === "connected" ? "text-emerald-400" : "text-rose-500"}`}>
              {connectionStatus.toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Column 1: Rover Status & Recovery Information */}
        <div className="space-y-6">
          <div className="p-5 border border-slate-800 bg-slate-950/40 rounded backdrop-blur-sm relative overflow-hidden">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-800">
              <span className="text-cyan-400 font-bold uppercase tracking-wider">ROVER_STATUS</span>
              {activeRover?.safeMode && (
                <span className="bg-rose-500/20 text-rose-400 border border-rose-500/40 px-2 py-0.5 rounded text-[9px] font-extrabold animate-pulse">
                  SAFE MODE BOOT
                </span>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-slate-500">HEALTH_STATE:</span>
                <span className={`font-bold uppercase ${
                  !activeRover ? "text-rose-500 animate-pulse" :
                  activeRover.healthState === "healthy" ? "text-emerald-400" :
                  activeRover.healthState === "warning" ? "text-amber-400" : "text-rose-500"
                }`}>{activeRover ? activeRover.healthState : "OFFLINE (HARDWARE NOT CONNECTED)"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">ACTIVE_FIRMWARE:</span>
                <span className="text-slate-200 font-bold">{activeRover ? activeRover.firmwareVersion : "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">TARGET_FIRMWARE:</span>
                <span className="text-cyan-400 font-bold">{activeRover ? (activeRover.targetVersion || "LATEST") : "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">UPDATE_CHANNEL:</span>
                <span className="text-slate-200 font-bold capitalize">{activeRover ? activeRover.updateChannel : "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">BATTERY:</span>
                <span className="text-slate-200 font-bold">{activeRover ? `${activeRover.battery}%` : "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">WIFI_SIGNAL:</span>
                <span className="text-slate-200 font-bold">{activeRover ? `${activeRover.signal}%` : "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">CPU_TEMP:</span>
                <span className="text-slate-200 font-bold">{activeRover ? `${activeRover.temperature}°C` : "N/A"}</span>
              </div>
            </div>
          </div>

          {/* Recovery Stats Block */}
          <div className="p-5 border border-slate-800 bg-slate-950/40 rounded backdrop-blur-sm">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-800">
              <span className="text-cyan-400 font-bold uppercase tracking-wider">RECOVERY_INFORMATION</span>
              <AlertTriangle className="h-4 w-4 text-amber-500" />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-slate-500">LAST_BOOT_REASON:</span>
                <span className="text-slate-200 font-bold capitalize">{activeRover ? activeRover.bootReason : "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">LAST_CRASH_INFO:</span>
                <span className="text-rose-400 font-bold">{activeRover ? (activeRover.lastCrash || "None") : "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">ROLLBACK_COUNT:</span>
                <span className="text-slate-200 font-bold">{activeRover ? activeRover.rollbackCount : 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">OTA_STATUS:</span>
                <span className="text-cyan-400 font-bold uppercase">{otaStatus || (activeRover ? activeRover.otaStatus : "N/A")}</span>
              </div>
            </div>
          </div>

          {/* Diagnostics Panel */}
          <div className="p-5 border border-slate-800 bg-slate-950/40 rounded backdrop-blur-sm">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-800">
              <span className="text-cyan-400 font-bold uppercase tracking-wider">DIAGNOSTICS_PANEL</span>
              <button 
                onClick={triggerDiagnostics}
                disabled={diagnosticRunning}
                className="bg-cyan-500/10 hover:bg-cyan-500/25 border border-cyan-500/40 text-cyan-400 px-3 py-1 rounded font-bold cursor-pointer transition-all duration-150"
              >
                {diagnosticRunning ? "RUNNING..." : "RUN TESTS"}
              </button>
            </div>

            {diagnosticResults ? (
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2 border border-slate-800 bg-slate-900/40 rounded flex justify-between items-center">
                    <span>MOTORS</span>
                    {diagnosticResults.motor ? <CheckCircle2 className="h-4 w-4 text-emerald-400" /> : <XCircle className="h-4 w-4 text-rose-500" />}
                  </div>
                  <div className="p-2 border border-slate-800 bg-slate-900/40 rounded flex justify-between items-center">
                    <span>SERVOS</span>
                    {diagnosticResults.servo ? <CheckCircle2 className="h-4 w-4 text-emerald-400" /> : <XCircle className="h-4 w-4 text-rose-500" />}
                  </div>
                  <div className="p-2 border border-slate-800 bg-slate-900/40 rounded flex justify-between items-center">
                    <span>IMU</span>
                    {diagnosticResults.imu ? <CheckCircle2 className="h-4 w-4 text-emerald-400" /> : <XCircle className="h-4 w-4 text-rose-500" />}
                  </div>
                  <div className="p-2 border border-slate-800 bg-slate-900/40 rounded flex justify-between items-center">
                    <span>ULTRASONIC</span>
                    {diagnosticResults.ultrasonic ? <CheckCircle2 className="h-4 w-4 text-emerald-400" /> : <XCircle className="h-4 w-4 text-rose-500" />}
                  </div>
                  <div className="p-2 border border-slate-800 bg-slate-900/40 rounded flex justify-between items-center">
                    <span>CAMERA</span>
                    {diagnosticResults.camera ? <CheckCircle2 className="h-4 w-4 text-emerald-400" /> : <XCircle className="h-4 w-4 text-rose-500" />}
                  </div>
                  <div className="p-2 border border-slate-800 bg-slate-900/40 rounded flex justify-between items-center">
                    <span>WIFI</span>
                    {diagnosticResults.wifi ? <CheckCircle2 className="h-4 w-4 text-emerald-400" /> : <XCircle className="h-4 w-4 text-rose-500" />}
                  </div>
                </div>
                <div className="text-center font-bold text-[10px] mt-2 border-t border-slate-800 pt-2 text-cyan-400">
                  {diagnosticResults.summary.toUpperCase()}
                </div>
              </div>
            ) : (
              <div className="text-slate-500 text-center py-6">NO ACTIVE DIAGNOSTICS REPORT RUN</div>
            )}
          </div>
        </div>

        {/* Column 2: OTA Management & Configuration Settings */}
        <div className="space-y-6">
          {/* OTA Trigger Panel */}
          <div className="p-5 border border-slate-800 bg-slate-950/40 rounded backdrop-blur-sm">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-800">
              <span className="text-cyan-400 font-bold uppercase tracking-wider">OTA_MANAGEMENT</span>
              <RefreshCw className="h-4 w-4 text-cyan-400" />
            </div>

            {/* Rollout mode selector */}
            <div className="space-y-4">
              <div>
                <span className="text-slate-500 block mb-1">STAGED ROLLOUT TARGET:</span>
                <div className="grid grid-cols-3 gap-2">
                  {(["single", "group", "fleet"] as const).map(mode => (
                    <button
                      key={mode}
                      onClick={() => setRolloutMode(mode)}
                      className={`px-2 py-1.5 rounded font-bold border transition-all cursor-pointer ${
                        rolloutMode === mode 
                          ? "bg-cyan-500/20 text-cyan-400 border-cyan-500/40 font-extrabold" 
                          : "bg-slate-900/60 text-slate-400 border-transparent hover:border-slate-800"
                      }`}
                    >
                      {mode.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              {rolloutMode === "group" && (
                <div>
                  <span className="text-slate-500 block mb-1">TARGET GROUP:</span>
                  <input 
                    type="text" 
                    value={rolloutTarget}
                    onChange={e => setRolloutTarget(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 px-3 py-1.5 rounded outline-none text-cyan-400 focus:border-cyan-500/40"
                  />
                </div>
              )}

              <div>
                <span className="text-slate-500 block mb-1">TARGET VERSION:</span>
                <input 
                  type="text" 
                  value={targetVersion}
                  onChange={e => setTargetVersion(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 px-3 py-1.5 rounded outline-none text-cyan-400 focus:border-cyan-500/40"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 mt-4">
                <button 
                  onClick={triggerStagedUpdate}
                  className="bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-black py-2 rounded cursor-pointer transition-all duration-150"
                >
                  DEPLOY UPDATE
                </button>
                <button 
                  onClick={triggerRollback}
                  className="bg-amber-500/10 hover:bg-amber-500/25 border border-amber-500/40 text-amber-400 font-bold py-2 rounded cursor-pointer transition-all duration-150"
                >
                  ROLLBACK
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button 
                  onClick={triggerReboot}
                  className="bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-200 py-1.5 rounded cursor-pointer transition-all duration-150"
                >
                  REBOOT ROVER
                </button>
                <button 
                  onClick={triggerFactoryReset}
                  className="bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/40 text-rose-400 py-1.5 rounded cursor-pointer transition-all duration-150"
                >
                  FACTORY RESET
                </button>
              </div>

              {otaStatus !== "idle" && (
                <div className="border-t border-slate-800 pt-3 mt-3">
                  <div className="flex justify-between text-[10px] mb-1">
                    <span>DOWNLOADING_OTA: {otaStatus.toUpperCase()}</span>
                    <span>{otaProgress}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-cyan-400 animate-pulse transition-all duration-300"
                      style={{ width: `${otaProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Configuration Form */}
          <form onSubmit={saveConfiguration} className="p-5 border border-slate-800 bg-slate-950/40 rounded backdrop-blur-sm space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <span className="text-cyan-400 font-bold uppercase tracking-wider">REMOTE_PARAMETERS</span>
              <Settings className="h-4 w-4 text-cyan-400" />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-500">MOTOR SPEED THROTTLE:</span>
                <span className="text-cyan-400 font-bold">{motorSpeed}%</span>
              </div>
              <input 
                type="range" min="0" max="100" 
                value={motorSpeed} 
                onChange={e => setMotorSpeed(parseInt(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-slate-500 block mb-1">SERVO LIMIT (MIN):</span>
                <input 
                  type="number" value={servoLimits.min} 
                  onChange={e => setServoLimits(prev => ({ ...prev, min: parseInt(e.target.value) }))}
                  className="w-full bg-slate-900 border border-slate-800 px-3 py-1.5 rounded outline-none text-slate-200"
                />
              </div>
              <div>
                <span className="text-slate-500 block mb-1">SERVO LIMIT (MAX):</span>
                <input 
                  type="number" value={servoLimits.max} 
                  onChange={e => setServoLimits(prev => ({ ...prev, max: parseInt(e.target.value) }))}
                  className="w-full bg-slate-900 border border-slate-800 px-3 py-1.5 rounded outline-none text-slate-200"
                />
              </div>
            </div>

            <div>
              <span className="text-slate-500 block mb-1">CAMERA QUALITY PRESET:</span>
              <select 
                value={cameraQuality} 
                onChange={e => setCameraQuality(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 px-3 py-1.5 rounded outline-none text-slate-200"
              >
                <option value="low">LOW preset (QVGA)</option>
                <option value="medium">MEDIUM preset (VGA)</option>
                <option value="high">HIGH preset (720p)</option>
              </select>
            </div>

            <div className="flex justify-between items-center pt-2">
              <span className="text-slate-500">PROXIMITY SENSORS:</span>
              <input 
                type="checkbox" checked={sensorsEnabled} 
                onChange={e => setSensorsEnabled(e.target.checked)}
                className="h-4 w-4 accent-cyan-400"
              />
            </div>

            <div className="border-t border-slate-800/60 pt-3 space-y-3">
              <div>
                <span className="text-slate-500 block mb-1">SCHEDULED UPDATE WINDOW:</span>
                <input 
                  type="text" value={updateWindow}
                  onChange={e => setUpdateWindow(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 px-3 py-1.5 rounded outline-none text-slate-200"
                />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">ALLOW ACTIVE MISSION UPDATES:</span>
                <input 
                  type="checkbox" checked={allowMissionUpdate}
                  onChange={e => setAllowMissionUpdate(e.target.checked)}
                  className="h-4 w-4 accent-cyan-400"
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="w-full bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 py-2 rounded font-bold cursor-pointer transition-all duration-150"
            >
              SAVE CONFIGURATION
            </button>
          </form>
        </div>

        {/* Column 3: Live Logs Streaming & Events Timeline */}
        <div className="space-y-6">
          {/* Live Logs Terminal */}
          <div className="p-5 border border-slate-800 bg-slate-950/40 rounded backdrop-blur-sm flex flex-col h-[350px]">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800 mb-2">
              <div className="flex items-center gap-1.5 text-cyan-400 font-bold uppercase tracking-wider">
                <Terminal className="h-4 w-4" />
                <span>ROVER_LOG_STREAM</span>
              </div>
              <button 
                onClick={downloadLogs}
                className="text-[9px] border border-slate-800 bg-slate-900/60 text-slate-400 hover:text-slate-200 px-2 py-0.5 rounded cursor-pointer"
              >
                DOWNLOAD
              </button>
            </div>

            {/* Filter controls */}
            <div className="flex gap-2 mb-2 pb-2 border-b border-slate-900/60">
              <input 
                type="text" placeholder="Search logs..." 
                value={logSearch} onChange={e => setLogSearch(e.target.value)}
                className="flex-1 bg-slate-900 border border-slate-800 px-2 py-1 rounded outline-none text-[10px]"
              />
              <select 
                value={logFilter} onChange={e => setLogFilter(e.target.value)}
                className="bg-slate-900 border border-slate-800 text-slate-400 px-1 rounded text-[10px]"
              >
                <option value="ALL">ALL</option>
                <option value="INFO">INFO</option>
                <option value="WARNING">WARN</option>
                <option value="ERROR">ERROR</option>
                <option value="DEBUG">DEBUG</option>
              </select>
            </div>

            {/* Terminal logs list */}
            <div className="flex-1 overflow-y-auto bg-slate-950/80 p-3 rounded border border-slate-900 font-mono text-[10px] space-y-1.5 scrollbar-thin">
              {filteredLogs.map((log, i) => (
                <div key={i} className="flex gap-2">
                  <span className="text-slate-600">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                  <span className={`font-extrabold ${
                    log.level === "ERROR" ? "text-rose-500" :
                    log.level === "WARNING" ? "text-amber-500" :
                    log.level === "DEBUG" ? "text-slate-500" : "text-cyan-400"
                  }`}>[{log.level}]</span>
                  <span className="text-slate-300 break-all">{log.message}</span>
                </div>
              ))}
              <div ref={logEndRef} />
            </div>

            <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-900/60 text-[9px] text-slate-500">
              <span>STREAMING ACTIVE</span>
              <label className="flex items-center gap-1 cursor-pointer">
                <input 
                  type="checkbox" checked={autoScroll} 
                  onChange={e => setAutoScroll(e.target.checked)}
                  className="accent-cyan-400"
                />
                AUTO-SCROLL
              </label>
            </div>
          </div>

          {/* Events History Timeline */}
          <div className="p-5 border border-slate-800 bg-slate-950/40 rounded backdrop-blur-sm flex flex-col h-[350px]">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800 mb-2">
              <span className="text-cyan-400 font-bold uppercase tracking-wider">EVENT_HISTORY</span>
              <Database className="h-4 w-4 text-cyan-400" />
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-thin">
              {events.length > 0 ? (
                events.map(event => (
                  <div key={event.id} className="relative pl-4 border-l border-slate-800">
                    <div className="absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded-full bg-cyan-500 border border-slate-950" />
                    <div className="flex justify-between text-[10px] text-slate-500 mb-0.5">
                      <span className="text-cyan-400 font-bold uppercase">{event.eventType}</span>
                      <span>{new Date(event.timestamp).toLocaleString()}</span>
                    </div>
                    <div className="text-[10px] text-slate-300">{event.message}</div>
                  </div>
                ))
              ) : (
                <div className="text-slate-600 text-center py-12">NO HISTORICAL EVENTS RECORDED</div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
