import API from "@/lib/axios";
import {
  AppointmentRequest,
  AppointmentRescheduleRequest,
} from "@/types/appointment";
import { AssistantRequest } from "@/types/assistant";

const ASSISTANT_URL = "/assistant";

export const assistantService = {
  async getDashboard() {
    const response = await API.get(`${ASSISTANT_URL}/dashboard`);
    return response.data;
  },

  async getProfile() {
    const response = await API.get(`${ASSISTANT_URL}/my/profile`);
    return response.data;
  },

  async updateProfile(data: AssistantRequest) {
    const response = await API.patch(
      `${ASSISTANT_URL}/update/my/profile`,
      data,
    );
    return response.data;
  },

  async getTodayAppointments() {
    const response = await API.get(`${ASSISTANT_URL}/today/appointments`);
    return response.data;
  },

  async getManagedDoctors() {
    const response = await API.get(`${ASSISTANT_URL}/my/doctors`);
    return response.data;
  },

  async getPatients() {
    const response = await API.get(`${ASSISTANT_URL}/my/patients`);
    return response.data;
  },

  async getAppointments() {
    const response = await API.get(`${ASSISTANT_URL}/my/doctors/appointments`);
    return response.data;
  },

  async createAppointment(data: AppointmentRequest) {
    const response = await API.post(
      `${ASSISTANT_URL}/appointment/create`,
      data,
    );
    return response.data;
  },

  async rescheduleAppointment(id: string, data: AppointmentRescheduleRequest) {
    const response = await API.patch(
      `${ASSISTANT_URL}/appointment/${id}/reschedule`,
      data,
    );
    return response.data;
  },

  async cancelAppointment(id: string) {
    await API.patch(`${ASSISTANT_URL}/appointment/${id}/cancel`);
    return "Appointment cancelled";
  },

  async markComplete(appointment_id: string) {
    await API.patch(
      `${ASSISTANT_URL}/appointment/mark/${appointment_id}/complete`,
    );
    return "Appointment Completed";
  },

  async markNoShow(appointment_id: string) {
    await API.patch(
      `${ASSISTANT_URL}/appointment/mark/${appointment_id}/no_show`,
    );
    return "Patient did not show to the appointment";
  },
};
