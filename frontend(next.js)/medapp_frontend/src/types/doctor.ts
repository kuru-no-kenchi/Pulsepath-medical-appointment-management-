import { Field } from "./fields";
import { AppointmentSummary } from "./appointment";
import { UserRequest, User } from "./user";
import { Patient } from "./patients";

export interface Doctor extends User {
  specialty: string;
  experienceYears: number;
  bio: string;
  consultationDuration: number;
}

export interface DoctorRequest extends UserRequest {
  specialty: string;
  experienceYears: number;
  bio: string;
  consultationDuration: number;
}
export interface DoctorDashboard {
  todayAppointments: number;
  upcomingAppointments: number;
  completedAppointments: number;
  totalPatients: number;
}

export interface DoctorPatient extends Patient {
  history: AppointmentSummary;
}

export interface DoctorScheduleRequest {
  doctorId: string;
  startTime: string;
  endTime: string;
  dayOfWeek: string;
}
export const doctorFields: Field[] = [
  {
    label: "Photo",
    name: "photoUrl",
    type: "image",
  },
  {
    label: "First Name",
    name: "firstName",
  },

  {
    label: "Last Name",
    name: "lastName",
  },

  {
    label: "Email",
    name: "email",
    type: "email",
  },

  {
    label: "Phone",
    name: "phone",
  },

  {
    label: "Specialty",
    name: "specialty",
  },

  {
    label: "Experience",
    name: "experienceYears",
    type: "number",
  },

  {
    label: "Consultation Duration",
    name: "consultationDuration",
    type: "number",
  },

  {
    label: "Biography",
    name: "bio",
    type: "textarea",
  },
];
