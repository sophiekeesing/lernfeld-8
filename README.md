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
│   │   ├── components/
│   │   │   ├── LoginPage.tsx    # Spotify login screen
│   │   │   └── TripForm.tsx     # Trip input & playlist generation
│   │   └── services/
│   │       ├── auth.ts          # Backend auth helpers
│   │       ├── db.ts            # Trip lookup client
│   │       ├── playlist.ts      # Song picking logic
│   │       └── spotify.ts       # Spotify Web API client
│   ├── public/
│   ├── index.html
│   ├── vite.config.ts
│   └── package.json
├── backend/
│   └── server.js               # Express server (auth + trip API)
├── images/                      # Architecture diagrams
└── README.md
```

## License

See [LICENSE](LICENSE) for details.
