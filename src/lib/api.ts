import type { TrafficSnapshot } from "../types";

export async function fetchTrafficSnapshot(): Promise<TrafficSnapshot> {
  const response = await fetch("/.netlify/functions/traffic-snapshot", {
    headers: {
      Accept: "application/json"
    }
  });

  const payload = (await response.json()) as
    | TrafficSnapshot
    | { error?: string; details?: string };

  if (!response.ok) {
    const message =
      "error" in payload && payload.error
        ? payload.error
        : "Nie udalo sie pobrac danych o ruchu.";

    throw new Error(message);
  }

  return payload as TrafficSnapshot;
}
