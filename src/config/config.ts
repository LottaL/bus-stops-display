const env = import.meta.env;

export const config = {
  environment: env.MODE || 'development',
  digitransitApiProxy: {
    apiUrl: env.VITE_DIGITRANSIT_API_PROXY_URL,
    refreshInterval: env.VITE_BUS_REFRESH_INTERVAL
      ? parseInt(env.VITE_BUS_REFRESH_INTERVAL)
      : 60000, // default 1 minute
    cacheMaxAge: env.VITE_CACHE_MAX_DIGITRANSIT ? parseInt(env.VITE_CACHE_MAX_DIGITRANSIT) : 60000, // default 1 minute
  },
  weatherApi: {
    apiUrl: env.VITE_WEATHER_API_URL,
    refreshInterval: env.VITE_WEATHER_REFRESH_INTERVAL
      ? parseInt(env.VITE_WEATHER_REFRESH_INTERVAL)
      : 3600000, // default 1 hour
    cacheMaxAge: env.VITE_CACHE_MAX_WEATHER ? parseInt(env.VITE_CACHE_MAX_WEATHER) : 3600000, // default 1hour
  },
  defaultLocation: {
    lat: env.VITE_DEFAULT_LAT,
    lon: env.VITE_DEFAULT_LON,
  },
};
