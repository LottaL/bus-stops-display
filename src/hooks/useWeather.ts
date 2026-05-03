import { useQuery } from '@tanstack/react-query';
import { useBusStops } from './useBusStops';
import { useGeoLocation } from './useGeoLocation';
import { getWeatherForecast } from '../services/weatherApi';

export const useWeather = (defaultLocation?: { lat: number; lon: number }) => {
  const { data: stops } = useBusStops();
  const { location } = useGeoLocation();
  const weatherLocation =
    location ||
    (stops && stops.length > 0 ? { lat: stops[0].lat, lon: stops[0].lon } : defaultLocation);
  return useQuery({
    enabled: !!weatherLocation,
    queryKey: ['weather', weatherLocation],
    queryFn: ({ signal }) => weatherLocation && getWeatherForecast(weatherLocation, signal),
    refetchInterval: 60 * 60 * 1000, // Refetch every 60 minutes to keep the data up-to-date
    placeholderData: (previousData) => previousData,
  });
};
