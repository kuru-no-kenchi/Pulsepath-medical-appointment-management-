import z from "zod";
import { userSchema } from "./auth.schema";

export const assistantSchema = userSchema.omit({ password: true });

export type AssistantForm = z.infer<typeof assistantSchema>;
