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
    const baseMessage =
      "error" in payload && payload.error
        ? payload.error
        : "Nie udalo sie pobrac danych o ruchu.";
    const details =
      "details" in payload && payload.details ? payload.details : null;
    const message = details ? `${baseMessage} ${details}` : baseMessage;

    throw new Error(message);
  }

  return payload as TrafficSnapshot;
}
