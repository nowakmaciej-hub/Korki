import { useEffect, useState } from "react";
import { fetchTrafficSnapshot } from "./lib/api";
import type { CitySnapshot, RouteMetric, TrafficSnapshot } from "./types";

function formatSnapshotTime(value: string): string {
  return new Intl.DateTimeFormat("pl-PL", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

function MetricPill({
  label,
  value
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="metric-pill">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function RouteTable({
  title,
  routes
}: {
  title: string;
  routes: RouteMetric[];
}) {
  return (
    <section className="route-group">
      <div className="section-heading">
        <h3>{title}</h3>
        <span>{routes.length} trasy</span>
      </div>
      <div className="table-shell">
        <table>
          <thead>
            <tr>
              <th>Cel</th>
              <th>Dystans</th>
              <th>Czas</th>
              <th>min/km</th>
            </tr>
          </thead>
          <tbody>
            {routes.map((route) => (
              <tr key={`${title}-${route.destinationLabel}`}>
                <td>{route.destinationLabel}</td>
                <td>{route.distanceKm.toFixed(1)} km</td>
                <td>{route.durationMinutes.toFixed(1)} min</td>
                <td>{route.minutesPerKm.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function CityCard({
  city,
  generatedAt
}: {
  city: CitySnapshot;
  generatedAt: string;
}) {
  return (
    <article className="city-card">
      <div className="city-card__header">
        <div>
          <p className="eyebrow">Miasto</p>
          <h2>{city.label}</h2>
        </div>
        <div className="generated-at">
          <span>Ostatnia probka</span>
          <strong>{formatSnapshotTime(generatedAt)}</strong>
        </div>
      </div>

      <div className="origin-banner">
        <span>Punkt startowy</span>
        <strong>{city.selectedOrigin}</strong>
      </div>

      <div className="metrics-grid">
        <MetricPill
          label="Sredni czas"
          value={`${city.summary.avgDurationMinutes.toFixed(1)} min`}
        />
        <MetricPill
          label="Sredni dystans"
          value={`${city.summary.avgDistanceKm.toFixed(1)} km`}
        />
        <MetricPill
          label="Srednie min/km"
          value={city.summary.avgMinutesPerKm.toFixed(2)}
        />
      </div>

      <div className="route-extremes">
        <div>
          <span>Najszybsza</span>
          <strong>{city.summary.fastestRoute.destinationLabel}</strong>
          <small>{city.summary.fastestRoute.durationMinutes.toFixed(1)} min</small>
        </div>
        <div>
          <span>Najwolniejsza</span>
          <strong>{city.summary.slowestRoute.destinationLabel}</strong>
          <small>{city.summary.slowestRoute.durationMinutes.toFixed(1)} min</small>
        </div>
      </div>

      <RouteTable title="Biznes" routes={city.businessRoutes} />
      <RouteTable title="Mieszkalne" routes={city.residentialRoutes} />
    </article>
  );
}

export default function App() {
  const [snapshot, setSnapshot] = useState<TrafficSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadSnapshot(isManualRefresh = false) {
    setError(null);

    if (isManualRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const nextSnapshot = await fetchTrafficSnapshot();
      setSnapshot(nextSnapshot);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Nie udalo sie pobrac danych."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    void loadSnapshot();
  }, []);

  return (
    <div className="app-shell">
      <header className="hero">
        <div className="hero__copy">
          <p className="eyebrow">Korki teraz</p>
          <h1>Warszawa i Wroclaw w jednym, drogowym kadrze.</h1>
          <p className="hero__lede">
            Losujemy po trzy adresy biznesowe i mieszkalne, a potem mierzymy
            realny czas dojazdu samochodem z miejskiego hubu.
          </p>
        </div>
        <div className="hero__actions">
          <button
            className="refresh-button"
            type="button"
            onClick={() => void loadSnapshot(true)}
            disabled={loading || refreshing}
          >
            {refreshing ? "Odswiezanie..." : "Odswiez probke"}
          </button>
          <p className="hero__hint">Dane sa zawsze bez cache i tylko dla auta.</p>
        </div>
      </header>

      {loading && (
        <section className="status-card" aria-live="polite">
          <h2>Pobieram ruch drogowy...</h2>
          <p>Trwa losowanie adresow i pobieranie aktualnych czasow przejazdu.</p>
        </section>
      )}

      {!loading && error && (
        <section className="status-card status-card--error" aria-live="assertive">
          <h2>Nie udalo sie pobrac danych</h2>
          <p>{error}</p>
          <button type="button" className="secondary-button" onClick={() => void loadSnapshot(true)}>
            Sprobuj ponownie
          </button>
        </section>
      )}

      {!loading && !error && snapshot && (
        <main className="cities-grid" data-testid="cities-grid">
          {snapshot.cities.map((city) => (
            <CityCard
              key={city.id}
              city={city}
              generatedAt={snapshot.generatedAt}
            />
          ))}
        </main>
      )}

      {!loading && !error && !snapshot && (
        <section className="status-card">
          <h2>Brak danych</h2>
          <p>Snapshot ruchu nie zwrocil zadnych wynikow.</p>
        </section>
      )}
    </div>
  );
}
