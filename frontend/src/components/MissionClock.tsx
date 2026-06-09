"use client";

import { useEffect, useState } from "react";
import { MISSION_INFO } from "@/lib/constants";

export default function MissionClock() {
  const [currentTime, setCurrentTime] = useState<Date | null>(null);

  useEffect(() => {
    setCurrentTime(new Date());
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const getMET = () => {
    if (!currentTime) return "000d : 00h : 00m : 00s";
    const start = new Date(MISSION_INFO.metStart).getTime();
    const diff = currentTime.getTime() - start;

    if (diff < 0) return "000d : 00h : 00m : 00s";

    const seconds = Math.floor((diff / 1000) % 60);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    const pad = (num: number, size = 2) => {
      let s = num.toString();
      while (s.length < size) s = "0" + s;
      return s;
    };

    return `${pad(days, 3)}d : ${pad(hours)}h : ${pad(minutes)}m : ${pad(seconds)}s`;
  };

  const getFormattedTime = (utc: boolean) => {
    if (!currentTime) return "--:--:--";
    const options: Intl.DateTimeFormatOptions = {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
      timeZone: utc ? "UTC" : undefined,
    };
    return new Intl.DateTimeFormat("en-US", options).format(currentTime);
  };

  return (
    <div className="flex items-center gap-4 sm:gap-6 lg:gap-8 font-mono select-none">
      {/* Local Clock */}
      <div className="flex flex-col">
        <span className="text-[7px] text-slate-500 tracking-wider uppercase leading-none">LOCAL_TIME</span>
        <span className="text-xs font-semibold text-slate-300 tabular-nums mt-0.5 leading-none">
          {getFormattedTime(false)}
        </span>
      </div>

      {/* UTC Clock */}
      <div className="flex flex-col">
        <span className="text-[7px] text-slate-500 tracking-wider uppercase leading-none">UTC_TIME</span>
        <span className="text-xs font-semibold text-slate-300 tabular-nums mt-0.5 leading-none">
          {getFormattedTime(true)}
        </span>
      </div>

      {/* Mission elapsed clock */}
      <div className="flex flex-col">
        <span className="text-[7px] text-cyan-400 tracking-wider font-bold uppercase leading-none">MET_RUNTIME</span>
        <span className="text-xs font-extrabold text-cyan-400 tabular-nums tracking-wide mt-0.5 leading-none animate-glow">
          {getMET()}
        </span>
      </div>
    </div>
  );
}
