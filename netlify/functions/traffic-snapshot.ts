import { connectLambda, getStore } from "@netlify/blobs";
import type { Handler } from "@netlify/functions";
import { fetchGoogleRoute } from "../../src/lib/googleRoutes";
import { buildTrafficSnapshot } from "../../src/lib/snapshot";
import type { SnapshotMeta, TrafficSnapshot } from "../../src/types";

const BLOB_STORE_NAME = "korki-traffic";
const SNAPSHOT_CACHE_KEY = "latest-traffic-snapshot";

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

function buildMeta(
  snapshot: TrafficSnapshot,
  meta: SnapshotMeta
): TrafficSnapshot {
  return {
    ...snapshot,
    meta
  };
}

export const handler: Handler = async (event) => {
  connectLambda(event as never);

  const apiKey = process.env.GOOGLE_MAPS_API_KEY;

  const store = getStore({ name: BLOB_STORE_NAME });

  if (!apiKey) {
    return jsonResponse(500, {
      error: "Missing GOOGLE_MAPS_API_KEY configuration."
    });
  }

  try {
    const snapshot = await buildTrafficSnapshot((request) =>
      fetchGoogleRoute(request, apiKey)
    );
    const liveSnapshot = buildMeta(snapshot, {
      dataSource: "live"
    });

    await store.setJSON(SNAPSHOT_CACHE_KEY, liveSnapshot);

    return jsonResponse(200, liveSnapshot);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unknown traffic snapshot error.";

    const cachedSnapshot = await store.get(SNAPSHOT_CACHE_KEY, {
      type: "json"
    });

    if (cachedSnapshot) {
      const snapshot = cachedSnapshot as TrafficSnapshot;

      return jsonResponse(
        200,
        buildMeta(snapshot, {
          dataSource: "cache",
          cacheReason: "upstream-error"
        })
      );
    }

    return jsonResponse(502, {
      error: "Could not load live traffic snapshot.",
      details: message
    });
  }
};
