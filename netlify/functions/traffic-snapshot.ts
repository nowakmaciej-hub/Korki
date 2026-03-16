import { getStore } from "@netlify/blobs";
import type { Handler } from "@netlify/functions";
import { cityConfigs } from "../../src/data/cities";
import { fetchGoogleRoute } from "../../src/lib/googleRoutes";
import { reserveQuota } from "../../src/lib/hourlyQuota";
import { buildTrafficSnapshot } from "../../src/lib/snapshot";
import type { SnapshotMeta, TrafficSnapshot } from "../../src/types";

const BLOB_STORE_NAME = "korki-traffic";
const HOURLY_LIMIT_KEY = "hourly-google-routes";
const SNAPSHOT_CACHE_KEY = "latest-traffic-snapshot";
const DESTINATIONS_PER_CATEGORY = 3;
const SNAPSHOT_ROUTE_REQUESTS = cityConfigs.length * DESTINATIONS_PER_CATEGORY * 2;
const DEFAULT_REQUESTS_PER_HOUR = 20;

function jsonResponse(statusCode: number, body: unknown) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store"
    },
    body: JSON.stringify(body)
  };
}

function parseHourlyLimit(rawValue: string | undefined): number {
  const parsed = Number.parseInt(rawValue ?? "", 10);

  if (Number.isNaN(parsed) || parsed <= 0) {
    return DEFAULT_REQUESTS_PER_HOUR;
  }

  return parsed;
}

function buildMeta(
  snapshot: TrafficSnapshot,
  meta: SnapshotMeta
): TrafficSnapshot {
  return {
    ...snapshot,
    meta
  };
}

export const handler: Handler = async () => {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  const requestsPerHour = parseHourlyLimit(process.env.TRAFFIC_REQUESTS_PER_HOUR);

  const store = getStore({ name: BLOB_STORE_NAME, consistency: "strong" });
  const quotaStore = {
    async getWithMetadata<T>(key: string) {
      return store.getWithMetadata(key, {
        consistency: "strong",
        type: "json"
      }) as Promise<{ data: T | null; etag?: string } | null>;
    },
    async setJSON<T>(key: string, value: T) {
      await store.setJSON(key, value);
    }
  };

  if (!apiKey) {
    return jsonResponse(500, {
      error: "Missing GOOGLE_MAPS_API_KEY configuration."
    });
  }

  try {
    const quotaReservation = await reserveQuota(
      quotaStore,
      HOURLY_LIMIT_KEY,
      requestsPerHour,
      SNAPSHOT_ROUTE_REQUESTS
    );

    if (!quotaReservation.allowed) {
      const cachedSnapshot = await store.get(SNAPSHOT_CACHE_KEY, {
        consistency: "strong",
        type: "json"
      });

      if (cachedSnapshot) {
        return jsonResponse(
          200,
          buildMeta(cachedSnapshot as TrafficSnapshot, {
            dataSource: "cache",
            cacheReason: "rate-limit",
            rateLimit: quotaReservation.rateLimit
          })
        );
      }

      return jsonResponse(429, {
        error: "Hourly traffic limit reached. Try again next hour.",
        rateLimit: quotaReservation.rateLimit
      });
    }

    const snapshot = await buildTrafficSnapshot((request) =>
      fetchGoogleRoute(request, apiKey)
    );
    const liveSnapshot = buildMeta(snapshot, {
      dataSource: "live",
      rateLimit: quotaReservation.rateLimit
    });

    await store.setJSON(SNAPSHOT_CACHE_KEY, liveSnapshot);

    return jsonResponse(200, liveSnapshot);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unknown traffic snapshot error.";

    const cachedSnapshot = await store.get(SNAPSHOT_CACHE_KEY, {
      consistency: "strong",
      type: "json"
    });

    if (cachedSnapshot) {
      const snapshot = cachedSnapshot as TrafficSnapshot;

      return jsonResponse(
        200,
        buildMeta(snapshot, {
          dataSource: "cache",
          cacheReason: "upstream-error",
          rateLimit:
            snapshot.meta?.rateLimit ?? {
              limitPerHour: requestsPerHour,
              requestsPerSnapshot: SNAPSHOT_ROUTE_REQUESTS,
              requestsUsed: 0,
              requestsRemaining: requestsPerHour,
              windowStartedAt: new Date().toISOString()
            }
        })
      );
    }

    return jsonResponse(502, {
      error: "Could not load live traffic snapshot.",
      details: message
    });
  }
};
