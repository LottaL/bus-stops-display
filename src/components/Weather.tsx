import { useEffect, useState } from 'react'
import {
  getWeatherForecast,
  HourlyForecast,
  formatTime,
  getWeatherEmoji,
} from '../services/weatherApi'
import './Weather.css'

interface WeatherProps {
  location: { lat: number; lon: number }
}

export default function Weather({ location }: WeatherProps) {
  const [forecast, setForecast] = useState<HourlyForecast[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await getWeatherForecast(location.lat, location.lon)
        setForecast(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load weather')
      } finally {
        setLoading(false)
      }
    }

    fetchWeather()
    // Refresh weather every 10 minutes
    const interval = setInterval(fetchWeather, 10 * 60 * 1000)
    return () => clearInterval(interval)
  }, [location])

  if (loading) return <div className="weather-loading">Loading weather...</div>
  if (error) return <div className="weather-error">Error: {error}</div>
  if (forecast.length === 0) return <div className="weather-empty">No weather data</div>

  const current = forecast[0]

  return (
    <div className="weather">
      <h2>🌤️ Weather Forecast (Next 6 Hours)</h2>

      <div className="current-weather">
        <div className="weather-icon">
          {getWeatherEmoji(current.weatherCode)}
        </div>
        <div className="current-info">
          <div className="temp">{current.temperature}°C</div>
          <div className="description">{current.description}</div>
          <div className="details">
            <span>💨 {current.windSpeed} km/h</span>
            <span>💧 {current.precipitation} mm</span>
          </div>
        </div>
      </div>

      <div className="hourly-forecast">
        {forecast.map((hour, index) => (
          <div key={index} className="forecast-item">
            <div className="time">{formatTime(hour.time)}</div>
            <div className="emoji">{getWeatherEmoji(hour.weatherCode)}</div>
            <div className="temp">{hour.temperature}°C</div>
            <div className="wind">{hour.windSpeed} km/h</div>
          </div>
        ))}
      </div>
    </div>
  )
}
