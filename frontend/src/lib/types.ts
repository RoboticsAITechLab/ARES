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
}

export interface Alert {
  id: string;
  timestamp: string;
  roverId: string;
  roverName: string;
  severity: 'nominal' | 'warning' | 'critical';
  message: string;
}
