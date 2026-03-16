import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App";
import type { TrafficSnapshot } from "./types";

const snapshotA: TrafficSnapshot = {
  generatedAt: "2026-03-16T12:00:00.000Z",
  cities: [
    {
      id: "warsaw",
      label: "Warszawa",
      selectedOrigin: "Rondo Daszynskiego",
      businessRoutes: [
        {
          category: "business",
          originLabel: "Rondo Daszynskiego",
          destinationLabel: "Warsaw Spire",
          distanceKm: 2.4,
          durationMinutes: 10.2,
          minutesPerKm: 4.25
        },
        {
          category: "business",
          originLabel: "Rondo Daszynskiego",
          destinationLabel: "Galeria Mokotow",
          distanceKm: 8.1,
          durationMinutes: 21.6,
          minutesPerKm: 2.67
        },
        {
          category: "business",
          originLabel: "Rondo Daszynskiego",
          destinationLabel: "Blue City",
          distanceKm: 6.3,
          durationMinutes: 17.4,
          minutesPerKm: 2.76
        }
      ],
      residentialRoutes: [
        {
          category: "residential",
          originLabel: "Rondo Daszynskiego",
          destinationLabel: "Bemowo, Powstancow Slaskich",
          distanceKm: 8.7,
          durationMinutes: 18.4,
          minutesPerKm: 2.11
        },
        {
          category: "residential",
          originLabel: "Rondo Daszynskiego",
          destinationLabel: "Zoliborz, Rydygiera",
          distanceKm: 4.5,
          durationMinutes: 11.5,
          minutesPerKm: 2.56
        },
        {
          category: "residential",
          originLabel: "Rondo Daszynskiego",
          destinationLabel: "Saska Kepa, Francuska",
          distanceKm: 7.1,
          durationMinutes: 19.2,
          minutesPerKm: 2.7
        }
      ],
      summary: {
        avgDurationMinutes: 16.4,
        avgDistanceKm: 6.2,
        avgMinutesPerKm: 2.84,
        fastestRoute: {
          category: "business",
          originLabel: "Rondo Daszynskiego",
          destinationLabel: "Warsaw Spire",
          distanceKm: 2.4,
          durationMinutes: 10.2,
          minutesPerKm: 4.25
        },
        slowestRoute: {
          category: "business",
          originLabel: "Rondo Daszynskiego",
          destinationLabel: "Galeria Mokotow",
          distanceKm: 8.1,
          durationMinutes: 21.6,
          minutesPerKm: 2.67
        }
      }
    },
    {
      id: "wroclaw",
      label: "Wroclaw",
      selectedOrigin: "Rynek",
      businessRoutes: [
        {
          category: "business",
          originLabel: "Rynek",
          destinationLabel: "Sky Tower",
          distanceKm: 2.1,
          durationMinutes: 8.5,
          minutesPerKm: 4.05
        },
        {
          category: "business",
          originLabel: "Rynek",
          destinationLabel: "Magnolia Park",
          distanceKm: 5.6,
          durationMinutes: 15.4,
          minutesPerKm: 2.75
        },
        {
          category: "business",
          originLabel: "Rynek",
          destinationLabel: "Green2Day",
          distanceKm: 3.4,
          durationMinutes: 11.3,
          minutesPerKm: 3.32
        }
      ],
      residentialRoutes: [
        {
          category: "residential",
          originLabel: "Rynek",
          destinationLabel: "Jagodno",
          distanceKm: 9.2,
          durationMinutes: 24.1,
          minutesPerKm: 2.62
        },
        {
          category: "residential",
          originLabel: "Rynek",
          destinationLabel: "Popowice",
          distanceKm: 4.1,
          durationMinutes: 12.6,
          minutesPerKm: 3.07
        },
        {
          category: "residential",
          originLabel: "Rynek",
          destinationLabel: "Lesnica",
          distanceKm: 14.8,
          durationMinutes: 28.4,
          minutesPerKm: 1.92
        }
      ],
      summary: {
        avgDurationMinutes: 16.7,
        avgDistanceKm: 6.5,
        avgMinutesPerKm: 2.95,
        fastestRoute: {
          category: "business",
          originLabel: "Rynek",
          destinationLabel: "Sky Tower",
          distanceKm: 2.1,
          durationMinutes: 8.5,
          minutesPerKm: 4.05
        },
        slowestRoute: {
          category: "residential",
          originLabel: "Rynek",
          destinationLabel: "Lesnica",
          distanceKm: 14.8,
          durationMinutes: 28.4,
          minutesPerKm: 1.92
        }
      }
    }
  ]
};

const snapshotB: TrafficSnapshot = {
  ...snapshotA,
  generatedAt: "2026-03-16T12:05:00.000Z",
  cities: snapshotA.cities.map((city) =>
    city.id === "warsaw"
      ? {
          ...city,
          selectedOrigin: "Plac Zawiszy"
        }
      : city
  )
};

describe("App", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders both cities after the initial load", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => snapshotA
    }) as typeof fetch;

    render(<App />);

    expect(screen.getByText("Pobieram ruch drogowy...")).toBeInTheDocument();
    expect(await screen.findByText("Warszawa")).toBeInTheDocument();
    expect(await screen.findByText("Wroclaw")).toBeInTheDocument();
    expect(screen.getByTestId("cities-grid")).toBeInTheDocument();
  });

  it("refreshes the snapshot on button click", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => snapshotA
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => snapshotB
      });

    global.fetch = fetchMock as typeof fetch;

    render(<App />);
    await screen.findByText("Warszawa");

    await userEvent.click(screen.getByRole("button", { name: "Odswiez probke" }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(2);
    });
    expect(await screen.findByText("Plac Zawiszy")).toBeInTheDocument();
  });

  it("shows an error state when the request fails", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({
        error: "Could not load live traffic snapshot.",
        details: "Google Routes API failed (403): API key is not authorized."
      })
    }) as typeof fetch;

    render(<App />);

    expect(
      await screen.findByText("Nie udalo sie pobrac danych")
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Could not load live traffic snapshot. Google Routes API failed (403): API key is not authorized."
      )
    ).toBeInTheDocument();
  });

  it("keeps a dedicated responsive grid container", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => snapshotA
    }) as typeof fetch;

    render(<App />);

    const grid = await screen.findByTestId("cities-grid");

    expect(grid).toHaveClass("cities-grid");
  });
});
