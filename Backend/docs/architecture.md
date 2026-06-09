# ARES Backend Architecture

This document describes the design layout and module mapping for the ARES MVP ground operations backend.

## Design Patterns & Layering
The system is divided into focused directories under `src/`:
1.  **Modules**: Key functional segments containing type interfaces, localized data stores, and service handlers:
    *   `mission-control`: Manages mission outlines, priorities, and check-in objective statuses.
    *   `live-map`: Buffers geographical geofences, tactical routing grids, and waypoint targets.
    *   `telemetry`: Buffer arrays for incoming time-series telemetry stats.
    *   `fleet`: Catalogs active registered rover and scout profiles.
2.  **Adapters**:
    *   `mother-rover`: Decoupled TCP/UDP socket adapter interface and byte parsing handler.
    *   `virtual-rover`: Simulator mock generator of telemetry payloads for operations testing.
3.  **WebSocket**:
    *   `websocketServer`: Broadcast manager for pushing real-time streams to React clients.
    *   `websocketEvents`: Defined client/server events and packet payload wrappers.

## Data Flow Pipeline
```txt
Scout Rovers
      │ (Nested telemetry arrays)
      ▼
Mother Rover
      │ (Unified byte transmissions)
      ▼
Mother Rover Adapter
      │ (ParseRawBytes)
      ▼
Fleet Module
      │ (Node registration & update events)
      ▼
Mission Control / Live Map / Telemetry Modules
      │ (State updates)
      ▼
WebSocket Server Manager
      │ (Broadcast payload JSON)
      ▼
ARES Ground Operations Dashboard
```
