import { useState } from 'react'
import '../styles/Login.css'
import spotifyIcon from '../assets/spotify-white-icon.webp'

function Login() {
    const [isLoading, setIsLoading] = useState(false)

    const handleSpotifyLogin = () => {
        setIsLoading(true)

        const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID
        const redirectUri = import.meta.env.VITE_SPOTIFY_REDIRECT_URI
        const scopes = [
            'user-library-read',
            'playlist-modify-public',
            'playlist-modify-private'
        ]

        const authUrl = new URL('https://accounts.spotify.com/authorize')
        authUrl.searchParams.append('client_id', clientId)
        authUrl.searchParams.append('response_type', 'code')
        authUrl.searchParams.append('redirect_uri', redirectUri)
        authUrl.searchParams.append('scope', scopes.join(' '))

        window.location.href = authUrl.toString()
    }

    return (
        <div className="login-container">
            <div className="login-card">
                <div className="login-header">
                    <h1>Trainify</h1>
                    <p>Create the perfect Spotify playlist for your train journey</p>
                </div>

                <div className="login-content">
                    <svg className="train-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="3" cy="18" r="1"></circle>
                        <circle cx="15" cy="18" r="1"></circle>
                        <path d="M3 18h14M3 18v-4h14v4M3 14h14"></path>
                        <rect x="2" y="4" width="14" height="10" rx="1"></rect>
                    </svg>

                    <button
                        onClick={handleSpotifyLogin}
                        disabled={isLoading}
                        className="spotify-login-btn"
                    >
                        <img src={spotifyIcon} className="spotify-logo" alt="Spotify logo" />
                        {isLoading ? 'Connecting to Spotify...' : 'Login with Spotify'}
                    </button>

                    <p className="login-info">
                        We'll need access to your Spotify library to create the perfect playlist for your journey.
                    </p>
                </div>
            </div>
        </div>
    )
}

export default Login
