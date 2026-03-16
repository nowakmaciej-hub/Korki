export type Category = "business" | "residential";
export type CityId = "warsaw" | "wroclaw";

export interface Place {
  label: string;
  lat: number;
  lng: number;
}

export interface CityConfig {
  id: CityId;
  label: string;
  origins: Place[];
  businessDestinations: Place[];
  residentialDestinations: Place[];
}

export interface RouteMetric {
  category: Category;
  originLabel: string;
  destinationLabel: string;
  distanceKm: number;
  durationMinutes: number;
  minutesPerKm: number;
}

export interface RouteSummary {
  avgDurationMinutes: number;
  avgDistanceKm: number;
  avgMinutesPerKm: number;
  fastestRoute: RouteMetric;
  slowestRoute: RouteMetric;
}

export interface CitySnapshot {
  id: CityId;
  label: string;
  selectedOrigin: string;
  businessRoutes: RouteMetric[];
  residentialRoutes: RouteMetric[];
  summary: RouteSummary;
}

export interface TrafficSnapshot {
  generatedAt: string;
  cities: CitySnapshot[];
  meta?: SnapshotMeta;
}

export interface RouteRequest {
  category: Category;
  origin: Place;
  destination: Place;
}

export interface RouteResult {
  distanceKm: number;
  durationMinutes: number;
}

export interface SnapshotMeta {
  dataSource: "live" | "cache";
  cacheReason?: "upstream-error";
}
