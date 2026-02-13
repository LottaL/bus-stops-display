import axios, { AxiosError } from 'axios'

// Digitransit Routing API v2 endpoint (current, non-deprecated API)
// Using GraphQL for querying nearest stops
// In development, requests go through proxy at /api/digitransit
// In production, use direct URL
const isDevelopment = import.meta.env.DEV
const DIGITRANSIT_GRAPHQL_URL = isDevelopment
  ? '/api/digitransit'
  : 'https://api.digitransit.fi/routing/v2/hsl/gtfs/v1'

// Get API key from environment - required for Digitransit API (since 31.1.2024)
// Register at https://portal-api.digitransit.fi/ to get your API key
const DIGITRANSIT_API_KEY = import.meta.env.VITE_DIGITRANSIT_API_KEY || ''

// Log for debugging (remove in production)
if (typeof window !== 'undefined') {
  console.log('[Digitransit API] API Key loaded:', DIGITRANSIT_API_KEY ? '✓ Present' : '✗ Missing')
  if (DIGITRANSIT_API_KEY) {
    console.log('[Digitransit API] Key length:', DIGITRANSIT_API_KEY.length, 'characters')
  }
}

export interface BusStop {
  id: string
  name: string
  lat: number
  lon: number
  stoptimesWithoutPatterns: StopTime[]
}

export interface StopTime {
  scheduledArrival: number
  realtime: boolean
  realtimeState: string
  headsign: string
  trip: {
    route: {
      shortName: string
    }
  }
}

export interface NearestStopsResponse {
  stops: BusStop[]
}

/**
 * Fetch bus stops by their names
 * @param stopNames Array of stop names (e.g., ['Kalteentie', 'Mätäspolku'])
 * @param numberOfDepartures Number of departures to fetch per stop (default 5)
 */
export async function getStopsByNames(stopNames: string[], numberOfDepartures: number = 5): Promise<BusStop[]> {
  if (!stopNames || stopNames.length === 0) {
    return []
  }

  // Build individual stop queries using aliases
  // stops() query returns a direct array, not paginated with edges
  const stopQueries = stopNames
    .map(
      (name, index) => `
    stops${index}: stops(name: "${name.replace(/"/g, '\\"')}") {
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
  `,
    )
    .join('\n')

  const query = `
    query {
      ${stopQueries}
    }
  `

  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    if (DIGITRANSIT_API_KEY) {
      headers['digitransit-subscription-key'] = DIGITRANSIT_API_KEY
      console.log('[Digitransit API] Request includes API key via header ✓')
    }

    console.log('[Digitransit API] Fetching stops by names:', stopNames)
    console.log('[Digitransit API] Query being sent:', query)
    const response = await axios.post(DIGITRANSIT_GRAPHQL_URL, { query }, { headers })

    if (response.data.errors) {
      console.error('[Digitransit API] GraphQL errors:', response.data.errors)
      throw new Error(
        `API error: ${response.data.errors.map((e: any) => e.message).join(', ')}`,
      )
    }

    // Debug: Log the raw response
    console.log('[Digitransit API] Raw response from stops query:', JSON.stringify(response.data, null, 2))

    // Map GraphQL response to our BusStop interface
    // Note: stops() query returns results directly as arrays, not wrapped in edges
    const stops: BusStop[] = Object.values(response.data.data)
      .filter((result: any) => Array.isArray(result) && result.length > 0)
      .flatMap((stopArray: any) =>
        stopArray
          .filter((stop: any) => stop?.gtfsId)
          .map((stop: any) => ({
            id: stop.gtfsId,
            name: stop.name || 'Unknown',
            lat: stop.lat || 0,
            lon: stop.lon || 0,
            stoptimesWithoutPatterns: Array.isArray(stop.stoptimesWithoutPatterns)
              ? stop.stoptimesWithoutPatterns
              : [],
          })),
      )

    console.log('[Digitransit API] Successfully fetched', stops.length, 'stops by names')
    console.log('[Digitransit API] Mapped stops from name search:', JSON.stringify(stops, null, 2))
    return stops
  } catch (error) {
    const axiosError = error as AxiosError
    console.error('[Digitransit API] Request failed:', {
      message: axiosError.message,
      status: axiosError.status,
      statusText: axiosError.response?.statusText,
      data: axiosError.response?.data,
    })
    throw error instanceof Error ? error : new Error('Failed to fetch bus stops')
  }
}

/**
 * Fetch bus stops by their GTFS IDs
 * @param gtfsIds Array of GTFS stop IDs (e.g., ['HSL:1414149', 'HSL:1414154'])
 * @param numberOfDepartures Number of departures to fetch per stop (default 5)
 */
