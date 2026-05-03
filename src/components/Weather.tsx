import { Card, CardContent, CircularProgress, Grid, Stack, Typography } from '@mui/material';
import { useWeather } from '../hooks/useWeather';
import { WeatherSlot } from './WeatherSlot';
import { getTimeAndDate } from '../utils/getLocalTimes';

export default function Weather() {
  const { data: weather, isFetching, isLoading, error } = useWeather();

  if (isLoading) {
    return (
      <Grid size={12} justifyItems="center" className="weather-loading">
        <CircularProgress />
      </Grid>
    );
  }
  if (error) {
    return (
      <Grid size={12} justifyItems="center" className="weather-error">
        <Typography variant="body1" color="error">
          Error: {error.message}
        </Typography>
      </Grid>
    );
  }
  if (!weather || weather.length < 2) {
    return null;
  }

  return (
    <Grid size={12} className="weather">
      <Card className="weather-card" variant="outlined">
        <CardContent>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            {weather.length > 2 &&
              weather.slice(1).map((weatherPerHour, index) => (
                <Stack key={index} direction="column" alignItems="center">
                  <Typography variant="h6" pb={1}>
                    {getTimeAndDate(new Date(weatherPerHour.time), 'fi-FI').time}{' '}
                    {isFetching && <CircularProgress size={16} sx={{ ml: 1 }} />}
                  </Typography>
                  <WeatherSlot key={index} weather={weatherPerHour} />
                </Stack>
              ))}
          </Stack>
        </CardContent>
      </Card>
    </Grid>
  );
}
