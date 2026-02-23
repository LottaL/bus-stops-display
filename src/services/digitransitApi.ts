import axios, { AxiosError, GenericAbortSignal } from 'axios';
import {
  BusStop,
  DigitransitErrorResponse,
  DigitransitNearestStopsResponse,
  DigitransitStopsResponse,
  EmptyObject,
} from '../schemas/digitransit.schema';

function isObject(u: unknown): u is Record<string, unknown> {
  return typeof u === 'object' && u !== null;
}

const env = import.meta.env;

// Digitransit Routing API v2 endpoint (current, non-deprecated API)
// Using GraphQL for querying nearest stops
// In development, requests go through proxy at /api/digitransit
// In production, use direct URL
const isDevelopment = env.DEV;
const DIGITRANSIT_GRAPHQL_URL = isDevelopment
  ? '/api/digitransit'
  : 'https://api.digitransit.fi/routing/v2/hsl/gtfs/v1';

// Get API key from environment - required for Digitransit API (since 31.1.2024)
// Register at https://portal-api.digitransit.fi/ to get your API key
const DIGITRANSIT_API_KEY = env.VITE_DIGITRANSIT_API_KEY || '';

const getNameOrIdQuery = (
  index: number,
  nameOrId: 'name' | 'id',
  value: string,
  numberOfDepartures: number,
) => {
  return `
    stops${index}: stops(${nameOrId}: "${value.replace(/"/g, '\\"')}") {
      gtfsId
      name
      lat
      lon
      stoptimesWithoutPatterns(numberOfDepartures: ${numberOfDepartures}) {
        scheduledArrival
        realtime
        realtimeState
        headsign
        trip {
          route {
            shortName
          }
        }
      }
    }
  `;
};

/**
 * Fetch bus stops by their names
 * @param stopNames Array of stop names (e.g., ['Kalteentie', 'Mätäspolku'])
 * @param numberOfDepartures Number of departures to fetch per stop (default 5)
 */
export async function getStopsByNamesOrIds({
  stopNames,
  gtfsIds,
  numberOfDepartures = 5,
  abortSignal,
}: {
  stopNames?: string[];
  gtfsIds?: string[];
  numberOfDepartures?: number;
  abortSignal: GenericAbortSignal;
}): Promise<BusStop[]> {
  if ((!stopNames || stopNames.length === 0) && (!gtfsIds || gtfsIds.length === 0)) {
    return [];
  }
  const nameOrId = stopNames && stopNames.length > 0 ? 'name' : 'id';

  // Build individual stop queries using aliases
  // stops() query returns a direct array, not paginated with edges
  const stopQueries = (stopNames || gtfsIds)!
    .map((name, index) => getNameOrIdQuery(index, nameOrId, name, numberOfDepartures))
    .join('\n');

  const query = `
    query {
      ${stopQueries}
    }
  `;

  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (DIGITRANSIT_API_KEY) {
      headers['digitransit-subscription-key'] = DIGITRANSIT_API_KEY;
    }

    const response = await axios.post(
      DIGITRANSIT_GRAPHQL_URL,
      { query },
      { headers, signal: abortSignal },
    );
    console.log('[Digitransit API] Response data:', response.data);
    console.log(response.data?.data.stops0);

    if (response.data.errors) {
      console.error('[Digitransit API] GraphQL errors:', response.data.errors);
      const safeParsedErrors = DigitransitErrorResponse.safeParse(response.data.errors);
      if (safeParsedErrors.success) {
        const errorMessages = safeParsedErrors.data.map((e) => e.message).join(', ');
        throw new Error(`API error: ${errorMessages}`);
      }
      throw new Error(
        `API error: Something went wrong, and the error response could not be parsed. Original errors: ${JSON.stringify(response.data.errors)}`,
      );
    }

    const dataObj = DigitransitStopsResponse.safeParse(response.data);
    if (!dataObj.success) {
      console.error('[Digitransit API] Response validation failed:', dataObj.error);
      throw new Error('API error: Response format is invalid');
    }

    const busStops: BusStop[] = Object.values(dataObj.data.data).flatMap((stops) => stops);
    return busStops;
  } catch (error) {
    const axiosError = error as AxiosError;
    console.error('[Digitransit API] Request failed:', {
      message: axiosError.message,
      status: axiosError.status,
      statusText: axiosError.response?.statusText,
      data: axiosError.response?.data,
    });
    throw error instanceof Error ? error : new Error('Failed to fetch bus stops');
  }
}

