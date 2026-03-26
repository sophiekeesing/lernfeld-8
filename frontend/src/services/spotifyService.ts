// Spotify API Service
const SPOTIFY_API_BASE = 'https://api.spotify.com/v1'

interface SpotifyTrack {
  id: string
  name: string
  artists: Array<{ name: string }>
  duration_ms: number
  uri: string
}

interface PlaylistResponse {
  id: string
  external_urls: { spotify: string }
}

class SpotifyService {
  private accessToken: string | null = null

  setAccessToken(token: string) {
    this.accessToken = token
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    if (!this.accessToken) {
      throw new Error('No access token. Please login first.')
    }

    const response = await fetch(`${SPOTIFY_API_BASE}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
        ...options.headers
      }
    })

    if (!response.ok) {
      throw new Error(`Spotify API error: ${response.statusText}`)
    }

    return response.json()
  }

  async getCurrentUser() {
    return this.request('/me')
  }

  async getUserTracks(limit = 50, offset = 0) {
    return this.request(`/me/tracks?limit=${limit}&offset=${offset}`)
  }

  async getAllUserTracks() {
    const allTracks: SpotifyTrack[] = []
    let offset = 0
    const limit = 50

    let hasMore = true
    while (hasMore) {
      const response = await this.getUserTracks(limit, offset)
      const tracks = response.items.map((item: { track: SpotifyTrack }) => item.track)
      allTracks.push(...tracks)
      
      hasMore = response.next !== null
      offset += limit
    }

    return allTracks
  }

  async createPlaylist(userId: string, playlistName: string, description = '') {
    return this.request(`/users/${userId}/playlists`, {
      method: 'POST',
      body: JSON.stringify({
        name: playlistName,
        description,
        public: false
      })
    }) as Promise<PlaylistResponse>
  }

  async addTracksToPlaylist(playlistId: string, trackUris: string[]) {
    // Spotify limits 100 tracks per request
    const chunks = []
    for (let i = 0; i < trackUris.length; i += 100) {
      chunks.push(trackUris.slice(i, i + 100))
    }

    for (const chunk of chunks) {
      await this.request(`/playlists/${playlistId}/tracks`, {
        method: 'POST',
        body: JSON.stringify({
          uris: chunk
        })
      })
    }
  }
}

export default new SpotifyService()
