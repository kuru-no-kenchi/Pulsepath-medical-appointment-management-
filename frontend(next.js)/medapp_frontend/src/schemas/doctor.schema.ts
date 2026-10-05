import { z } from "zod";
import { userSchema } from "./auth.schema";

export const doctorSchema = userSchema.omit({ password: true }).extend({
  specialty: z.string().min(2, "Specialty is required"),
  experienceYears: z.number().min(0, "Experience cannot be negative"),
  bio: z.string().max(100, "Biography is too long"),
  consultationDuration: z.number().min(5).max(120),
});

export type DoctorForm = z.infer<typeof doctorSchema>;
