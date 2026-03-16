import { vi } from "vitest";
import { handler } from "../../netlify/functions/traffic-snapshot";

const originalEnv = process.env.GOOGLE_MAPS_API_KEY;
const originalFetch = global.fetch;

const blobState = new Map<string, { data: unknown; etag: string }>();
let blobVersion = 0;

vi.mock("@netlify/blobs", () => ({
  connectLambda: vi.fn(),
  getStore: () => ({
    async getWithMetadata<T>(key: string) {
      const entry = blobState.get(key);

      if (!entry) {
        return null;
      }

      return {
        data: entry.data as T,
        etag: entry.etag
      };
    },
    async get(key: string) {
      return blobState.get(key)?.data ?? null;
    },
    async setJSON(
      key: string,
      value: unknown
    ) {
      blobVersion += 1;
      const etag = `etag-${blobVersion}`;
      blobState.set(key, { data: value, etag });
    }
  })
}));

describe("traffic-snapshot handler", () => {
  afterEach(() => {
    process.env.GOOGLE_MAPS_API_KEY = originalEnv;
    global.fetch = originalFetch;
    blobState.clear();
    blobVersion = 0;
    vi.restoreAllMocks();
  });

  it("returns a clear config error when the API key is missing", async () => {
    delete process.env.GOOGLE_MAPS_API_KEY;

    const response = await handler({} as never, {} as never);

    expect(response?.statusCode).toBe(500);
    expect(response?.headers?.["Cache-Control"]).toBe("no-store");
    expect(response?.body).toContain("Missing GOOGLE_MAPS_API_KEY");
  });

  it("returns a valid snapshot payload for both cities", async () => {
    process.env.GOOGLE_MAPS_API_KEY = "test-key";
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        routes: [{ duration: "900s", distanceMeters: 12000 }]
      })
    }) as typeof fetch;

    const response = await handler({} as never, {} as never);
    const payload = JSON.parse(response?.body ?? "{}");

    expect(response?.statusCode).toBe(200);
    expect(payload.generatedAt).toBeTruthy();
    expect(payload.cities).toHaveLength(2);
    expect(payload.cities[0].businessRoutes).toHaveLength(3);
    expect(payload.cities[0].residentialRoutes).toHaveLength(3);
    expect(payload.meta.dataSource).toBe("live");
  });

  it("returns a safe error when Google fails", async () => {
    process.env.GOOGLE_MAPS_API_KEY = "test-key";
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 503,
      text: async () => "Service unavailable"
    }) as typeof fetch;

    const response = await handler({} as never, {} as never);

    expect(response?.statusCode).toBe(502);
    expect(response?.body).toContain("Could not load live traffic snapshot");
  });

  it("serves the cached snapshot when Google fails after a successful snapshot", async () => {
    process.env.GOOGLE_MAPS_API_KEY = "test-key";
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        routes: [{ duration: "900s", distanceMeters: 12000 }]
      })
    }) as typeof fetch;

    const firstResponse = await handler({} as never, {} as never);

    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 503,
      text: async () => "Service unavailable"
    }) as typeof fetch;

    const secondResponse = await handler({} as never, {} as never);
    const secondPayload = JSON.parse(secondResponse?.body ?? "{}");

    expect(firstResponse?.statusCode).toBe(200);
    expect(secondResponse?.statusCode).toBe(200);
    expect(secondPayload.meta?.dataSource).toBe("cache");
    expect(secondPayload.meta?.cacheReason).toBe("upstream-error");
  });
});
