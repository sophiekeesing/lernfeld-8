import { describe, it, expect } from "vitest";
import { pickSongs, formatDuration } from "../services/playlist";
import type { SpotifyTrack } from "../services/spotify";

function makeTrack(
  overrides: Partial<SpotifyTrack> & {
    id: string;
    name: string;
    duration_ms: number;
  },
): SpotifyTrack {
  return {
    uri: `spotify:track:${overrides.id}`,
    artists: [{ id: "a1", name: "Artist" }],
    album: { name: "Album", images: [] },
    ...overrides,
  };
}

describe("formatDuration", () => {
  it("formats minutes only", () => {
    expect(formatDuration(5 * 60_000)).toBe("5min");
  });

  it("formats hours and minutes", () => {
    expect(formatDuration(90 * 60_000)).toBe("1h 30min");
  });

  it("formats zero", () => {
    expect(formatDuration(0)).toBe("0min");
  });

  it("rounds to nearest minute", () => {
    expect(formatDuration(150_000)).toBe("3min"); // 2.5 min rounds to 3
  });
});

describe("pickSongs", () => {
  const tracks: SpotifyTrack[] = [
    makeTrack({ id: "1", name: "Song One", duration_ms: 3 * 60_000 }),
    makeTrack({ id: "2", name: "Song Two", duration_ms: 4 * 60_000 }),
    makeTrack({
      id: "3",
      name: "Rock Anthem",
      duration_ms: 5 * 60_000,
      artists: [{ id: "a2", name: "Rock Band" }],
    }),
    makeTrack({ id: "4", name: "Chill Vibes", duration_ms: 3 * 60_000 }),
    makeTrack({ id: "5", name: "Long Song", duration_ms: 10 * 60_000 }),
  ];

  it("picks songs that fit within trip duration", () => {
    const selected = pickSongs(tracks, 10); // 10 minutes
    const totalMs = selected.reduce((sum, t) => sum + t.duration_ms, 0);
    // Should not exceed trip duration + 1 minute buffer
    expect(totalMs).toBeLessThanOrEqual(11 * 60_000);
    expect(selected.length).toBeGreaterThan(0);
  });

  it("returns empty array for zero-length trip", () => {
    const selected = pickSongs(tracks, 0);
    expect(selected).toHaveLength(0);
  });

  it("filters by keyword on track name", () => {
    const selected = pickSongs(tracks, 60, "rock");
    // "Rock Anthem" should be included
    expect(selected.some((t) => t.name === "Rock Anthem")).toBe(true);
  });

  it("filters by keyword on artist name", () => {
    const selected = pickSongs(tracks, 60, "Rock Band");
    expect(selected.some((t) => t.artists[0].name === "Rock Band")).toBe(true);
  });

  it("falls back to all tracks if keyword matches fewer than 3", () => {
    const selected = pickSongs(tracks, 60, "zzz_nonexistent");
    // Should fallback to unfiltered pool since no matches
    expect(selected.length).toBeGreaterThan(0);
  });

  it("does not exceed target duration by more than 1 minute", () => {
    const selected = pickSongs(tracks, 7);
    const totalMs = selected.reduce((sum, t) => sum + t.duration_ms, 0);
    expect(totalMs).toBeLessThanOrEqual(8 * 60_000);
  });
});
