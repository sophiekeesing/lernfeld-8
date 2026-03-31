# 🚆🎵 Trainify

A web app that generates a Spotify playlist tailored to the duration of your train journey. Enter your train details, and Trainify picks songs from your liked tracks that fill exactly the travel time.

## User Experience

The user opens the app and is greeted by a single screen with a **"Login with Spotify"** button. After approving access, they land on the main form where they enter three things:

1. A **departure station** (e.g. Hamburg Hbf)
2. A **destination station** (e.g. Berlin Hbf)
3. An optional **keyword** like "rock" or "chill"

They hit **Generate**, and within a few seconds a new playlist appears in their Spotify — named after the route, already the perfect length for the trip.

## Architecture

![Trainify Architecture](images/trainify_architecture.jpg)

## Tech Stack

### Frontend

- **React 19 + Vite** — existing setup
- **TypeScript**
- Plain **CSS** for styling (no UI library needed)

### Backend

- **Node.js + Express** — a small server with just a few endpoints
- Required because Spotify's OAuth flow needs a `client_secret` which must never be exposed in the browser. The backend handles the token exchange securely.

### APIs

| API                                  | Purpose                       | Auth                  |
| ------------------------------------ | ----------------------------- | --------------------- |
| **DB HAFAS** (via `db-vendo-client`) | Journey duration              | None — no key needed  |
| **Spotify Web API**                  | Liked songs + create playlist | OAuth 2.0 via backend |

## Backend Endpoints

| Method | Route            | Description                                                             |
| ------ | ---------------- | ----------------------------------------------------------------------- |
| `GET`  | `/auth/login`    | Redirects user to Spotify login page                                    |
| `GET`  | `/auth/callback` | Spotify redirects here after login; exchanges code for token            |
| `GET`  | `/auth/token`    | Frontend calls this to get the access token (auto-refreshes if expired) |
| `POST` | `/auth/logout`   | Clears stored token                                                     |
| `GET`  | `/api/trip`      | Resolves stations via HAFAS and returns journey duration                |

Spotify liked songs and playlist creation are called directly from the React frontend using the access token.

## Key Implementation Details

1. **Spotify developer account** — register at [developer.spotify.com](https://developer.spotify.com), get a `client_id` and `client_secret`, set redirect URI to `http://localhost:3000/auth/callback`
2. **Scopes** — `user-library-read` (read liked songs), `playlist-modify-private` and `playlist-modify-public` (create playlists)
3. **Duration math** — the HAFAS response includes departure and arrival timestamps; the backend subtracts them to get trip minutes, then the frontend greedily picks songs until total track duration fills that window
4. **Keyword filtering** — Spotify's liked songs have track name and artist name but not genre tags directly; filter by matching keyword against track/artist names, or optionally call `GET /artists/{id}` to get genre tags

## Getting Started

```bash
# Clone the repo
git clone https://github.com/sophiekeesing/lernfeld-8.git
cd lernfeld-8/frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

The app will be available at `http://localhost:5173`.

## Project Structure

```
lernfeld-8/
├── frontend/
│   ├── src/
│   │   ├── App.tsx              # Main application component
│   │   ├── main.tsx             # Entry point
│   │   ├── setupTests.ts       # Test setup (jest-dom)
│   │   ├── __tests__/          # Frontend unit tests
│   │   ├── components/
│   │   │   ├── LoginPage.tsx    # Spotify login screen
│   │   │   └── TripForm.tsx     # Trip input & playlist generation
│   │   └── services/
│   │       ├── auth.ts          # Backend auth helpers
│   │       ├── db.ts            # Trip lookup client
│   │       ├── playlist.ts      # Song picking logic
│   │       └── spotify.ts       # Spotify Web API client
│   ├── vitest.config.ts         # Vitest test config
│   └── package.json
├── backend/
│   ├── app.ts                   # Express app (routes & logic)
│   ├── server.ts                # Entry point (starts listener)
│   ├── tsconfig.json            # Backend TypeScript config
│   ├── vitest.config.ts         # Backend Vitest config
│   ├── types/                   # Custom type declarations
│   └── __tests__/               # Backend integration tests
├── .github/workflows/
│   ├── ci.yml                   # CI pipeline (lint, format, typecheck, tests)
│   └── cd.yml                   # CD pipeline (build & deploy)
├── monitoring/
│   └── health-check.sh          # Production health-check script
├── docs/
│   └── pipeline-sequence-diagram.md  # Pipeline sequence diagram
├── docker-compose.yml
├── Makefile                     # Dev & QA commands
└── README.md
```

## MoSCoW — Anforderungen & Umsetzung

### ✅ Must Haves

| Anforderung                                                     | Status | Umsetzung                                                                                                                    |
| --------------------------------------------------------------- | ------ | ---------------------------------------------------------------------------------------------------------------------------- |
| Ein Commit wird automatisiert in die Testumgebung gebracht (CI) | ✅     | GitHub Actions CI-Pipeline (`.github/workflows/ci.yml`) läuft bei jedem Push auf jeden Branch und bei PRs auf `main`         |
| Unit Tests werden in der CI-Umgebung automatisiert ausgeführt   | ✅     | 21 Frontend-Tests (Vitest + React Testing Library) + 8 Backend-Tests (Vitest + Supertest) laufen automatisch in der Pipeline |
| Sequenzdiagramm für die Pipeline erstellt                       | ✅     | Mermaid-Sequenzdiagramm in `docs/pipeline-sequence-diagram.md` inkl. Entwicklung, QA, Protokolle                             |

### ✅ Should Haves

| Anforderung                                                 | Status | Umsetzung                                                                                                                                                       |
| ----------------------------------------------------------- | ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Pipeline enthält mindestens drei QA-Maßnahmen (neben Tests) | ✅     | 7 QA-Maßnahmen: ESLint, Prettier Format-Check, TypeScript Type-Checking (Frontend + Backend), Unit Tests, Integrationstests, Build-Verifikation, Security Audit |
| Integrationstests werden automatisiert ausgeführt           | ✅     | 8 Backend-Integrationstests (Supertest gegen Express-Routen) in CI                                                                                              |

### ✅ Could Haves

| Anforderung                                  | Status | Umsetzung                                                                                    |
| -------------------------------------------- | ------ | -------------------------------------------------------------------------------------------- |
| Continuous Deployment in Produktivumgebung   | ✅     | CD-Pipeline (`.github/workflows/cd.yml`) baut Docker-Images nach erfolgreichem CI auf `main` |
| Software in Produktivumgebung bereitgestellt | ✅     | Docker Compose Setup (`docker-compose.yml`) — bereit für Deployment                          |
| Monitoring der Produktionsumgebung           | ✅     | Health-Check-Script (`monitoring/health-check.sh`) prüft Backend- und Frontend-Endpunkte     |

### QA-Maßnahmen im Detail

Alle können manuell via `make` ausgeführt werden:

| Make-Befehl          | Zweck                                   |
| -------------------- | --------------------------------------- |
| `make test`          | Alle Tests (Frontend + Backend)         |
| `make test-frontend` | Nur Frontend-Unit-Tests                 |
| `make test-backend`  | Nur Backend-Integrationstests           |
| `make lint`          | ESLint Code-Qualitätsprüfung            |
| `make format`        | Prettier Format-Check                   |
| `make typecheck`     | TypeScript-Prüfung (Frontend + Backend) |
| `make lft`           | Kombiniert: Lint + Format + Typecheck   |

## License

See [LICENSE](LICENSE) for details.
