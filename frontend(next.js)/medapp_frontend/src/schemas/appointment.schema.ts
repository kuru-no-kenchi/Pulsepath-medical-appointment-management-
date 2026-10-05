import z from "zod";

export const appointmentSchema = z.object({
  appointmentDate: z.iso
    .date()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date")
    .refine(
      (date) => {
        const selected = new Date(date);
        selected.setHours(0, 0, 0, 0);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return selected >= today;
      },
      {
        message: "Appointment date cannot be in the past",
      },
    ),
  startTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .refine(
      (time) => {
        const [h, m] = time.split(":").map(Number);
        return h > 8 || (h === 8 && m >= 0);
      },
      {
        message: "Appointments start at 08:00",
      },
    )
    .refine(
      (time) => {
        const [h, m] = time.split(":").map(Number);
        return h < 18 || (h === 18 && m === 0);
      },
      {
        message: "Appointments end at 18:00",
      },
    ),
  reason: z.string().trim().min(5, "Please provide a reason").max(500),
  doctorId: z.string().min(1, "Please select a doctor"),
  patientId: z.string().min(1, "Please select a patient"),
  assistantId: z.string().optional(),
});

export type AppointmentForm = z.infer<typeof appointmentSchema>;
