import type { RouteMetric } from "../types";
import { buildSummary, calculateMinutesPerKm } from "./stats";

const routes: RouteMetric[] = [
  {
    category: "business",
    originLabel: "A",
    destinationLabel: "B",
    distanceKm: 10,
    durationMinutes: 20,
    minutesPerKm: 2
  },
  {
    category: "business",
    originLabel: "A",
    destinationLabel: "C",
    distanceKm: 5,
    durationMinutes: 17.5,
    minutesPerKm: 3.5
  },
  {
    category: "residential",
    originLabel: "A",
    destinationLabel: "D",
    distanceKm: 8,
    durationMinutes: 12,
    minutesPerKm: 1.5
  }
];

describe("stats helpers", () => {
  it("calculates minutes per km with 2 decimals", () => {
    expect(calculateMinutesPerKm(11, 4)).toBe(2.75);
  });

  it("builds city summary averages and route extremes", () => {
    const summary = buildSummary(routes);

    expect(summary.avgDurationMinutes).toBe(16.5);
    expect(summary.avgDistanceKm).toBe(7.7);
    expect(summary.avgMinutesPerKm).toBe(2.33);
    expect(summary.fastestRoute.destinationLabel).toBe("D");
    expect(summary.slowestRoute.destinationLabel).toBe("B");
  });
});
