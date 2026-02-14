import { useState } from 'react';

export const useGeoLocation = (defaultLocation: { lat: number; lon: number } | null) => {
  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  if (navigator.geolocation) {
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
