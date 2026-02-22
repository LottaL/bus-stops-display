import z from 'zod';

export const Trip = z.object({
  route: z.object({
    shortName: z.string(),
  }),
});

export type Trip = z.infer<typeof Trip>;

export const StopTime = z.object({
  scheduledArrival: z.number().nullable(),
  realtime: z.boolean(),
  realtimeState: z.string().nullable(),
  headsign: z.string().nullable(),
  trip: Trip.nullable(),
});

export type StopTime = z.infer<typeof StopTime>;

export const BusStop = z.object({
  gtfsId: z.string(),
  name: z.string().nullable(),
  lat: z.number(),
  lon: z.number(),
  stoptimesWithoutPatterns: z.array(StopTime),
});

export type BusStop = z.infer<typeof BusStop>;

export const NearestStops = z.object({
  stops: z.array(BusStop),
});

export type NearestStops = z.infer<typeof NearestStops>;

export const DigiTransitStopsResponse = z.object({
  data: z.record(z.string(), z.array(BusStop)),
});

export type DigiTransitStopsResponse = z.infer<typeof DigiTransitStopsResponse>;

export const DigitransitError = z.object({
  message: z.string(),
});

export type DigitransitError = z.infer<typeof DigitransitError>;

export const DigitransitErrorResponse = z.array(DigitransitError);

export type DigitransitErrorResponse = z.infer<typeof DigitransitErrorResponse>;
