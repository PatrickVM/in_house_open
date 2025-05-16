import * as z from "zod";

export const churchApplicationSchema = z.object({
  name: z.string().min(3, {
    message: "Church name must be at least 3 characters.",
  }),
  leadPastorName: z.string().min(3, {
    message: "Lead pastor's name must be at least 3 characters.",
  }),
  website: z
    .string()
    .url({ message: "Please enter a valid URL for the church website." })
    .optional()
    .or(z.literal("")), // Allow empty string, which will be treated as undefined by the form
  address: z.string().min(5, {
    message: "Street address must be at least 5 characters.",
  }),
  city: z.string().min(2, {
    message: "City must be at least 2 characters.",
  }),
  state: z.string().min(2, {
    message: "State must be at least 2 characters.",
  }), // Consider using a select or validating against known states later
  zipCode: z.string().regex(/^\d{5}(-\d{4})?$/, {
    message: "Please enter a valid ZIP code (e.g., 12345 or 12345-6789).",
  }),
  // Latitude and Longitude will be handled manually by you or by geocoding later,
  // so they are not part of this client-side form schema.
  // The 'consent' field will also be added directly to the form later.
});

export type ChurchApplicationValues = z.infer<typeof churchApplicationSchema>;