/**
 * Fetch nearest bus stops using Digitransit Routing API v2
 * @param lat Latitude
 * @param lon Longitude
 * @param radius Radius in meters (default 500m)
 * @param limit Number of stops to return (default 10)
 * @param numberOfDepartures Number of departures to fetch per stop (default 5)
 */
export async function getNearestBusStops({
  lat,
  lon,
  radius = 100,
  limit = 10,
  numberOfDepartures = 5,
  abortSignal,
}: {
  lat: number;
  lon: number;
  radius?: number;
  limit?: number;
  numberOfDepartures?: number;
  abortSignal: GenericAbortSignal;
}): Promise<BusStop[]> {
  // GraphQL query to find nearest stops
  const query = `
    query {
      nearest(lat: ${lat}, lon: ${lon}, maxDistance: ${radius}, maxResults: ${limit}) {
        edges {
          node {
            place {
              ... on Stop {
                gtfsId
                name
                lat
                lon
                stoptimesWithoutPatterns(numberOfDepartures: ${numberOfDepartures}) {
                  scheduledArrival
                  realtime
                  realtimeState
                  headsign
                  trip {
                    route {
                      shortName
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  `;

  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Add API key as header (required for Digitransit production API)
    if (DIGITRANSIT_API_KEY) {
      headers['digitransit-subscription-key'] = DIGITRANSIT_API_KEY;
    } else {
      console.warn(
        'Digitransit API key not found. Please set VITE_DIGITRANSIT_API_KEY environment variable. ' +
          'Register at https://portal-api.digitransit.fi/ to get your API key. ' +
          'Some features may not work without authentication.',
      );
    }

    const response = await axios.post(
      DIGITRANSIT_GRAPHQL_URL,
      { query },
      { headers, signal: abortSignal },
    );

    if (response.data.errors) {
      console.error('[Digitransit API] GraphQL errors:', response.data.errors);
      const safeParsedErrors = DigitransitErrorResponse.safeParse(response.data.errors);
      if (safeParsedErrors.success) {
        const errorMessages = safeParsedErrors.data.map((e) => e.message).join(', ');
        throw new Error(`API error: ${errorMessages}`);
      }
      throw new Error(
        `API error: Something went wrong, and the error response could not be parsed. Original errors: ${JSON.stringify(response.data.errors)}`,
      );
    }

    const dataObj = DigitransitNearestStopsResponse.safeParse(response.data);
    if (!dataObj.success) {
      console.error('[Digitransit API] Response validation failed:', dataObj.error);
      throw new Error('API error: Response format is invalid');
    }
    const busStops: BusStop[] = dataObj.data.data.nearest.edges
      .map((edge) => {
        if (EmptyObject.safeParse(edge.node.place).success) {
          return null;
        }
        const stop = BusStop.safeParse(edge.node.place);
        if (!stop.success) {
          console.error('[Digitransit API] Stop validation failed:', stop.error);
          throw new Error('API error: Stop format is invalid');
        }
        return stop.data;
      })
      .filter((stop): stop is BusStop => stop !== null);
    return busStops;
  } catch (error) {
    const axiosError = error as AxiosError;
    console.error('[Digitransit API] Request failed:', {
      message: axiosError.message,
      status: axiosError.status,
      statusText: axiosError.response?.statusText,
      data: axiosError.response?.data,
    });
    throw error instanceof Error ? error : new Error('Failed to fetch bus stops');
  }
}

/**
 * Format arrival time from seconds since midnight
 */
export function formatArrivalTime(secondsSinceMidnight: number): string {
  const hours = Math.floor(secondsSinceMidnight / 3600);
  const minutes = Math.floor((secondsSinceMidnight % 3600) / 60);
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

/**
 * Calculate minutes until arrival
 */
export function getMinutesUntilArrival(secondsSinceMidnight: number): number {
  const now = new Date();
  const totalSecondsToday = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
  return Math.max(0, Math.floor((secondsSinceMidnight - totalSecondsToday) / 60));
}
