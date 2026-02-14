import { useEffect, useState } from 'react';
import { useBusStops } from '../hooks/useBusStops';
import { formatArrivalTime, getMinutesUntilArrival } from '../services/digitransitApi';
import './BusStops.css';
import { Grid } from '@mui/material';

export default function BusStops() {
  const [mode, setMode] = useState<'nearest' | 'specific' | 'byName'>('nearest');
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
  console.log('BusStops component stops:', stops);

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
          <div className="stop-header">
            <h3>{stop.name}</h3>
            <span className="stop-distance">~{Math.round(Math.random() * 500)}m</span>
          </div>

          {stop.stoptimesWithoutPatterns.length > 0 ? (
            <div className="departures">
              <div className="departures-title">Next departures:</div>
              {stop.stoptimesWithoutPatterns.slice(0, numberOfDepartures).map((stoptime, idx) => {
                const minutesUntil = getMinutesUntilArrival(stoptime.scheduledArrival);
                const arrivalTime = formatArrivalTime(stoptime.scheduledArrival);

                return (
                  <div key={idx} className={`departure ${stoptime.realtime ? 'realtime' : ''}`}>
                    <span className="route">{stoptime.trip?.route?.shortName ?? '?'}</span>
                    <span className="destination">{stoptime.headsign ?? 'Unknown'}</span>
                    <span className="time">{minutesUntil <= 0 ? 'Now' : `${minutesUntil}m`}</span>
                    <span className="scheduled">{arrivalTime}</span>
                    {stoptime.realtime && <span className="realtime-badge">📍 Real-time</span>}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="no-departures">No departures available</div>
          )}
        </Grid>
      ))}
    </Grid>
  );
}
