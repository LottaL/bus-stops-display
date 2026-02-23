import { useEffect, useState } from 'react';

export type Mode = 'nearest' | 'specific' | 'byName';

export const useMode = () => {
  const [mode, setMode] = useState<Mode>('nearest');
  const [selectedStopIds, setSelectedStopIds] = useState<string[]>([]);
  const [selectedStopNames, setSelectedStopNames] = useState<string[]>([]);
  const [numberOfDepartures, setNumberOfDepartures] = useState(5);
  const [distance, setDistance] = useState(500);
  const [numberOfStops, setNumberOfStops] = useState(6);

  useEffect(() => {
    // Parse query parameters
    const params = new URLSearchParams(window.location.search);
    const stopsParam = params.get('stops');
    const namesParam = params.get('stopNames');
    const resultsParam = params.get('results');
    const distanceParam = params.get('distance');
    const limitParam = params.get('numberOfStops');

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
    } else {
      if (distanceParam) {
        const parsedDistance = parseInt(distanceParam, 10);
        if (!isNaN(parsedDistance) && parsedDistance > 0) {
          setDistance(parsedDistance);
        }
      }
      if (limitParam) {
        const parsedLimit = parseInt(limitParam, 10);
        if (!isNaN(parsedLimit) && parsedLimit > 0) {
          setNumberOfStops(parsedLimit);
        }
      }
    }
  }, []);

  return { mode, selectedStopIds, selectedStopNames, numberOfDepartures, distance, numberOfStops };
};
