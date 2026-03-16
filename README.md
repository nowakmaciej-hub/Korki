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
4. Run `npm run dev`.

For the serverless function in local Netlify mode, use Netlify CLI if you want the frontend and function on one origin.

## Build

- `npm run build`
- `npm run test`

## Environment

- `GOOGLE_MAPS_API_KEY`: required for the live traffic snapshot function.
