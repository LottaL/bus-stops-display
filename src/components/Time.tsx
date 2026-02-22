import { Box, Stack, Typography } from '@mui/material';
import { useTime } from '../hooks/useTime';
import { useWeather } from '../hooks/useWeather';
import { WeatherSlot } from './WeatherSlot';

export const Time = () => {
  const { time, date } = useTime();
  const { data: weather } = useWeather();

  return (
    <Box className="time-header" textAlign="center" py={2}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
        <Stack direction="row" justifyContent="flex-start" alignItems="center" spacing={2}>
          <Typography variant="h4" component="h1">
            {time}
          </Typography>
          <Typography variant="body2" component="p">
            {date}
          </Typography>
        </Stack>
        {weather && weather.length > 0 && <WeatherSlot weather={weather[0]} />}
      </Stack>
    </Box>
  );
};
