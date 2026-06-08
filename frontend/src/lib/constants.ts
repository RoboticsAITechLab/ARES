export const MISSION_INFO = {
  name: "ARES-V",
  target: "Jezero Crater, Mars",
  metStart: "2026-02-14T05:00:00Z", // MET (Mission Elapsed Time) start
  groundStation: "Deep Space Network (DSN-43)",
  sol: 142
};

export const NAV_LINKS = [
  {
    name: "Mission Control",
    path: "/mission-control",
    icon: "LayoutDashboard"
  },
  {
    name: "Live Map",
    path: "/live-map",
    icon: "Map"
  },
  {
    name: "Telemetry",
    path: "/telemetry",
    icon: "Activity"
  }
];

export const STATUS_STYLES = {
  online: {
    color: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
    badge: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    dot: "bg-emerald-400",
    label: "NOMINAL"
  },
  warning: {
    color: "text-amber-400 border-amber-500/30 bg-amber-500/10",
    badge: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    dot: "bg-amber-400",
    label: "WARNING"
  },
  critical: {
    color: "text-rose-400 border-rose-500/30 bg-rose-500/10",
    badge: "bg-rose-500/20 text-rose-300 border-rose-500/30",
    dot: "bg-rose-400",
    label: "CRITICAL"
  }
};
