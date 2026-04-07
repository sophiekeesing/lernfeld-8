# 🚆🎵 Trainify

A web app that generates a Spotify playlist tailored to the duration of your train journey. Enter your train details, and Trainify picks songs from your liked tracks that fill exactly the travel time.

**Live:** [https://ske.solutionshosted.de](https://ske.solutionshosted.de)

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

- **React 19 + Vite** — responsive UI with mobile support
- **TypeScript**
- Plain **CSS** for styling (with mobile-first media queries)

### Backend

- **Node.js + Express** — a small server with just a few endpoints
- Required because Spotify's OAuth flow needs a `client_secret` which must never be exposed in the browser. The backend handles the token exchange securely.

### Infrastructure

- **Docker** — containerised frontend, backend, and nginx
- **Nginx** — reverse proxy with SSL termination, routing `ske.solutionshosted.de` → frontend and `api.ske.solutionshosted.de` → backend
- **Let's Encrypt / Certbot** — automatic HTTPS certificates
- **GitHub Container Registry (GHCR)** — stores Docker images
- **GitHub Actions** — CI/CD pipelines for testing and deployment

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

## Deployment

Trainify is deployed automatically on every push to `main`.

### How it works

1. **CI** (`.github/workflows/ci.yml`) — runs lint, format check, typecheck, and tests on every push
2. **CD** (`.github/workflows/deploy.yml`) — on push to `main`:
   - Builds Docker images for `linux/arm64` (cross-compiled via QEMU)
   - Pushes images to GitHub Container Registry (GHCR)
   - Copies `docker-compose.deploy.yml` and `nginx.conf` to the server via SCP
   - SSHs into the server, pulls new images, and restarts containers

### Production stack

| Component    | Role                                           |
| ------------ | ---------------------------------------------- |
| **Nginx**    | Reverse proxy, SSL termination, domain routing |
| **Certbot**  | Let's Encrypt SSL certificates                 |
| **Frontend** | Vite dev server (port 5173, internal only)     |
| **Backend**  | Express server (port 3001, internal only)      |

### Domains

| Domain                               | Routes to |
| ------------------------------------ | --------- |
| `https://ske.solutionshosted.de`     | Frontend  |
| `https://api.ske.solutionshosted.de` | Backend   |

### Required GitHub Secrets

| Secret            | Description                    |
| ----------------- | ------------------------------ |
| `SERVER_HOST`     | Server IP address              |
| `SERVER_USER`     | SSH username                   |
| `SSH_PRIVATE_KEY` | SSH private key for deployment |

### Server `.env` file

A `.env` file must exist at `/root/app/.env` on the server (not committed to git):

```
SPOTIFY_CLIENT_ID=...
SPOTIFY_CLIENT_SECRET=...
SPOTIFY_REDIRECT_URI=https://api.ske.solutionshosted.de/auth/callback
FRONTEND_URL=https://ske.solutionshosted.de
```

## Key Implementation Details

1. **Spotify developer account** — register at [developer.spotify.com](https://developer.spotify.com), get a `client_id` and `client_secret`, set redirect URI to `https://api.ske.solutionshosted.de/auth/callback`
2. **Scopes** — `user-library-read` (read liked songs), `playlist-modify-private` and `playlist-modify-public` (create playlists)
3. **Duration math** — the HAFAS response includes departure and arrival timestamps; the backend subtracts them to get trip minutes, then the frontend greedily picks songs until total track duration fills that window
4. **Keyword filtering** — Spotify's liked songs have track name and artist name but not genre tags directly; filter by matching keyword against track/artist names, or optionally call `GET /artists/{id}` to get genre tags

## Getting Started (Local Development)

```bash
# Clone the repo
git clone https://github.com/sophiekeesing/lernfeld-8.git
cd lernfeld-8

# Start everything with Docker
make run

# Or start frontend and backend separately
cd frontend && npm install && npm run dev
cd backend && npm install && npx tsx server.ts
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
│   └── deploy.yml               # CD pipeline (build, push to GHCR, deploy via SSH)
├── nginx.conf                   # Nginx reverse proxy config (SSL + domain routing)
├── docker-compose.yml           # Local development (builds from source)
├── docker-compose.deploy.yml    # Production (pulls GHCR images, nginx, certbot)
├── monitoring/
│   └── health-check.sh          # Production health-check script
├── docs/
│   └── pipeline-sequence-diagram.md  # Pipeline sequence diagram
├── Makefile                     # Dev & QA commands
└── README.md
```

## MoSCoW — Requirements & Implementation

### ✅ Must Haves

| Requirement                                                      | Status | Implementation                                                                                                              |
| ---------------------------------------------------------------- | ------ | --------------------------------------------------------------------------------------------------------------------------- |
| A commit is automatically brought into the test environment (CI) | ✅     | GitHub Actions CI pipeline (`.github/workflows/ci.yml`) runs on every push to any branch and on PRs to `main`               |
| Unit tests are automatically executed in the CI environment      | ✅     | 21 frontend tests (Vitest + React Testing Library) + 8 backend tests (Vitest + Supertest) run automatically in the pipeline |
| Sequence diagram for the pipeline created                        | ✅     | Mermaid sequence diagram in `docs/pipeline-sequence-diagram.md` including development, QA, and protocols                    |

### ✅ Should Haves

| Requirement                                                  | Status | Implementation                                                                                                                                                 |
| ------------------------------------------------------------ | ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Pipeline contains at least three QA measures (besides tests) | ✅     | 7 QA measures: ESLint, Prettier format check, TypeScript type-checking (frontend + backend), unit tests, integration tests, build verification, security audit |
| Integration tests are automatically executed                 | ✅     | 8 backend integration tests (Supertest against Express routes) in CI                                                                                           |

### ✅ Could Haves

| Requirement                                 | Status | Implementation                                                                                                                                     |
| ------------------------------------------- | ------ | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| Continuous Deployment to production         | ✅     | Deploy pipeline (`.github/workflows/deploy.yml`) builds ARM64 Docker images, pushes to GHCR, and deploys to server via SSH on every push to `main` |
| Software deployed in production environment | ✅     | Live at [https://ske.solutionshosted.de](https://ske.solutionshosted.de) with nginx reverse proxy, SSL via Let's Encrypt, and Docker Compose       |
| Monitoring of production environment        | ✅     | Health-check script (`monitoring/health-check.sh`) checks backend and frontend endpoints                                                           |

### Make Commands

All QA checks and fixes can be run manually via `make`:

| Command               | Description                                                 |
| --------------------- | ----------------------------------------------------------- |
| `make test`           | Run all tests (frontend + backend)                          |
| `make test-frontend`  | Run frontend unit tests only                                |
| `make test-backend`   | Run backend integration tests only                          |
| `make test-lint`      | Check for lint issues (ESLint)                              |
| `make test-format`    | Check for formatting issues (Prettier)                      |
| `make test-typecheck` | Check for type errors (TypeScript, frontend + backend)      |
| `make test-lft`       | Combined check: lint + format + typecheck (fails on issues) |
| `make lft`            | Auto-fix lint & formatting issues, then run typecheck       |

## License

See [LICENSE](LICENSE) for details.
