import { useEffect, useState } from 'react';
import { useMode } from './useMode';

export const useGeoLocation = (defaultLocation?: { lat: number; lon: number }) => {
  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { mode } = useMode();
  useEffect(() => {
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
          setLocation(defaultLocation || null);
        },
      );
    }
  }, [mode, defaultLocation]);
  return { location, error };
};
