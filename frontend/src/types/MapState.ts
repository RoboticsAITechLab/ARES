/**
 * @file MapState.ts
 * @description Type definition representing map waypoints and route lines on the live tactical overlay.
 */

import { Route, Waypoint } from "../domain/routes/types";

export interface MapState {
  waypoints: Waypoint[];
  routes: Route[];
}
