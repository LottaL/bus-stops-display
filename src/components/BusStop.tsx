import AccessTimeIcon from '@mui/icons-material/AccessTime';
import {
  Avatar,
  Card,
  CardContent,
  Grid,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Typography,
} from '@mui/material';
import { useGeoLocation } from '../hooks/useGeoLocation';
import { formatArrivalTime, getMinutesUntilArrival } from '../services/digitransitApi';
import { BusStop as Stop } from '../schemas/digitransit.schema';
import { getDistance } from '../utils/getDistance';

interface BusStopProps {
  stop: Stop;
}
export const BusStop = ({ stop }: BusStopProps) => {
  const { location: geoLocation } = useGeoLocation();
  const rows = stop.stoptimesWithoutPatterns.map((stoptime) => ({
    realTime: (
      <Avatar sx={{ bgcolor: 'green', width: 10, height: 10, opacity: stoptime.realtime ? 1 : 0 }}>
        {' '}
      </Avatar>
    ),
    name: stoptime.trip?.route?.shortName ?? '?',
    destination: stoptime.headsign ?? 'Unknown',
    arrivalMinutes: stoptime.scheduledArrival
      ? getMinutesUntilArrival(stoptime.scheduledArrival)
      : null,
    arrivalTime: stoptime.scheduledArrival ? formatArrivalTime(stoptime.scheduledArrival) : null,
  }));
  return (
    <Grid key={stop.gtfsId} size={{ xs: 6, md: 12 }} className="stop-card">
      <Card className="stop-card-content" variant="outlined">
        <CardContent>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h5" component="div">
              {stop.name}
            </Typography>
            {geoLocation && (
              <Typography gutterBottom sx={{ color: 'text.secondary', fontSize: 14 }}>
                ~ {getDistance(geoLocation, { lat: stop.lat, lon: stop.lon })} m
              </Typography>
            )}
          </Stack>
          <Table
            className="departures-table"
            size="small"
            sx={{ tableLayout: 'fixed', width: '100%' }}
          >
            <TableBody>
              {rows.length > 0 ? (
                rows.map((row) => (
                  <TableRow
                    key={`${row.name}-${row.arrivalTime}`}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    <TableCell sx={{ pl: 0, pr: 0, width: '4%' }} className="realTime">
                      {row.realTime}
                    </TableCell>
                    <TableCell sx={{ pl: 0.5, pr: 0, width: '15%' }} className="name">
                      {row.name}
                    </TableCell>
                    <TableCell
                      sx={{ pl: 0.5, pr: 0, width: '50%', textWrap: 'nowrap', overflow: 'clip' }}
                      className="destination"
                    >
                      {row.destination}
                    </TableCell>
                    <TableCell
                      sx={{ pl: 0.5, pr: 0, width: '10%' }}
                      className="arrivalMinutes"
                      align="right"
                    >
                      {!!row.arrivalMinutes && row.arrivalMinutes <= 0 ? (
                        <AccessTimeIcon sx={{ color: 'error.main' }} />
                      ) : (
                        `${row.arrivalMinutes}`
                      )}
                    </TableCell>
                    <TableCell
                      sx={{ pl: 0.5, pr: 0, width: '15%' }}
                      className="arrivalTime"
                      align="right"
                    >
                      {row.arrivalTime}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <Typography variant="body1" className="no-departures">
                  -
                </Typography>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </Grid>
  );
};
