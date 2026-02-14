import { Box, Container, Grid, Link, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import BusStops from './components/BusStops';
import { registerServiceWorker } from './services/pwaService';

function App() {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Register service worker for PWA
    registerServiceWorker();
  }, []);

  return (
    <Container className="app-container" maxWidth="md">
      <Box className="time-header" textAlign="center" p={2}>
        <Typography variant="h4" component="h1">
          {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Typography>
      </Box>
      <Grid container spacing={2} className="app-main">
        {/* <Grid size={{ xs: 12, lg: 6 }}>{location && <Weather location={location} />}</Grid> */}
        <Grid size={{ xs: 12, lg: 6 }}>
          <BusStops />
        </Grid>
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
