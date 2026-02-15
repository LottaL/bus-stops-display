export const getDistance = (
  a: { lat: number; lon: number },
  b: { lat: number; lon: number },
): number => {
  const metersPerDegreeLat = 111_320;
  const metersPerDegreeLon = 111_320 * Math.cos((a.lat * Math.PI) / 180);

  const dx = (b.lon - a.lon) * metersPerDegreeLon;
  const dy = (b.lat - a.lat) * metersPerDegreeLat;

  return Math.round(Math.sqrt(dx * dx + dy * dy));
};
