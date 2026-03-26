import { useState } from 'react'
import Login from './pages/Login'
import JourneyPage from './pages/JourneyPage'
import './App.css'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem('spotify_access_token')
  )

  const handleLogout = () => {
    localStorage.removeItem('spotify_access_token')
    localStorage.removeItem('spotify_user_id')
    setIsAuthenticated(false)
  }

  return (
    <>
      {!isAuthenticated ? (
        <Login />
      ) : (
        <>
          <button
            onClick={handleLogout}
            style={{
              position: 'fixed',
              top: '20px',
              right: '20px',
              padding: '8px 16px',
              background: '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              zIndex: 1000
            }}
          >
            Logout
          </button>
          <JourneyPage />
        </>
      )}
    </>
  )
}

export default App
