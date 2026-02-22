import axios, { AxiosError, GenericAbortSignal } from 'axios';

const WEATHER_API_URL = 'https://api.open-meteo.com/v1/forecast';

export interface WeatherData {
  time: string[];
  temperature_2m: number[];
  weather_code: number[];
  precipitation: number[];
  wind_speed_10m: number[];
}

export interface HourlyForecast {
  time: string;
  temperature: number;
  weatherCode: number;
  precipitation: number;
  windSpeed: number;
  windDirection?: number;
  description: string;
}

/**
 * Fetch 6-hour weather forecast
 * @param lat Latitude
 * @param lon Longitude
 */
export async function getWeatherForecast(
  location: { lat: number; lon: number },
  signal?: GenericAbortSignal,
): Promise<HourlyForecast[]> {
  try {
    const response = await axios.get(WEATHER_API_URL, {
      params: {
        latitude: location.lat,
        longitude: location.lon,
        hourly: 'temperature_2m,weather_code,precipitation,wind_speed_10m,winddirection_10m',
        forecast_hours: 6,
        timezone: 'auto',
        temperature_unit: 'celsius',
      },
      signal,
    });

    const hourly = response.data.hourly;
    const forecasts: HourlyForecast[] = [];

    for (let i = 0; i < Math.min(6, hourly.time.length); i++) {
      forecasts.push({
        time: hourly.time[i],
        temperature: hourly.temperature_2m[i],
        weatherCode: hourly.weather_code[i],
        precipitation: hourly.precipitation[i],
        windSpeed: hourly.wind_speed_10m[i],
        windDirection: hourly.winddirection_10m ? hourly.winddirection_10m[i] : undefined,
        description: getWeatherDescription(hourly.weather_code[i]),
      });
    }

    return forecasts;
  } catch (error) {
    const axiosError = error as AxiosError;
    console.error('Error fetching weather:', axiosError.message);
    throw new Error('Failed to fetch weather data');
  }
}

/**
 * Convert WMO weather code to human-readable description
 */
export function getWeatherDescription(code: number): string {
  const descriptions: { [key: number]: string } = {
    0: 'Clear sky',
    1: 'Mainly clear',
    2: 'Partly cloudy',
    3: 'Overcast',
    45: 'Foggy',
    48: 'Depositing rime fog',
    51: 'Light drizzle',
    53: 'Moderate drizzle',
    55: 'Dense drizzle',
    61: 'Slight rain',
    63: 'Moderate rain',
    65: 'Heavy rain',
    71: 'Slight snow',
    73: 'Moderate snow',
    75: 'Heavy snow',
    77: 'Snow grains',
    80: 'Slight rain showers',
    81: 'Moderate rain showers',
    82: 'Violent rain showers',
    85: 'Slight snow showers',
    86: 'Heavy snow showers',
    95: 'Thunderstorm',
    96: 'Thunderstorm with slight hail',
    99: 'Thunderstorm with heavy hail',
  };
  return descriptions[code] || 'Unknown';
}

/**
 * Get weather emoji based on weather code
 */
export function getWeatherEmoji(code: number): string {
  if (code === 0) return '☀️';
  if (code === 1 || code === 2) return '⛅';
  if (code === 3) return '☁️';
  if (code === 45 || code === 48) return '🌫️';
  if (code >= 51 && code <= 55) return '🌧️';
  if (code >= 61 && code <= 82) return '🌧️';
  if (code >= 71 && code <= 86) return '❄️';
  if (code >= 95 && code <= 99) return '⛈️';
  return '🌡️';
}

/**
 * Format timestamp to readable time
 */
export function formatTime(timestamp: string): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}
