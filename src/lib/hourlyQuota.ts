import type { RateLimitMeta } from "../types";

export interface QuotaState {
  requestsUsed: number;
  windowStartedAt: string;
}

export interface QuotaStore {
  getWithMetadata<T>(
    key: string
  ): Promise<{ data: T | null; etag?: string } | null>;
  setJSON<T>(key: string, value: T): Promise<void>;
}

export function getHourlyWindowStart(now: Date): string {
  return new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
      now.getUTCHours(),
      0,
      0,
      0
    )
  ).toISOString();
}

function buildState(now: Date): QuotaState {
  return {
    requestsUsed: 0,
    windowStartedAt: getHourlyWindowStart(now)
  };
}

function normalizeState(
  value: QuotaState | null | undefined,
  now: Date
): QuotaState {
  const freshState = buildState(now);

  if (!value) {
    return freshState;
  }

  if (value.windowStartedAt !== freshState.windowStartedAt) {
    return freshState;
  }

  return value;
}

function buildMeta(
  state: QuotaState,
  limitPerHour: number,
  requestsPerSnapshot: number
): RateLimitMeta {
  return {
    limitPerHour,
    requestsPerSnapshot,
    requestsUsed: state.requestsUsed,
    requestsRemaining: Math.max(0, limitPerHour - state.requestsUsed),
    windowStartedAt: state.windowStartedAt
  };
}

export async function reserveQuota(
  store: QuotaStore,
  key: string,
  limitPerHour: number,
  requestsToReserve: number,
  now = new Date()
): Promise<{ allowed: boolean; rateLimit: RateLimitMeta }> {
  const entry = await store.getWithMetadata<QuotaState>(key);
  const state = normalizeState(entry?.data, now);
  const nextUsed = state.requestsUsed + requestsToReserve;

  if (nextUsed > limitPerHour) {
    return {
      allowed: false,
      rateLimit: buildMeta(state, limitPerHour, requestsToReserve)
    };
  }

  const nextState: QuotaState = {
    ...state,
    requestsUsed: nextUsed
  };

  await store.setJSON(key, nextState);

  return {
    allowed: true,
    rateLimit: buildMeta(nextState, limitPerHour, requestsToReserve)
  };
}