export async function getStopsByIds(gtfsIds: string[], numberOfDepartures: number = 5): Promise<BusStop[]> {
  if (!gtfsIds || gtfsIds.length === 0) {
    return []
  }

  // Build individual stop queries
  const stopQueries = gtfsIds
    .map(
      (id, index) => `
    stop${index}: stop(id: "${id}") {
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
  `,
    )
    .join('\n')

  const query = `
    query {
      ${stopQueries}
    }
  `

  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    if (DIGITRANSIT_API_KEY) {
      headers['digitransit-subscription-key'] = DIGITRANSIT_API_KEY
      console.log('[Digitransit API] Request includes API key via header ✓')
    }

    console.log('[Digitransit API] Fetching stops by IDs:', gtfsIds)
    const response = await axios.post(DIGITRANSIT_GRAPHQL_URL, { query }, { headers })

    if (response.data.errors) {
      console.error('[Digitransit API] GraphQL errors:', response.data.errors)
      throw new Error(
        `API error: ${response.data.errors.map((e: any) => e.message).join(', ')}`,
      )
    }

    // Map GraphQL response to our BusStop interface
    const stops: BusStop[] = Object.values(response.data.data)
      .filter((stop: any) => stop && stop.gtfsId)
      .map((stop: any) => ({
        id: stop.gtfsId,
        name: stop.name,
        lat: stop.lat,
        lon: stop.lon,
        stoptimesWithoutPatterns: stop.stoptimesWithoutPatterns || [],
      }))

    console.log('[Digitransit API] Successfully fetched', stops.length, 'stops by IDs')
    return stops
  } catch (error) {
    const axiosError = error as AxiosError
    console.error('[Digitransit API] Request failed:', {
      message: axiosError.message,
      status: axiosError.status,
      statusText: axiosError.response?.statusText,
      data: axiosError.response?.data,
    })
    throw error instanceof Error ? error : new Error('Failed to fetch bus stops')
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
export async function getNearestBusStops(
  lat: number,
  lon: number,
  radius: number = 500,
  limit: number = 10,
  numberOfDepartures: number = 5,
): Promise<BusStop[]> {
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
  `

  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    // Add API key as header (required for Digitransit production API)
    if (DIGITRANSIT_API_KEY) {
      headers['digitransit-subscription-key'] = DIGITRANSIT_API_KEY
      console.log('[Digitransit API] Request includes API key via header ✓')
    } else {
      console.warn(
        'Digitransit API key not found. Please set VITE_DIGITRANSIT_API_KEY environment variable. ' +
          'Register at https://portal-api.digitransit.fi/ to get your API key. ' +
          'Some features may not work without authentication.',
      )
    }

    console.log('[Digitransit API] Sending GraphQL query to Routing API v2')
    const response = await axios.post(DIGITRANSIT_GRAPHQL_URL, { query }, { headers })

    if (response.data.errors) {
      console.error('[Digitransit API] GraphQL errors:', response.data.errors)
      throw new Error(
        `API error: ${response.data.errors.map((e: any) => e.message).join(', ')}`,
      )
    }

    // Map GraphQL response to our BusStop interface
    console.log('[Digitransit API] Raw response:', JSON.stringify(response.data, null, 2))
    
    const stops: BusStop[] = response.data.data.nearest.edges
      .filter((edge: any) => edge.node.place && edge.node.place.gtfsId)
      .map((edge: any) => ({
        id: edge.node.place.gtfsId,
        name: edge.node.place.name,
        lat: edge.node.place.lat,
        lon: edge.node.place.lon,
        stoptimesWithoutPatterns: edge.node.place.stoptimesWithoutPatterns || [],
      }))

    console.log('[Digitransit API] Successfully fetched', stops.length, 'stops')
    console.log('[Digitransit API] Mapped stops:', JSON.stringify(stops, null, 2))
    return stops
  } catch (error) {
    const axiosError = error as AxiosError
    console.error('[Digitransit API] Request failed:', {
      message: axiosError.message,
      status: axiosError.status,
      statusText: axiosError.response?.statusText,
      data: axiosError.response?.data,
    })
    throw error instanceof Error
      ? error
      : new Error('Failed to fetch bus stops')
  }
}

/**
 * Format arrival time from seconds since midnight
 */
export function formatArrivalTime(secondsSinceMidnight: number): string {
  const hours = Math.floor(secondsSinceMidnight / 3600)
  const minutes = Math.floor((secondsSinceMidnight % 3600) / 60)
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
}

/**
 * Calculate minutes until arrival
 */
export function getMinutesUntilArrival(secondsSinceMidnight: number): number {
  const now = new Date()
  const totalSecondsToday =
    now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds()
  return Math.max(0, Math.floor((secondsSinceMidnight - totalSecondsToday) / 60))
}
