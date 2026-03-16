import type { RouteRequest, RouteResult } from "../types";

const ROUTES_ENDPOINT = "https://routes.googleapis.com/directions/v2:computeRoutes";

function parseDurationToMinutes(rawDuration: string): number {
  const seconds = Number.parseFloat(rawDuration.replace("s", ""));

  if (Number.isNaN(seconds)) {
    throw new Error(`Unexpected duration value: ${rawDuration}`);
  }

  return Math.round((seconds / 60) * 10) / 10;
}

export async function fetchGoogleRoute(
  request: RouteRequest,
  apiKey: string
): Promise<RouteResult> {
  const response = await fetch(ROUTES_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask": "routes.duration,routes.distanceMeters"
    },
    body: JSON.stringify({
      origin: {
        location: {
          latLng: {
            latitude: request.origin.lat,
            longitude: request.origin.lng
          }
        }
      },
      destination: {
        location: {
          latLng: {
            latitude: request.destination.lat,
            longitude: request.destination.lng
          }
        }
      },
      travelMode: "DRIVE",
      routingPreference: "TRAFFIC_AWARE"
    })
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Google Routes API failed (${response.status}): ${details}`);
  }

  const payload = (await response.json()) as {
    routes?: Array<{ duration?: string; distanceMeters?: number }>;
  };

  const route = payload.routes?.[0];

  if (!route?.duration || typeof route.distanceMeters !== "number") {
    throw new Error("Google Routes API returned an incomplete route payload.");
  }

  return {
    distanceKm: Math.round((route.distanceMeters / 1000) * 10) / 10,
    durationMinutes: parseDurationToMinutes(route.duration)
  };
}
