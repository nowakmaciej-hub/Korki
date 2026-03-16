import { cityConfigs } from "../data/cities";
import type {
  CityConfig,
  CitySnapshot,
  RouteMetric,
  RouteRequest,
  RouteResult,
  TrafficSnapshot
} from "../types";
import { createRouteRequests } from "./random";
import { buildSummary, calculateMinutesPerKm } from "./stats";

export type RouteFetcher = (request: RouteRequest) => Promise<RouteResult>;

async function buildRoutes(
  requests: RouteRequest[],
  routeFetcher: RouteFetcher
): Promise<RouteMetric[]> {
  const routeResults = await Promise.all(
    requests.map(async (request) => {
      const result = await routeFetcher(request);

      return {
        category: request.category,
        originLabel: request.origin.label,
        destinationLabel: request.destination.label,
        distanceKm: result.distanceKm,
        durationMinutes: result.durationMinutes,
        minutesPerKm: calculateMinutesPerKm(
          result.durationMinutes,
          result.distanceKm
        )
      };
    })
  );

  return routeResults;
}

export async function buildCitySnapshot(
  city: CityConfig,
  routeFetcher: RouteFetcher
): Promise<CitySnapshot> {
  const { selectedOrigin, businessRequests, residentialRequests } =
    createRouteRequests(city);
  const businessRoutes = await buildRoutes(businessRequests, routeFetcher);
  const residentialRoutes = await buildRoutes(residentialRequests, routeFetcher);
  const allRoutes = [...businessRoutes, ...residentialRoutes];

  return {
    id: city.id,
    label: city.label,
    selectedOrigin: selectedOrigin.label,
    businessRoutes,
    residentialRoutes,
    summary: buildSummary(allRoutes)
  };
}

export async function buildTrafficSnapshot(
  routeFetcher: RouteFetcher
): Promise<TrafficSnapshot> {
  const cities = await Promise.all(
    cityConfigs.map((city) => buildCitySnapshot(city, routeFetcher))
  );

  return {
    generatedAt: new Date().toISOString(),
    cities
  };
}
