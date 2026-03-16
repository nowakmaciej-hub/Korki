import { getHourlyWindowStart, reserveQuota, type QuotaState, type QuotaStore } from "./hourlyQuota";

class MemoryQuotaStore implements QuotaStore {
  private state = new Map<string, { data: unknown; etag: string }>();
  private version = 0;

  async getWithMetadata<T>(key: string) {
    const entry = this.state.get(key);

    if (!entry) {
      return null;
    }

    return {
      data: entry.data as T,
      etag: entry.etag
    };
  }

  async setJSON<T>(
    key: string,
    value: T
  ) {
    this.version += 1;
    const etag = `etag-${this.version}`;
    this.state.set(key, { data: value, etag });
  }

  seed(key: string, value: QuotaState) {
    this.version += 1;
    this.state.set(key, { data: value, etag: `etag-${this.version}` });
  }
}

describe("reserveQuota", () => {
  it("reserves requests within the current hour", async () => {
    const store = new MemoryQuotaStore();
    const now = new Date("2026-03-16T10:15:00.000Z");

    const result = await reserveQuota(store, "quota", 20, 12, now);

    expect(result.allowed).toBe(true);
    expect(result.rateLimit.requestsUsed).toBe(12);
    expect(result.rateLimit.requestsRemaining).toBe(8);
    expect(result.rateLimit.windowStartedAt).toBe(getHourlyWindowStart(now));
  });

  it("blocks when the next reservation would exceed the hourly cap", async () => {
    const store = new MemoryQuotaStore();
    const now = new Date("2026-03-16T10:15:00.000Z");

    store.seed("quota", {
      requestsUsed: 12,
      windowStartedAt: getHourlyWindowStart(now)
    });

    const result = await reserveQuota(store, "quota", 20, 12, now);

    expect(result.allowed).toBe(false);
    expect(result.rateLimit.requestsUsed).toBe(12);
    expect(result.rateLimit.requestsRemaining).toBe(8);
  });

  it("resets usage when a new hour starts", async () => {
    const store = new MemoryQuotaStore();

    store.seed("quota", {
      requestsUsed: 18,
      windowStartedAt: "2026-03-16T09:00:00.000Z"
    });

    const result = await reserveQuota(
      store,
      "quota",
      20,
      12,
      new Date("2026-03-16T10:15:00.000Z")
    );

    expect(result.allowed).toBe(true);
    expect(result.rateLimit.requestsUsed).toBe(12);
    expect(result.rateLimit.requestsRemaining).toBe(8);
    expect(result.rateLimit.windowStartedAt).toBe("2026-03-16T10:00:00.000Z");
  });
});
