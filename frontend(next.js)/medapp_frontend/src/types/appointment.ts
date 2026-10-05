import { AssistantDoctor } from "./assistant";
import { Field } from "./fields";

export type AppointmentStatus =
  | "CONFIRMED"
  | "NO_SHOW"
  | "COMPLETED"
  | "CANCELLED";

export type AppointmentFormMode =
  | "list"
  | "create"
  | "book"
  | "assistant_create"
  | "edit"
  | "reschedule";

export interface DoctorSummary {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  specialty: string;
  consultationDuration: number;
}

export interface AssistantSummary {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export interface PatientSummary {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
}

export interface Appointment {
  id: string;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  reason: string;
  status: AppointmentStatus;
  doctor: DoctorSummary;
  assistant?: AssistantSummary;
  patient: PatientSummary;
}

export interface AppointmentRequest {
  appointmentDate: string;
  startTime: string;
  reason: string;
  doctor?: AssistantDoctor;
  assistant?: AssistantSummary;
  patient?: PatientSummary;
  status?: AppointmentStatus;
}

export interface AppointmentRescheduleRequest {
  appointmentDate: string;
  startTime: string;
}

export interface AppointmentCancelRequest {
  cancelReason: string;
}

export const appointmentsFields: Field[] = [
  {
    label: "Appointment Date",
    name: "appointmentDate",
  },

  {
    label: "Appointment Time",
    name: "startTime",
    type: "time",
  },

  {
    label: "Reason",
    name: "reason",
  },

  {
    label: "Status",
    name: "status",
  },

  {
    label: "Doctor",
    name: "doctor",
  },

  {
    label: "Assistant",
    name: "assistant",
  },

  {
    label: "Patient",
    name: "patient",
  },
];

export interface AppointmentSummary {
  id: string;
  appointmentDate: string;
  startTime: string;
  status: AppointmentStatus;
  reason: string;
  notes: string;
}
