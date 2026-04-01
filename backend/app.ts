import express, { Request, Response } from "express";
import cors from "cors";
import { readFileSync } from "fs";
import { createClient } from "db-vendo-client";
import { profile as dbProfile } from "db-vendo-client/p/db/index.js";

// Load .env manually (no dotenv dependency needed)
try {
  const envFile = readFileSync(new URL("./.env", import.meta.url), "utf-8");
  for (const line of envFile.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx);
    const value = trimmed.slice(idx + 1);
    if (!process.env[key]) process.env[key] = value;
  }
} catch {
  console.warn("No .env file found — using environment variables");
}

const {
  SPOTIFY_CLIENT_ID,
  SPOTIFY_CLIENT_SECRET,
  SPOTIFY_REDIRECT_URI = "http://127.0.0.1:3001/auth/callback",
  FRONTEND_URL = "http://localhost:5173",
} = process.env;

if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET) {
  console.error("Missing SPOTIFY_CLIENT_ID or SPOTIFY_CLIENT_SECRET in .env");
  process.exit(1);
}

interface TokenData {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  obtained_at: number;
  scope?: string;
  [key: string]: unknown;
}

const hafas = createClient(dbProfile, "trainify-app");

const app = express();

const allowedOrigins = [FRONTEND_URL];
if (process.env.NODE_ENV !== "production") {
  allowedOrigins.push("http://localhost:5173", "http://127.0.0.1:5173");
}

app.use(
  cors({
    origin: allowedOrigins,
  }),
);

// In-memory token store (per-session; fine for local dev)
let tokenData: TokenData | null = null;

// Exported for testing — reset token state between tests
export function _resetTokenData(): void {
  tokenData = null;
}
export function _setTokenData(data: TokenData | null): void {
  tokenData = data;
}

const SCOPES =
  "user-library-read playlist-modify-private playlist-modify-public";

// 1. Redirect user to Spotify login
app.get("/auth/login", (_req: Request, res: Response) => {
  const params = new URLSearchParams({
    response_type: "code",
    client_id: SPOTIFY_CLIENT_ID!,
    scope: SCOPES,
    redirect_uri: SPOTIFY_REDIRECT_URI,
    show_dialog: "true",
  });
  res.redirect(`https://accounts.spotify.com/authorize?${params}`);
});

// 2. Spotify redirects here after login — exchange code for tokens
app.get("/auth/callback", async (req: Request, res: Response) => {
  const { code, error } = req.query;
  if (error || !code) {
    return res.redirect(`${FRONTEND_URL}?error=${error || "no_code"}`);
  }

  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code: String(code),
    redirect_uri: SPOTIFY_REDIRECT_URI,
  });

  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization:
        "Basic " +
        Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString(
          "base64",
        ),
    },
    body,
  });

  if (!response.ok) {
    const text = await response.text();
    console.error("Token exchange failed:", text);
    return res.redirect(`${FRONTEND_URL}?error=token_exchange_failed`);
  }

  const json = await response.json();
  tokenData = { ...json, obtained_at: Date.now() } as TokenData;
  console.log("Token granted with scopes:", tokenData.scope);

  res.redirect(`${FRONTEND_URL}?logged_in=true`);
});

// 3. Frontend calls this to get the current access token
app.get("/auth/token", async (_req: Request, res: Response) => {
  if (!tokenData) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  // Refresh if expired (tokens last 1 hour)
  const elapsed = Date.now() - tokenData.obtained_at;
  if (elapsed > (tokenData.expires_in - 60) * 1000 && tokenData.refresh_token) {
    const body = new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: tokenData.refresh_token,
    });

    const response = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization:
          "Basic " +
          Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString(
            "base64",
          ),
      },
      body,
    });

    if (response.ok) {
      const refreshed = await response.json();
      tokenData = {
        ...tokenData,
        ...refreshed,
        obtained_at: Date.now(),
      };
    }
  }

  res.json({ access_token: tokenData!.access_token });
});

// 4. Logout
app.post("/auth/logout", (_req: Request, res: Response) => {
  tokenData = null;
  res.json({ ok: true });
});

// 5. Trip lookup via hafas-client (direct DB HAFAS access)
app.get("/api/trip", async (req: Request, res: Response) => {
  const { from, to } = req.query;
  if (!from || !to) {
    return res
      .status(400)
      .json({ error: "Missing 'from' and/or 'to' query params" });
  }

  try {
    // Resolve station names to locations
    const [fromResults, toResults] = await Promise.all([
      hafas.locations(String(from), { results: 1 }),
      hafas.locations(String(to), { results: 1 }),
    ]);

    if (!fromResults.length)
      return res.status(404).json({ error: `No station found for "${from}"` });
    if (!toResults.length)
      return res.status(404).json({ error: `No station found for "${to}"` });

    const fromId = fromResults[0].id;
    const toId = toResults[0].id;

    // Get journeys
    const { journeys } = await hafas.journeys(fromId, toId, { results: 1 });
    if (!journeys || !journeys.length) {
      return res.status(404).json({ error: "No journey found for this route" });
    }

    const journey = journeys[0];
    const legs = journey.legs;
    const firstLeg = legs[0];
    const lastLeg = legs[legs.length - 1];

    const departure = firstLeg.departure ?? firstLeg.plannedDeparture ?? "";
    const arrival = lastLeg.arrival ?? lastLeg.plannedArrival ?? "";

    const depTime = new Date(departure).getTime();
    const arrTime = new Date(arrival).getTime();
    const durationMinutes = Math.round((arrTime - depTime) / 60_000);

    res.json({
      origin: firstLeg.origin,
      destination: lastLeg.destination,
      departure,
      arrival,
      durationMinutes,
    });
  } catch (err) {
    console.error("Trip lookup failed:", err);
    res
      .status(502)
      .json({ error: "Trip lookup failed. Please try again later." });
  }
});

export { app, hafas };
