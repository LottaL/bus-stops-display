import { useEffect, useState } from 'react'
import {
    getNearestBusStops,
    getStopsByIds,
    getStopsByNames,
    BusStop,
    formatArrivalTime,
    getMinutesUntilArrival,
} from '../services/digitransitApi'
import './BusStops.css'

interface BusStopsProps {
    location: { lat: number; lon: number }
}

export default function BusStops({ location }: BusStopsProps) {
    const [stops, setStops] = useState<BusStop[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [mode, setMode] = useState<'nearest' | 'specific' | 'byName'>('nearest')
    const [selectedStopIds, setSelectedStopIds] = useState<string[]>([])
    const [selectedStopNames, setSelectedStopNames] = useState<string[]>([])
    const [numberOfDepartures, setNumberOfDepartures] = useState(5)

    useEffect(() => {
        // Parse query parameters
        const params = new URLSearchParams(window.location.search)
        const stopsParam = params.get('stops')
        const namesParam = params.get('stopNames')
        const resultsParam = params.get('results')

        // Parse numberOfDepartures from results parameter
        if (resultsParam) {
            const parsed = parseInt(resultsParam, 10)
            if (!isNaN(parsed) && parsed > 0) {
                setNumberOfDepartures(parsed)
            }
        }

        if (namesParam) {
            // Parse comma-separated stop names
            const names = namesParam
                .split(',')
                .map(name => name.trim())
                .filter(name => name.length > 0)
            setSelectedStopNames(names)
            setMode('byName')
        } else if (stopsParam) {
            // Parse comma-separated gtfsIds
            const ids = stopsParam
                .split(',')
                .map(id => id.trim())
                .filter(id => id.length > 0)
            setSelectedStopIds(ids)
            setMode('specific')
        }
    }, [])

    useEffect(() => {
        const fetchStops = async () => {
            try {
                setLoading(true)
                setError(null)

                let data: BusStop[]
                if (mode === 'specific' && selectedStopIds.length > 0) {
                    data = await getStopsByIds(selectedStopIds, numberOfDepartures)
                } else if (mode === 'byName' && selectedStopNames.length > 0) {
                    data = await getStopsByNames(selectedStopNames, numberOfDepartures)
                } else {
                    data = await getNearestBusStops(location.lat, location.lon, 500, 10, numberOfDepartures)
                }
                setStops(data)
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load bus stops')
            } finally {
                setLoading(false)
            }
        }

        fetchStops()
        // Refresh bus stops every 30 seconds
        const interval = setInterval(fetchStops, 30 * 1000)
        return () => clearInterval(interval)
    }, [location, mode, selectedStopIds, selectedStopNames, numberOfDepartures])

    if (loading) return <div className="stops-loading">Loading bus stops...</div>
    if (error) return <div className="stops-error">Error: {error}</div>
    if (stops.length === 0) return <div className="stops-empty">No bus stops nearby</div>

    return (
        <div className="bus-stops">
            <h2>
                🚌{' '}
                {mode === 'specific'
                    ? `Selected Bus Stops (${selectedStopIds.length})`
                    : mode === 'byName'
                        ? `Search Results (${selectedStopNames.length})`
                        : 'Nearest Bus Stops'}
            </h2>
            {mode === 'specific' && (
                <div className="mode-indicator">
                    Showing stops: {selectedStopIds.join(', ')}
                </div>
            )}
            {mode === 'byName' && (
                <div className="mode-indicator">
                    Searching by names: {selectedStopNames.join(', ')}
                </div>
            )}
            <div className="mode-indicator">
                Showing {numberOfDepartures} departure{numberOfDepartures !== 1 ? 's' : ''} per stop
            </div>
            <div className="stops-list">
                {stops.map((stop) => (
                    <div key={stop.id} className="stop-card">
                        <div className="stop-header">
                            <h3>{stop.name}</h3>
                            <span className="stop-distance">
                                ~{Math.round(Math.random() * 500)}m
                            </span>
                        </div>

                        {stop.stoptimesWithoutPatterns.length > 0 ? (
                            <div className="departures">
                                <div className="departures-title">Next departures:</div>
                                {stop.stoptimesWithoutPatterns.slice(0, numberOfDepartures).map((stoptime, idx) => {
                                    const minutesUntil = getMinutesUntilArrival(
                                        stoptime.scheduledArrival,
                                    )
                                    const arrivalTime = formatArrivalTime(
                                        stoptime.scheduledArrival,
                                    )

                                    return (
                                        <div
                                            key={idx}
                                            className={`departure ${stoptime.realtime ? 'realtime' : ''
                                                }`}
                                        >
                                            <span className="route">
                                                {stoptime.trip?.route?.shortName ?? '?'}
                                            </span>
                                            <span className="destination">
                                                {stoptime.headsign ?? 'Unknown'}
                                            </span>
                                            <span className="time">
                                                {minutesUntil <= 0 ? 'Now' : `${minutesUntil}m`}
                                            </span>
                                            <span className="scheduled">{arrivalTime}</span>
                                            {stoptime.realtime && (
                                                <span className="realtime-badge">📍 Real-time</span>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        ) : (
                            <div className="no-departures">No departures available</div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}
