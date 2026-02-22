import { Typography, Stack } from '@mui/material';
import { HourlyForecast } from '../services/weatherApi';
import { WeatherIcon } from './WeatherIcon';
import { WindDirectionIndicator } from './WindDirectionIndicator';

interface WeatherSlotProps {
  weather: HourlyForecast;
}

export const WeatherSlot = ({ weather }: WeatherSlotProps) => {
  return (
    <Stack className="weather-indicator" direction="row" spacing={1} alignItems="center">
      <Stack direction="column" alignItems="center">
        <WeatherIcon forecast={weather} />
        <Typography variant="caption" sx={{ mt: 0.5 }}>
          {weather.temperature}°C
        </Typography>
      </Stack>
      {weather.windDirection !== undefined && (
        <Stack direction="column" alignItems="center">
          <WindDirectionIndicator
            windDirection={weather.windDirection}
            windSpeed={weather.windSpeed}
          />
          <Typography variant="caption" sx={{ mt: 0.5 }}>
            {weather.windSpeed} m/s
          </Typography>
        </Stack>
      )}
    </Stack>
  );
};
