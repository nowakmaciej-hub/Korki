import { handler } from "../../netlify/functions/traffic-snapshot";

const originalEnv = process.env.GOOGLE_MAPS_API_KEY;
const originalFetch = global.fetch;

describe("traffic-snapshot handler", () => {
  afterEach(() => {
    process.env.GOOGLE_MAPS_API_KEY = originalEnv;
    global.fetch = originalFetch;
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
});
