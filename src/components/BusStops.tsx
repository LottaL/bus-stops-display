import { useEffect, useState } from 'react';
import { useBusStops } from '../hooks/useBusStops';
import { formatArrivalTime, getMinutesUntilArrival } from '../services/digitransitApi';
import './BusStops.css';
import { Box, Card, CardContent, Grid, Typography } from '@mui/material';
import { useGeoLocation } from '../hooks/useGeoLocation';
import { getDistance } from '../utils/getDistance';

export type Mode = 'nearest' | 'specific' | 'byName';

export default function BusStops() {
  const [mode, setMode] = useState<Mode>('nearest');
  const [selectedStopIds, setSelectedStopIds] = useState<string[]>([]);
  const [selectedStopNames, setSelectedStopNames] = useState<string[]>([]);
  const [numberOfDepartures, setNumberOfDepartures] = useState(5);

  const {
    data: stops,
    isLoading,
    error,
  } = useBusStops({
    numberOfDepartures,
    gtfsIds: selectedStopIds,
    stopNames: selectedStopNames,
  });

  const { location } = useGeoLocation(mode, null);

  useEffect(() => {
    // Parse query parameters
    const params = new URLSearchParams(window.location.search);
    const stopsParam = params.get('stops');
    const namesParam = params.get('stopNames');
    const resultsParam = params.get('results');

    // Parse numberOfDepartures from results parameter
    if (resultsParam) {
      const parsed = parseInt(resultsParam, 10);
      if (!isNaN(parsed) && parsed > 0) {
        setNumberOfDepartures(parsed);
      }
    }

    if (namesParam) {
      // Parse comma-separated stop names
      const names = namesParam
        .split(',')
        .map((name) => name.trim())
        .filter((name) => name.length > 0);
      setSelectedStopNames(names);
      setMode('byName');
    } else if (stopsParam) {
      // Parse comma-separated gtfsIds
      const ids = stopsParam
        .split(',')
        .map((id) => id.trim())
        .filter((id) => id.length > 0);
      setSelectedStopIds(ids);
      setMode('specific');
    }
  }, []);

  if (isLoading) return <div className="stops-loading">Loading bus stops...</div>;
  if (error) return <div className="stops-error">Error: {error.message}</div>;
  if (!stops || stops.length === 0) return <div className="stops-empty">No bus stops nearby</div>;

  return (
    <Grid size={{ xs: 12, lg: 6 }} direction="row" className="bus-stops">
      {stops.map((stop) => (
        <Grid key={stop.id} size={6} className="stop-card">
          <Card className="stop-card-content" variant="outlined">
            <CardContent>
              {location && (
                <Typography gutterBottom sx={{ color: 'text.secondary', fontSize: 14 }}>
                  ~{getDistance(location, { lat: stop.lat, lon: stop.lon })} m
                </Typography>
              )}
              <Typography variant="h5" component="div">
                {stop.name}
              </Typography>
              {stop.stoptimesWithoutPatterns.length > 0 ? (
                <Box className="departures">
                  {stop.stoptimesWithoutPatterns
                    .slice(0, numberOfDepartures)
                    .map((stoptime, idx) => {
                      const minutesUntil = getMinutesUntilArrival(stoptime.scheduledArrival);
                      const arrivalTime = formatArrivalTime(stoptime.scheduledArrival);

                      return (
                        <div
                          key={idx}
                          className={`departure ${stoptime.realtime ? 'realtime' : ''}`}
                        >
                          <span className="route">{stoptime.trip?.route?.shortName ?? '?'}</span>
                          <span className="destination">{stoptime.headsign ?? 'Unknown'}</span>
                          <span className="time">
                            {minutesUntil <= 0 ? 'Now' : `${minutesUntil}m`}
                          </span>
                          <span className="scheduled">{arrivalTime}</span>
                          {stoptime.realtime && (
                            <span className="realtime-badge">📍 Real-time</span>
                          )}
                        </div>
                      );
                    })}
                </Box>
              ) : (
                <Box className="no-departures">No departures available</Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}
