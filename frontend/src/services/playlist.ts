import type { SpotifyTrack } from "../services/spotify";

/**
 * Pick songs that fill the trip duration as closely as possible.
 *
 * 1. If a keyword is given, filter tracks whose name or artist matches it.
 * 2. Shuffle the (filtered) list for variety.
 * 3. Greedily pick tracks until total duration ≈ trip duration.
 */
export function pickSongs(
  tracks: SpotifyTrack[],
  tripMinutes: number,
  keyword?: string,
): SpotifyTrack[] {
  let pool = tracks;

  // Filter by keyword (case-insensitive match on track name or artist name)
  if (keyword) {
    const kw = keyword.toLowerCase();
    const filtered = pool.filter(
      (t) =>
        t.name.toLowerCase().includes(kw) ||
        t.artists.some((a) => a.name.toLowerCase().includes(kw)),
    );
    // Only use filtered list if it has enough songs; otherwise fall back to all
    if (filtered.length >= 3) {
      pool = filtered;
    }
  }

  // Shuffle (Fisher-Yates)
  pool = [...pool];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  const targetMs = tripMinutes * 60_000;
  const selected: SpotifyTrack[] = [];
  let totalMs = 0;

  for (const track of pool) {
    if (totalMs + track.duration_ms > targetMs + 60_000) continue; // allow 1 min over
    selected.push(track);
    totalMs += track.duration_ms;
    if (totalMs >= targetMs) break;
  }

  return selected;
}

/** Format milliseconds as "Xh Ym" or "Ym". */
export function formatDuration(ms: number): string {
  const totalMin = Math.round(ms / 60_000);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return h > 0 ? `${h}h ${m}min` : `${m}min`;
}
