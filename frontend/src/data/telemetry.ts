export interface TelemetryHistoryPoint {
  sol: number;
  battery: number;
  signal: number;
  temperature: number;
  speed: number;
}

export const initialTelemetryHistory: Record<string, TelemetryHistoryPoint[]> = {
  "mother-rover": [
    { sol: 130, battery: 100, signal: 95, temperature: -10, speed: 0.1 },
    { sol: 132, battery: 98, signal: 92, temperature: -12, speed: 0.2 },
    { sol: 134, battery: 96, signal: 90, temperature: -15, speed: 0.25 },
    { sol: 136, battery: 94, signal: 92, temperature: -14, speed: 0.25 }
  ],
  "scout-1": [
    { sol: 130, battery: 60, signal: 80, temperature: 15, speed: 1.0 },
    { sol: 132, battery: 52, signal: 75, temperature: 12, speed: 1.2 },
    { sol: 134, battery: 45, signal: 70, temperature: 14, speed: 1.5 },
    { sol: 136, battery: 38, signal: 68, temperature: 12, speed: 1.82 }
  ],
  "scout-2": [
    { sol: 130, battery: 90, signal: 90, temperature: -20, speed: 0.0 },
    { sol: 132, battery: 88, signal: 88, temperature: -19, speed: 0.0 },
    { sol: 134, battery: 85, signal: 88, temperature: -18, speed: 0.0 },
    { sol: 136, battery: 82, signal: 88, temperature: -18, speed: 0.0 }
  ],
  "scout-3": [
    { sol: 130, battery: 100, signal: 95, temperature: -24, speed: 0.0 },
    { sol: 132, battery: 100, signal: 95, temperature: -24, speed: 0.0 },
    { sol: 134, battery: 100, signal: 95, temperature: -24, speed: 0.0 },
    { sol: 136, battery: 100, signal: 95, temperature: -24, speed: 0.0 }
  ]
};
