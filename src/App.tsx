import { Box, Container, Grid, Link, Typography } from '@mui/material';
import { useEffect } from 'react';
import BusStops from './components/BusStops';
import { Time } from './components/Time';
import Weather from './components/Weather';
import { registerServiceWorker } from './services/pwaService';

function App() {
  useEffect(() => {
    // Register service worker for PWA
    registerServiceWorker();
  }, []);

  return (
    <Container className="app-container" maxWidth="md">
      <Time />
      <Grid container spacing={2} className="app-main">
        <Weather />
        <BusStops />
      </Grid>

      <Box className="app-footer">
        <Typography>
          Data from{' '}
          <Typography
            component={Link}
            href="https://digitransit.fi"
            target="_blank"
            rel="noopener noreferrer"
          >
            Digitransit
          </Typography>{' '}
          and{' '}
          <Typography
            component={Link}
            href="https://open-meteo.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            Open-Meteo
          </Typography>
        </Typography>
      </Box>
    </Container>
  );
}

export default App;
