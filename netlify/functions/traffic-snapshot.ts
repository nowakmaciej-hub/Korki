import type { Handler } from "@netlify/functions";
import { fetchGoogleRoute } from "../../src/lib/googleRoutes";
import { buildTrafficSnapshot } from "../../src/lib/snapshot";

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

export const handler: Handler = async () => {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return jsonResponse(500, {
      error: "Missing GOOGLE_MAPS_API_KEY configuration."
    });
  }

  try {
    const snapshot = await buildTrafficSnapshot((request) =>
      fetchGoogleRoute(request, apiKey)
    );

    return jsonResponse(200, snapshot);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unknown traffic snapshot error.";

    return jsonResponse(502, {
      error: "Could not load live traffic snapshot.",
      details: message
    });
  }
};
