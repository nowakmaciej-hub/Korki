# Korki

Korki is a small Netlify-ready dashboard that shows live car traffic snapshots for Warsaw and Wroclaw. Each refresh randomizes business and residential destinations, then requests traffic-aware drive times from Google Routes API.

## Stack

- React + Vite
- Netlify Functions
- Google Routes API
- Vitest + Testing Library

## Local setup

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env`.
3. Set `GOOGLE_MAPS_API_KEY`.
4. Optionally set `TRAFFIC_REQUESTS_PER_HOUR` to control the Google Routes hourly cap. The default is `20`.
5. Run `npm run dev`.

For the serverless function in local Netlify mode, use Netlify CLI if you want the frontend and function on one origin.

## Build

- `npm run build`
- `npm run test`

## Environment

- `GOOGLE_MAPS_API_KEY`: required for the live traffic snapshot function.
- `TRAFFIC_REQUESTS_PER_HOUR`: optional hourly cap for Google route requests. Defaults to `20`.

## Netlify setup

Add these environment variables in Netlify under Site configuration -> Environment variables:

- `GOOGLE_MAPS_API_KEY`
- `TRAFFIC_REQUESTS_PER_HOUR` (optional, defaults to `20`)

The API key is only read inside the Netlify Function and is never exposed to the browser.
