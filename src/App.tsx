import { useEffect, useState } from 'react'
import BusStops from './components/BusStops'
import Weather from './components/Weather'
import { registerServiceWorker } from './services/pwaService'
import './App.css'

function App() {
  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Register service worker for PWA
    registerServiceWorker()

    // Get user's location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          })
        },
        (err) => {
          setError(
            'Unable to get your location. Please enable location services.',
          )
          console.error(err)
          // Set default location (Helsinki)
          setLocation({ lat: 60.1699, lon: 24.9384 })
        },
      )
    } else {
      setError('Geolocation is not supported by your browser')
      // Set default location (Helsinki)
      setLocation({ lat: 60.1699, lon: 24.9384 })
    }
  }, [])

  return (
    <div className="app">
      <header className="app-header">
        <h1>🚌 Bus Stops & Weather</h1>
        <p>Real-time information for your commute</p>
      </header>

      <main className="app-main">
        {error && <div className="error-banner">{error}</div>}

        <div className="content-grid">
          {location && (
            <>
              <section className="section">
                <Weather location={location} />
              </section>
              <section className="section">
                <BusStops location={location} />
              </section>
            </>
          )}
          {!location && <p className="loading">Loading your location...</p>}
        </div>
      </main>

      <footer className="app-footer">
        <p>
          Data from{' '}
          <a href="https://digitransit.fi" target="_blank" rel="noopener noreferrer">
            Digitransit
          </a>{' '}
          and{' '}
          <a href="https://open-meteo.com" target="_blank" rel="noopener noreferrer">
            Open-Meteo
          </a>
        </p>
      </footer>
    </div>
  )
}

export default App
