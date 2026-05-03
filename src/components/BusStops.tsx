import { CircularProgress, Grid, Typography } from '@mui/material';
import { useBusStops } from '../hooks/useBusStops';
import { BusStop } from './BusStop';

export default function BusStops() {
  const { data: stops, isLoading, isFetching, error } = useBusStops();

  if (isLoading) {
    return (
      <Grid size={12} justifyItems="center" className="stops-loading">
        <Grid>
          <CircularProgress />
        </Grid>
      </Grid>
    );
  }
  if (error) {
    return (
      <Grid size={12} justifyItems="center" className="stops-error">
        <Typography variant="body1" color="error">
          Error: {error.message}
        </Typography>
      </Grid>
    );
  }
  if (!stops || stops.length === 0) {
    return (
      <Grid size={12} justifyItems="center" className="stops-empty">
        <Typography variant="body1">No bus stops nearby</Typography>
      </Grid>
    );
  }
  return (
    <Grid size={12} container direction="row" className="bus-stops" spacing={1}>
      {stops.map((stop) => (
        <BusStop key={stop.gtfsId} stop={stop} isFetching={isFetching} />
      ))}
    </Grid>
  );
}
