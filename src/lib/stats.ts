import type { RouteMetric, RouteSummary } from "../types";

function round(value: number, digits = 1): number {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

export function calculateMinutesPerKm(
  durationMinutes: number,
  distanceKm: number
): number {
  if (distanceKm <= 0) {
    return 0;
  }

  return round(durationMinutes / distanceKm, 2);
}

export function buildSummary(routes: RouteMetric[]): RouteSummary {
  if (routes.length === 0) {
    throw new Error("Cannot build summary without routes.");
  }

  const totals = routes.reduce(
    (accumulator, route) => ({
      duration: accumulator.duration + route.durationMinutes,
      distance: accumulator.distance + route.distanceKm,
      minutesPerKm: accumulator.minutesPerKm + route.minutesPerKm
    }),
    { duration: 0, distance: 0, minutesPerKm: 0 }
  );

  const sortedByDuration = [...routes].sort(
    (left, right) => left.durationMinutes - right.durationMinutes
  );

  return {
    avgDurationMinutes: round(totals.duration / routes.length, 1),
    avgDistanceKm: round(totals.distance / routes.length, 1),
    avgMinutesPerKm: round(totals.minutesPerKm / routes.length, 2),
    fastestRoute: sortedByDuration[0],
    slowestRoute: sortedByDuration[sortedByDuration.length - 1]
  };
}
