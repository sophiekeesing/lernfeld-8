const SPOTIFY_API = "https://api.spotify.com/v1";

export interface SpotifyTrack {
  id: string;
  name: string;
  artists: { id: string; name: string }[];
  duration_ms: number;
  uri: string;
  album: {
    name: string;
    images: { url: string }[];
  };
}

/** Fetch all of the user's liked songs (paginated, max ~500 for speed). */
export async function fetchLikedSongs(token: string): Promise<SpotifyTrack[]> {
  const tracks: SpotifyTrack[] = [];
  let url: string | null = `${SPOTIFY_API}/me/tracks?limit=50`;

  while (url && tracks.length < 500) {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error(`Spotify API error: ${res.status}`);
    const data = await res.json();
    for (const item of data.items) {
      tracks.push(item.track);
    }
    url = data.next;
  }

  return tracks;
}

/** Get current user profile. */
export async function fetchMe(
  token: string,
): Promise<{ id: string; display_name: string }> {
  const res = await fetch(`${SPOTIFY_API}/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`Spotify /me error: ${res.status}`);
  return res.json();
}

/** Create a private playlist and add tracks. Returns the playlist URL and whether tracks were added. */
export async function createPlaylist(
  token: string,
  _userId: string,
  name: string,
  description: string,
  trackUris: string[],
): Promise<{ url: string; tracksAdded: boolean }> {
  // Create playlist (use /me/playlists — more reliable than /users/{id}/playlists)
  const createRes = await fetch(`${SPOTIFY_API}/me/playlists`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name,
      description,
      public: false,
    }),
  });
  if (!createRes.ok) {
    const errBody = await createRes.text();
    console.error("Spotify create playlist error:", createRes.status, errBody);
    throw new Error(`Create playlist failed: ${createRes.status}`);
  }
  const playlist = await createRes.json();

  // Add tracks (max 100 per request)
  let tracksAdded = true;
  for (let i = 0; i < trackUris.length; i += 100) {
    const batch = trackUris.slice(i, i + 100);
    const addRes = await fetch(
      `${SPOTIFY_API}/playlists/${playlist.id}/items`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ uris: batch }),
      },
    );
    if (!addRes.ok) {
      console.warn("Could not add tracks to playlist (403 in Dev Mode)");
      tracksAdded = false;
      break;
    }
  }

  return { url: playlist.external_urls.spotify, tracksAdded };
}
