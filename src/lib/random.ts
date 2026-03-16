import type { Category, CityConfig, Place, RouteRequest } from "../types";

const DESTINATION_COUNT = 3;

export function pickRandomUnique<T>(items: T[], count: number): T[] {
  if (count > items.length) {
    throw new Error(`Cannot pick ${count} items from a pool of ${items.length}.`);
  }

  const pool = [...items];

  for (let index = pool.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [pool[index], pool[swapIndex]] = [pool[swapIndex], pool[index]];
  }

  return pool.slice(0, count);
}

function buildRequestsForCategory(
  category: Category,
  origin: Place,
  destinations: Place[]
): RouteRequest[] {
  return pickRandomUnique(destinations, DESTINATION_COUNT).map((destination) => ({
    category,
    origin,
    destination
  }));
}

export function createRouteRequests(city: CityConfig): {
  selectedOrigin: Place;
  businessRequests: RouteRequest[];
  residentialRequests: RouteRequest[];
} {
  const [selectedOrigin] = pickRandomUnique(city.origins, 1);

  return {
    selectedOrigin,
    businessRequests: buildRequestsForCategory(
      "business",
      selectedOrigin,
      city.businessDestinations
    ),
    residentialRequests: buildRequestsForCategory(
      "residential",
      selectedOrigin,
      city.residentialDestinations
    )
  };
}
