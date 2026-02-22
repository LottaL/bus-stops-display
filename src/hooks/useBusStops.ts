import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { getNearestBusStops, getStopsByIds, getStopsByNames } from '../services/digitransitApi';
import { useMode } from './useMode';
import { useGeoLocation } from './useGeoLocation';

export const DEFAULT_LOCATION = { lat: 60.1699, lon: 24.9384 }; // Default location (Helsinki)

// TODO: Refactor to use a single query with dynamic parameters instead of multiple queries for different modes
// TODO: Trigger alert if geolocation fails and user is shown bus stops for default location (Helsinki)
export const useBusStops = () => {
  const {
    numberOfDepartures,
    selectedStopIds: gtfsIds,
    selectedStopNames: stopNames,
    mode,
  } = useMode();
  const busStopsById = useBusStopsByIds(gtfsIds, numberOfDepartures);
  const busStopsByName = useBusStopsByNames(stopNames, numberOfDepartures);
  const { location } = useGeoLocation();
  const busStopsByLocation = useNearestBusStops(
    mode === 'nearest' ? location : null,
    numberOfDepartures,
  );

  return gtfsIds.length > 0
    ? busStopsById
    : stopNames.length > 0
      ? busStopsByName
      : busStopsByLocation;
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
    refetchInterval: 60 * 1000, // Refetch every 60 seconds to keep the data up-to-date
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
    refetchInterval: 60 * 1000, // Refetch every 60 seconds to keep the data up-to-date
  });

export const useBusStopsByIds = (gtfsIds: string[], numberOfDepartures: number) =>
  useQuery({
    enabled: gtfsIds.length > 0,
    queryKey: ['busStopsByIds', gtfsIds, numberOfDepartures],
    queryFn: ({ signal }) => getStopsByIds({ gtfsIds, numberOfDepartures, abortSignal: signal }),
    refetchInterval: 60 * 1000, // Refetch every 60 seconds to keep the data up-to-date
  });

export const useSuspenseBusStopsByIds = (gtfsIds: string[], numberOfDepartures: number) =>
  useSuspenseQuery({
    queryKey: ['busStopsByIds', gtfsIds, numberOfDepartures],
    queryFn: ({ signal }) => getStopsByIds({ gtfsIds, numberOfDepartures, abortSignal: signal }),
    refetchInterval: 60 * 1000, // Refetch every 60 seconds to keep the data up-to-date
  });

export const useBusStopsByNames = (stopNames: string[], numberOfDepartures: number) => {
  return useQuery({
    enabled: stopNames.length > 0,
    queryKey: ['busStopsByNames', stopNames, numberOfDepartures],
    queryFn: async ({ signal }) =>
      getStopsByNames({ stopNames, numberOfDepartures, abortSignal: signal }),
    refetchInterval: 60 * 1000, // Refetch every 60 seconds to keep the data up-to-date
  });
};

export const useSuspenseBusStopsByNames = (stopNames: string[], numberOfDepartures: number) =>
  useSuspenseQuery({
    queryKey: ['busStopsByNames', stopNames, numberOfDepartures],
    queryFn: async ({ signal }) =>
      getStopsByNames({ stopNames, numberOfDepartures, abortSignal: signal }),
    refetchInterval: 60 * 1000, // Refetch every 60 seconds to keep the data up-to-date
  });
