import z from "zod";

export const userSchema = z.object({
  firstName: z
    .string()
    .min(2)
    .regex(/^[A-Za-zÀ-ÿ' -]+$/, "Only letters are allowed"),
  lastName: z
    .string()
    .min(2)
    .regex(/^[A-Za-zÀ-ÿ' -]+$/, "Only letters are allowed"),
  email: z.email(),
  password: z
    .string()
    .min(8,"Must contain at least 8 characters")
    .regex(/[A-Z]/, "Must contain one uppercase letter")
    .regex(/[a-z]/, "Must contain one lowercase letter")
    .regex(/[0-9]/, "Must contain one digit")
    .regex(/[^A-Za-z0-9]/, "Must contain one special character"),
  phone: z
    .string()
    .regex(
      /^(06|07)\d{8}$/,
      "Phone number must start with 06 or 07 and contain 10 digits",
    ),
  photoUrl: z.url().optional().or(z.literal("")),
});

export const resetPasswordSchema = z.object({
  email: z.email(),
  password: z
    .string()
    .min(8, "Must contain at least 8 characters")
    .regex(/[A-Z]/, "Must contain one uppercase letter")
    .regex(/[a-z]/, "Must contain one lowercase letter")
    .regex(/[0-9]/, "Must contain one digit")
    .regex(/[^A-Za-z0-9]/, "Must contain one special character"),
});

export type UserForm = z.infer<typeof userSchema>;
export type ResetPasswordForm = z.infer<typeof resetPasswordSchema>;