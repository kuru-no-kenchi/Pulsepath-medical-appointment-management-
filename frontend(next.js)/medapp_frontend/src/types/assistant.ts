import { Field } from "./fields";
import { User, UserRequest } from "./user";

export interface Assistant extends User {
  doctors: AssistantDoctor[];
}

export interface AssistantDoctor {
  id: string;
  fullName: string;
  email: string;
  specialty: string;
  phone: string;
  photoUrl: string;
  todayAppointments: number;
}

export type AssistantRequest = UserRequest;

export interface AssistantStats {
  doctorsManaged: number;
  todayAppointments: number;
  remainingAppointments: number;
  totalPatients: number;
}
export const assistantFields: Field[] = [
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
];
