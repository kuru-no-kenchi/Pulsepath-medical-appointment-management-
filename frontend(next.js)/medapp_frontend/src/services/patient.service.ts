import API from "@/lib/axios";
import { AppointmentCancelRequest, AppointmentRequest, AppointmentRescheduleRequest } from "@/types/appointment";
import { PatientRequest } from "@/types/patients";

const PATIENT_URL = "/patient";

export const patientService = {
  async getDashboard() {
    const response = await API.get(`${PATIENT_URL}/stats`);
    return response.data;
  },

  async getUpcomingAppointments() {
    const response = await API.get(`${PATIENT_URL}/upcoming`);
    return response.data;
  },

  async getRecentVisits() {
    const response = await API.get(`${PATIENT_URL}/recent/visits`);
    return response.data;
  },

  async getVisitedDoctors() {
    const response = await API.get(`${PATIENT_URL}/doctors`);
    return response.data;
  },

  async getAppointments() {
    const response = await API.get(`${PATIENT_URL}/view/my/appointments`);
    return response.data;
  },

  async getProfile() {
    const response = await API.get(`${PATIENT_URL}/profile`);
    return response.data;
  },

  async updateProfile(data: PatientRequest) {
    const response = await API.patch(`${PATIENT_URL}/update/profile`, data);
    return response.data;
  },

  async bookAppointment(data : AppointmentRequest) {
    const response = await API.post(`${PATIENT_URL}/book/appointment`, data);
    return response.data;
  },

  async rescheduleAppointment(id: string, data: AppointmentRescheduleRequest) {
    const response = await API.patch(
      `${PATIENT_URL}/appointments/${id}/reschedule`,
      data,
    );
    return response.data;
  },

   async cancelAppointment(id: string, data: AppointmentCancelRequest) {
    const response = await API.patch(
      `${PATIENT_URL}/appointments/${id}/cancel`,
      data,
    );
    return response.data;
  },
};
