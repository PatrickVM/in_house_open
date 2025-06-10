import { z } from "zod";

export const churchInvitationSchema = z.object({
  churchEmail: z
    .string()
    .email("Please enter a valid email address")
    .min(1, "Church email is required"),
  customMessage: z
    .string()
    .max(500, "Message must be less than 500 characters")
    .optional(),
});

export const churchSignupSchema = z.object({
  // User registration fields
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Please enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),
  phone: z.string().optional(),

  // Church application fields
  churchName: z.string().min(1, "Church name is required"),
  leadPastorName: z.string().min(1, "Lead pastor name is required"),
  churchWebsite: z
    .string()
    .url("Please enter a valid website URL")
    .optional()
    .or(z.literal("")),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  zipCode: z.string().min(5, "ZIP code must be at least 5 characters"),
});

export const tokenValidationSchema = z.object({
  token: z.string().min(1, "Token is required"),
});

export type ChurchInvitationInput = z.infer<typeof churchInvitationSchema>;
export type ChurchSignupInput = z.infer<typeof churchSignupSchema>;
export type TokenValidationInput = z.infer<typeof tokenValidationSchema>;
