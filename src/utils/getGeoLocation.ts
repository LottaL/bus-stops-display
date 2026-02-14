export const getGeoLocation = () => {
  let location: { lat: number; lon: number } | null = null;
  if (navigator.geolocation) {
    console.log('Getting geolocation...');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log('Geolocation obtained:', position.coords.latitude, position.coords.longitude);
        location = {
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        };
      },
      (err) => {
        // trigger some sort of error??
        console.error(err);
      },
    );
  }
  return location;
};
