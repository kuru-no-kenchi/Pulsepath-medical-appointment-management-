import { string } from "zod";
import { Field } from "./fields";

export type UserRole = "ADMIN" | "DOCTOR" | "ASSISTANT" | "PATIENT";

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface UserResponse {
  email: string;
  token: string;
  role: string;
  firstName: string;
  lastName: string;
}

export interface User {
  active: any;
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  photoUrl?: string;
}

export interface UserRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  photoUrl?: string;
}

export interface ResetPasswordRequest {
  email: string;
  newPassword: string;
}

export const userFields: Field[] = [
  {
    name: "photoUrl",
    label: "Profile Photo",
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
