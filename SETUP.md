# Train Playlist Generator

A web app that creates the perfect Spotify playlist tailored to the duration of your train journey.

## Overview

This application integrates with two main APIs:
- **Deutsche Bahn API**: Fetches departure and arrival times for train journeys
- **Spotify Web API**: Accesses your liked songs and creates custom playlists

### Flow
1. User logs in with Spotify
2. User enters train journey details (train number, departure/arrival stations, music keyword)
3. App fetches train duration from Deutsche Bahn API
4. App retrieves your liked songs from Spotify
5. Frontend filters songs by keyword and sorts by relevance
6. App creates a Spotify playlist and adds tracks to match the journey duration
7. Result is shown with a link to open the playlist in Spotify

## Project Structure

```
frontend/
├── src/
│   ├── pages/
│   │   ├── Login.tsx           # Spotify OAuth login page
│   │   ├── SpotifyCallback.tsx # Handles OAuth callback
│   │   └── JourneyPage.tsx     # Main form and results page
│   ├── components/
│   │   └── JourneyForm.tsx     # Journey details form
│   ├── services/
│   │   ├── spotifyService.ts   # Spotify API client
│   │   └── deutscheBahnService.ts # Deutsche Bahn API client
│   ├── styles/
│   │   ├── Login.css
│   │   ├── JourneyForm.css
│   │   └── JourneyPage.css
│   ├── App.tsx                 # Main app component
│   ├── main.tsx               # Entry point
│   └── index.css              # Global styles
├── .env.example               # Environment variables template
└── package.json
```

## Setup

### Prerequisites
- Node.js 16+
- Spotify Developer Account

### 1. Environment Variables

Create a `.env` file in the `frontend/` directory:

```bash
cp .env.example .env
```

Then fill in your values:
```env
VITE_SPOTIFY_CLIENT_ID=your_spotify_client_id
VITE_SPOTIFY_REDIRECT_URI=http://localhost:5173/callback
```

### 2. Get Your Spotify Credentials

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Create an app
3. Accept the terms and create
4. Copy your Client ID
5. Add a Redirect URI: `http://localhost:5173/callback`
6. Accept the updated terms

### 3. Install Dependencies

```bash
npm install
```

### 4. Run Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## API Integration

### Spotify API
- **Scope**: `user-library-read`, `playlist-modify-public`, `playlist-modify-private`
- **Uses**: 
  - `/me/tracks` - Get user's liked songs
  - `/users/{userid}/playlists` - Create new playlist
  - `/playlists/{playlist_id}/tracks` - Add tracks to playlist

### Deutsche Bahn API
- **Base URL**: `https://v6.db.transport.rest`
- **Uses**:
  - `/stations` - Search for stations
  - `/journeys` - Get journey information with times

## Backend Implementation Notes

The frontend expects a backend API at `http://localhost:3000/api` with the following endpoints:

**POST `/api/auth/spotify-callback`**
- Request: `{ code, state }`
- Response: `{ accessToken, userId }`

**POST `/api/playlist/generate`**
- Headers: `Authorization: Bearer {spotify_access_token}`
- Request: `{ trainNumber, fromStation, toStation, keyword }`
- Response: `{ playlistId, playlistUrl, playlistName, trackCount, journeyDuration }`

## Tech Stack

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **CSS3** - Styling

## Next Steps

1. Create a backend server to handle:
   - Spotify OAuth token exchange
   - Deutsche Bahn API calls (to avoid CORS issues)
   - Playlist generation logic

2. Implement the SpotifyCallback component properly with backend integration

3. Add error handling and validation

4. Deploy to production

## API Considerations

- Deutsche Bahn API may require CORS proxy or backend relay
- Spotify tokens refresh tokens should be managed securely
- Consider caching station names for better UX
