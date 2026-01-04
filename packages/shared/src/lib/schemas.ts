import { z } from "zod";

export const LatLngSchema = z.object({
  lat: z.number(),
  lng: z.number()
});

export const PublicRiderSchema = z.object({
  id: z.string(),
  displayName: z.string(),
  vehicleType: z.enum(["bike", "tricycle", "car"]),
  community: z.string(),
  lastSeenAt: z.string(),
  approxLocation: LatLngSchema.optional()
});

export type LatLng = z.infer<typeof LatLngSchema>;
export type PublicRider = z.infer<typeof PublicRiderSchema>;
