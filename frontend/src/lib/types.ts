export interface Rover {
  id: string;
  name: string;
  battery: number;
  signal: number;
  status: 'online' | 'warning' | 'critical' | string;
  temperature: number; // in Celsius
  latitude: number;
  longitude: number;
  speed: number; // in m/s
  lastContact: string;
  type: 'mother' | 'scout';
  // Telemetry metrics
  cpu: number; // in %
  memory: number; // in %
  linkQuality: number; // in %
  health: number; // in %
}

export interface Alert {
  id: string;
  timestamp: string;
  roverId: string;
  roverName: string;
  severity: 'nominal' | 'warning' | 'critical';
  message: string;
}
