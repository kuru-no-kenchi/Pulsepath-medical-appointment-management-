import API from "@/lib/axios";
import { DoctorRequest } from "@/types/doctor";

const DOCTOR_URL = "/doctor";

export const doctorService = {
  async getDashboard() {
    const response = await API.get(`${DOCTOR_URL}/dashboard`);
    return response.data;
  },

  async getAppointments(){
    const response = await API.get(`${DOCTOR_URL}/view/my/appointments`);
    return response.data;
  },

  async getAppointmentsForToday() {
    const response = await API.get(
      `${DOCTOR_URL}/view/my/appointments/today`,
    );
    return response.data;
  },

  async getAppointmentDetail(id: string) {
    const response = await API.get(`${DOCTOR_URL}/${id}`);
    return response.data;
  },

  async getPatients() {
    const response = await API.get(`${DOCTOR_URL}/my/patients`);
    return response.data;
  },

  async getPatientDetails(id: string) {
    const response = await API.get(`${DOCTOR_URL}/patient/${id}/details`);
    return response.data;
  },

  async getProfile() {
    const response = await API.get(`${DOCTOR_URL}/my/profile`);
    return response.data;
  },

  async updateProfile(data : DoctorRequest) {
    const response = await API.patch(`${DOCTOR_URL}/update/profile`, data);
    return response.data;
  },

  async getAssignedAssistant() {
    const response = await API.get(`${DOCTOR_URL}/assistant`);
    return response.data;
  },

  async getSchedule(){
    const response = await API.get(`${DOCTOR_URL}/view/schedule`);
    return response.data;
  }
};
