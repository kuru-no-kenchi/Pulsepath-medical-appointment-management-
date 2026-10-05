import { User, UserRequest } from "./user";
import { Field } from "./fields";

export interface Patient extends User {
  address: string;
  dateOfBirth: string;
  gender: "MALE" | "FEMALE";
  emergencyContact?: string;
}

export interface PatientRequest extends UserRequest {
  address: string;
  dateOfBirth: string;
  gender: string;
  emergencyContact?: string;
}

export interface PatientStats {
  nextAppointmentDate: string;
  nextAppointmentTime: string;
  nextAppointmentDoctor: string;
  totalAppointments: number;
  completedVisits: number;
  pendingAppointments: number;
}

export interface PatientDoctorView {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  specialty: string;
  phone: string;
  photoUrl:string;
}

export const patientFields: Field[] = [
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
    readOnly: true,
  },
  {
    label: "Phone",
    name: "phone",
  },
  {
    label: "Address",
    name: "address",
    type: "textarea",
  },
  {
    label: "DateOfBirth",
    name: "dateOfBirth",
    type: "date",
  },
  {
    label: "Gender",
    name: "gender",
    type: "select",
    options: [
      {
        value: "MALE",
        label: "Male",
      },
      {
        value: "FEMALE",
        label: "Female",
      },
    ],
  },
  {
    label: "EmergencyContact",
    name: "emergencyContact",
  },
];
