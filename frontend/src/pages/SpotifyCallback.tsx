import { useEffect, useState } from 'react'

function SpotifyCallback() {
    const [error, setError] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const handleCallback = async () => {
            try {
                // Get authorization code from URL
                const params = new URLSearchParams(window.location.search)
                const code = params.get('code')

                if (!code) {
                    const error = params.get('error')
                    setError(error || 'No authorization code received')
                    setIsLoading(false)
                    return
                }

                // Exchange code for access token (backend handles this)
                const response = await fetch('/api/auth/spotify-callback', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ code })
                })

                if (!response.ok) {
                    throw new Error('Failed to complete authentication')
                }

                const data = await response.json()

                // Store access token securely (httpOnly cookie recommended)
                localStorage.setItem('spotify_access_token', data.accessToken)
                localStorage.setItem('spotify_user_id', data.userId)

                // Redirect to main app
                window.location.href = '/'
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred')
                setIsLoading(false)
            }
        }

        handleCallback()
    }, [])

    if (isLoading) {
        return (
            <div style={{ padding: '40px', textAlign: 'center' }}>
                <p>Connecting to Spotify...</p>
                <div style={{ marginTop: '20px' }}>Loading...</div>
            </div>
        )
    }

    if (error) {
        return (
            <div style={{ padding: '40px', textAlign: 'center' }}>
                <p>Authentication failed: {error}</p>
                <a href="/">Back to Login</a>
            </div>
        )
    }

    return null
}

export default SpotifyCallback
