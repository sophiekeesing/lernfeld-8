// Shared TypeScript Interfaces

export interface SpotifyUser {
  id: string
  display_name: string
  email: string
  external_urls: {
    spotify: string
  }
  uri: string
}

export interface SpotifyTrack {
  id: string
  name: string
  artists: Array<{
    name: string
    id: string
  }>
  album: {
    name: string
    images: Array<{
      url: string
      height?: number
      width?: number
    }>
  }
  duration_ms: number
  uri: string
  external_urls: {
    spotify: string
  }
}

export interface SpotifyPlaylist {
  id: string
  name: string
  description?: string
  external_urls: {
    spotify: string
  }
  images: Array<{
    url: string
    height?: number
    width?: number
  }>
}

export interface JourneyRequest {
  trainNumber: string
  fromStation: string
  toStation: string
  keyword: string
}

export interface JourneyResponse {
  playlistId: string
  playlistUrl: string
  playlistName: string
  trackCount: number
  journeyDuration: string
}

export interface AuthResponse {
  accessToken: string
  userId: string
  expiresIn?: number
}
