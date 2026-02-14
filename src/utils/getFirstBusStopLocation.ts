export const getFirstBusStopLocation = (busStops: { lat: number; lon: number }[] | undefined) => {
  if (busStops && busStops.length > 0) {
    const firstStop = busStops[0];
    return { lat: firstStop.lat, lon: firstStop.lon };
  } else {
    return null;
  }
};
