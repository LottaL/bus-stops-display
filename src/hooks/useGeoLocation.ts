import { useState } from 'react';
import { Mode } from '../components/BusStops';

export const useGeoLocation = (
  mode: Mode,
  defaultLocation: { lat: number; lon: number } | null,
) => {
  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  if (mode === 'nearest' && navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        });
      },
      (err) => {
        setError('Unable to get your location. Please enable location services.');
        console.error(err);
        setLocation(defaultLocation);
      },
    );
  }
  return { location, error };
};
