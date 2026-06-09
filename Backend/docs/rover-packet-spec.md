# ARES Rover Telemetry Packet Specification

This document details the telemetry format sent from the rovers (Mother Rover and Scout rovers) to the Ground Operations Hub.

## Mother Rover Packet
Payload structure detailing Mother Rover telemetry and active client links:
```typescript
interface MotherRoverPacket {
  id: string;             // Unique ID of the Mother Rover
  battery: number;        // Core battery capacity (0 to 100)
  signal: number;         // Signal link lock percent (0 to 100)
  temperature: number;    // Core temperature in Celsius
  speed: number;          // Rover speed in meters per second
  heading: number;        // Current heading in degrees (0 to 359)
  x: number;              // Current X coordinate on grid
  y: number;              // Current Y coordinate on grid
  status: "online" | "offline"; // Connection flag
  connectedScouts: number;// Tally of scouts connected to this mother
  timestamp: number;      // Epoch timestamp of transmission
}
```

## Scout Rover Packet
Payload structure representing nested scouts tracking statistics inside the Mother Rover payload:
```typescript
interface ScoutRoverPacket {
  id: string;             // Unique ID of the Scout unit
  battery: number;        // Core battery capacity (0 to 150)
  signal: number;         // Signal link lock percent (0 to 100)
  temperature: number;    // Core temperature in Celsius
  speed: number;          // Unit speed in meters per second
  heading: number;        // Current heading in degrees (0 to 359)
  x: number;              // Current X coordinate on grid
  y: number;              // Current Y coordinate on grid
  status: string;         // Discovery flag (e.g. DOCKED, ACTIVE, RETURNING)
  timestamp: number;      // Epoch timestamp of transmission
}
```

## Fleet Packet
Consolidated payload carrying the full fleet view:
```typescript
interface FleetPacket {
  mother: MotherRoverPacket;
  scouts: ScoutRoverPacket[];
}
```
