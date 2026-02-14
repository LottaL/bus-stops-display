import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { getNearestBusStops, getStopsByIds, getStopsByNames } from '../services/digitransitApi';

const DEFAULT_LOCATION = { lat: 60.1699, lon: 24.9384 }; // Default location (Helsinki)

// TODO: Refactor to use a single query with dynamic parameters instead of multiple queries for different modes
// TODO: Trigger alert if geolocation fails and user is shown bus stops for default location (Helsinki)
export const useBusStops = ({
  numberOfDepartures,
  gtfsIds,
  stopNames,
}: {
  numberOfDepartures: number;
  gtfsIds: string[];
  stopNames: string[];
}) => {
  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const busStopsById = useBusStopsByIds(gtfsIds, numberOfDepartures);
  const busStopsByName = useBusStopsByNames(stopNames, numberOfDepartures);
  const bustStopsByLocation = useNearestBusStops(location, numberOfDepartures);

  useEffect(() => {
    if (gtfsIds.length === 0 && stopNames.length === 0) {
      // Get user's location
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setLocation({
              lat: position.coords.latitude,
              lon: position.coords.longitude,
            });
          },
          (err) => {
            // trigger error message
            setError('Unable to get your location. Please enable location services.');
            setLocation(DEFAULT_LOCATION); // Set default location (Helsinki)
            console.error(err);
          },
        );
      } else {
        setError('Geolocation is not supported by your browser');
        setLocation(DEFAULT_LOCATION); // Set default location (Helsinki)
        console.error('Geolocation is not supported by your browser');
      }
    }
  }, [gtfsIds.length, stopNames.length]);

  return gtfsIds.length > 0
    ? busStopsById
    : stopNames.length > 0
      ? busStopsByName
      : bustStopsByLocation;
};

export const useNearestBusStops = (
  location: { lat: number; lon: number } | null,
  numberOfDepartures: number,
) =>
  useQuery({
    enabled: !!location,
    queryKey: ['busStops', location, numberOfDepartures],
    queryFn: ({ signal }) =>
      location &&
      getNearestBusStops({
        lat: location.lat,
        lon: location.lon,
        numberOfDepartures,
        abortSignal: signal,
      }),
  });
export const useSuspenseNearestBusStops = (
  location: { lat: number; lon: number },
  numberOfDepartures: number,
) =>
  useSuspenseQuery({
    queryKey: ['busStops', location, numberOfDepartures],
    queryFn: ({ signal }) =>
      getNearestBusStops({
        lat: location.lat,
        lon: location.lon,
        numberOfDepartures,
        abortSignal: signal,
      }),
  });

export const useBusStopsByIds = (gtfsIds: string[], numberOfDepartures: number) =>
  useQuery({
    enabled: gtfsIds.length > 0,
    queryKey: ['busStopsByIds', gtfsIds, numberOfDepartures],
    queryFn: ({ signal }) => getStopsByIds({ gtfsIds, numberOfDepartures, abortSignal: signal }),
  });

export const useSuspenseBusStopsByIds = (gtfsIds: string[], numberOfDepartures: number) =>
  useSuspenseQuery({
    queryKey: ['busStopsByIds', gtfsIds, numberOfDepartures],
    queryFn: ({ signal }) => getStopsByIds({ gtfsIds, numberOfDepartures, abortSignal: signal }),
  });

export const useBusStopsByNames = (stopNames: string[], numberOfDepartures: number) => {
  console.log('useBusStopsByNames stopNames:', stopNames);
  return useQuery({
    enabled: stopNames.length > 0,
    queryKey: ['busStopsByNames', stopNames, numberOfDepartures],
    queryFn: async ({ signal }) =>
      getStopsByNames({ stopNames, numberOfDepartures, abortSignal: signal }),
  });
};

export const useSuspenseBusStopsByNames = (stopNames: string[], numberOfDepartures: number) =>
  useSuspenseQuery({
    queryKey: ['busStopsByNames', stopNames, numberOfDepartures],
    queryFn: async ({ signal }) =>
      getStopsByNames({ stopNames, numberOfDepartures, abortSignal: signal }),
  });
