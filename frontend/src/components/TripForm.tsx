import { useState } from "react";
import type { SpotifyTrack } from "../services/spotify";
import { fetchTrip } from "../services/db";
import { fetchLikedSongs, fetchMe, createPlaylist } from "../services/spotify";
import { pickSongs, formatDuration } from "../services/playlist";
import "./TripForm.css";

interface Props {
  token: string;
}

interface Result {
  from: string;
  to: string;
  durationMin: number;
  tracks: SpotifyTrack[];
  playlistUrl: string;
  tracksAdded: boolean;
}

export default function TripForm({ token }: Props) {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [copied, setCopied] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setResult(null);
    setLoading(true);

    try {
      // 1. Fetch trip duration and liked songs in parallel
      const [trip, songs, me] = await Promise.all([
        fetchTrip(from, to),
        fetchLikedSongs(token),
        fetchMe(token),
      ]);

      if (songs.length === 0) {
        throw new Error(
          "You have no liked songs on Spotify. Like some songs first!",
        );
      }

      // 2. Pick songs to fill the trip
      const selected = pickSongs(
        songs,
        trip.durationMinutes,
        keyword || undefined,
      );

      if (selected.length === 0) {
        throw new Error(
          "No matching songs found. Try a different keyword or like more songs.",
        );
      }

      // 3. Create playlist
      const totalMs = selected.reduce((sum, t) => sum + t.duration_ms, 0);
      const playlistName = `${from} → ${to} 🚂 · ${formatDuration(trip.durationMinutes * 60_000)}`;
      const playlistDesc = `Trainify playlist for your ${formatDuration(trip.durationMinutes * 60_000)} journey. ${selected.length} songs, ${formatDuration(totalMs)} total.`;

      const { url: playlistUrl, tracksAdded } = await createPlaylist(
        token,
        me.id,
        playlistName,
        playlistDesc,
        selected.map((t) => t.uri),
      );

      setResult({
        from,
        to,
        durationMin: trip.durationMinutes,
        tracks: selected,
        playlistUrl,
        tracksAdded,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="trip-form-page">
      <header className="app-header">
        <h1>🚆🎵 Trainify</h1>
      </header>

      <form className="trip-form" onSubmit={handleSubmit}>
        <div className="form-row">
          <label>
            <span>From</span>
            <input
              type="text"
              placeholder="e.g. Hamburg Hbf"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              required
            />
          </label>
          <span className="arrow">→</span>
          <label>
            <span>To</span>
            <input
              type="text"
              placeholder="e.g. Berlin Hbf"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              required
            />
          </label>
        </div>

        <label>
          <span>
            Keyword <small>(optional)</small>
          </span>
          <input
            type="text"
            placeholder='e.g. "rock", "chill", artist name…'
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
        </label>

        <button type="submit" className="generate-btn" disabled={loading}>
          {loading ? "Generating…" : "Generate Playlist"}
        </button>

        {error && <p className="error">{error}</p>}
      </form>

      {result && (
        <div className="result">
          <h2>
            {result.from} → {result.to} 🚂 ·{" "}
            {formatDuration(result.durationMin * 60_000)}
          </h2>
          <p className="result-meta">
            {result.tracks.length} songs ·{" "}
            {formatDuration(
              result.tracks.reduce((s, t) => s + t.duration_ms, 0),
            )}{" "}
            total
          </p>
          <a
            href={result.playlistUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="open-btn"
          >
            Open in Spotify
          </a>
          {!result.tracksAdded && (
            <>
              <p className="error" style={{ marginTop: "0.5rem" }}>
                Tracks could not be added automatically (Spotify Dev Mode
                restriction). Click the button below to copy all tracks, then
                open your playlist in the Spotify desktop app and press Cmd+V
                (or Ctrl+V) to paste them all at once.
              </p>
              <button
                className="generate-btn"
                style={{ marginTop: "0.5rem" }}
                onClick={() => {
                  const uris = result.tracks.map((t) => t.uri).join("\n");
                  navigator.clipboard.writeText(uris).then(() => {
                    setCopied(true);
                    setTimeout(() => setCopied(false), 3000);
                  });
                }}
              >
                {copied ? "Copied!" : "Copy All Tracks to Clipboard"}
              </button>
            </>
          )}
          <ul className="track-list">
            {result.tracks.map((t, i) => (
              <li key={t.id}>
                <span className="track-num">{i + 1}</span>
                {t.album.images[2] && (
                  <img
                    src={t.album.images[2].url}
                    alt=""
                    className="track-art"
                  />
                )}
                <div className="track-info">
                  <span className="track-name">{t.name}</span>
                  <span className="track-artist">
                    {t.artists.map((a) => a.name).join(", ")}
                  </span>
                </div>
                <span className="track-dur">
                  {formatDuration(t.duration_ms)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
