import { useState } from 'react'
import JourneyForm from '../components/JourneyForm'
import type { JourneyData } from '../components/JourneyForm'
import '../styles/JourneyPage.css'

interface PlaylistResult {
    playlistId: string
    playlistUrl: string
    playlistName: string
    trackCount: number
    journeyDuration: string
}

function JourneyPage() {
    const [isLoading, setIsLoading] = useState(false)
    const [result, setResult] = useState<PlaylistResult | null>(null)
    const [error, setError] = useState<string | null>(null)

    const handleJourneySubmit = async (data: JourneyData) => {
        setIsLoading(true)
        setError(null)
        setResult(null)

        try {
            // Call backend API to:
            // 1. Get train journey details (Deutsche Bahn API)
            // 2. Calculate duration
            // 3. Fetch user's liked songs (Spotify API)
            // 4. Filter/sort by keyword
            // 5. Create playlist and add tracks

            const response = await fetch('/api/playlist/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('spotify_access_token')}`
                },
                body: JSON.stringify({
                    trainNumber: data.trainNumber,
                    fromStation: data.fromStation,
                    toStation: data.toStation,
                    keyword: data.keyword
                })
            })

            if (!response.ok) {
                throw new Error('Failed to generate playlist')
            }

            const playlistData = await response.json()
            setResult(playlistData)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred')
        } finally {
            setIsLoading(false)
        }
    }

    const handleReset = () => {
        setResult(null)
        setError(null)
    }

    if (result) {
        return (
            <div className="journey-page">
                <div className="result-container">
                    <div className="result-success">
                        <h2>🎉 Playlist Created!</h2>
                        <div className="result-details">
                            <p className="result-name">{result.playlistName}</p>
                            <p className="result-info">
                                <span className="badge">{result.trackCount} songs</span>
                                <span className="badge">{result.journeyDuration}</span>
                            </p>
                            <p className="result-description">
                                Perfect for your train journey!
                            </p>
                        </div>
                        <div className="result-actions">
                            <a
                                href={result.playlistUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-primary"
                            >
                                Open in Spotify
                            </a>
                            <button
                                onClick={handleReset}
                                className="btn btn-secondary"
                            >
                                Create Another
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="journey-page">
            <div className="form-container">
                <div className="form-header">
                    <h1>Create Your Journey Playlist</h1>
                    <p>Tell us about your train journey and we'll create the perfect playlist</p>
                </div>

                {error && (
                    <div className="error-banner">
                        <p>{error}</p>
                    </div>
                )}

                <JourneyForm
                    onSubmit={handleJourneySubmit}
                    isLoading={isLoading}
                />
            </div>
        </div>
    )
}

export default JourneyPage
