import z from "zod";
import { userSchema } from "./auth.schema";

export const patientSchema = userSchema.extend({
  address: z.string().min(10, "Address is required"),
  dateOfBirth: z.string(),
  gender: z.enum(["MALE", "FEMALE"], {
    message: "Gender is either a male or female",
  }).or(z.string()),
  emergencyContact: z
    .string()
    .regex(
      /^(06|07)\d{8}$/,
      "Phone number must start with 06 or 07 and contain 10 digits",
    )
    .optional(),
});

export type PatientForm = z.infer<typeof patientSchema>;
