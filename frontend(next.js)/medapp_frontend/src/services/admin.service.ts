import API from "@/lib/axios";
import { Doctor, DoctorRequest } from "@/types/doctor";
import { Assistant, AssistantRequest } from "@/types/assistant";
import { Patient, PatientRequest } from "@/types/patients";
import { UserRequest } from "@/types/user";
import { Appointment, AppointmentRequest } from "@/types/appointment";

export const adminDoctorService = {
  async getAllDoctors(): Promise<Doctor[]> {
    const response = await API.get("/admin/list/doctors");
    return response.data;
  },

  async createDoctor(data: DoctorRequest) {
    const response = await API.post("/admin/create/doctor", data);
    return response.data;
  },

  async updateDoctor(id: string, data: DoctorRequest) {
    const response = await API.patch(`/admin/update/doctor/${id}`, data);
    return response.data;
  },

  async softDeleteDoctor(id: string) {
    await API.delete(`/admin/delete/doctor/${id}`);
    return "Doctor set as inactive";
  },

  async restoreDoctor(id: string) {
    await API.patch(`/admin/doctor/${id}/restore`);
    return "Doctor is active again and ready to work";
  },

  async hardDeleteDoctor(id: string) {
    await API.delete(`/admin/delete/doctor/${id}/db`);
    return "Doctor deleted permanantly";
  },
  async bulkActivateDoctors(ids: string[]) {
    await API.post("/admin/bulk/activate/doctors", { ids });
  },

  async bulkDeactivateDoctors(ids: string[]) {
    await API.post("/admin/bulk/deactivate/doctors", { ids });
  },

  async bulkDeleteDoctors(ids: string[]) {
    await API.post("/admin/bulk/delete/doctors", { ids });
  },
};

export const adminAssistantService = {
  async getAssistants(): Promise<Assistant[]> {
    const response = await API.get("/admin/list/assistants");
    return response.data;
  },
  async createAssistant(data: AssistantRequest) {
    const response = await API.post("/admin/create/assistant", data);
    return response.data;
  },

  async updateAssistant(id: string, data: AssistantRequest) {
    const response = await API.patch(`/admin/update/assistant/${id}`, data);
    return response.data;
  },
  async softDeleteAssistant(id: string) {
    await API.delete(`/admin/assistant/delete/${id}`);
    return "Assistant set as inactive";
  },

  async restoreAssistant(id: string) {
    await API.patch(`/admin/assistant/${id}/restore`);
    return "Assistant is active again and ready to work";
  },

  async hardDeleteAssistant(id: string) {
    await API.delete(`/admin/assistant/delete/${id}/db`);
    return "Assistant deleted permanantly";
  },

  async getAssignedDoctors(assistant_id: string) {
    const response = await API.get(`/admin/assistants/${assistant_id}/doctors`);
    return response.data;
  },

  async updateAssignedDoctors(assistant_id: string, doctor_ids: string[]) {
    await API.put(`/admin/assistants/${assistant_id}/doctors`, doctor_ids);
  },

  async assignDoctorToAssistant(assistant_id: string, doctor_id: string) {
    const response = await API.post(
      `/assistants/${assistant_id}/doctors/${doctor_id}`,
    );
    return response.data;
  },

  async removeDoctorToAssistant(assistant_id: string, doctor_id: string) {
    const response = await API.delete(
      `/assistants/${assistant_id}/doctors/${doctor_id}`,
    );
    return response.data;
  },

  async bulkActivateAssistants(ids: string[]) {
    await API.post("/admin/bulk/activate/assistants", { ids });
  },

  async bulkDeactivateAssistants(ids: string[]) {
    await API.post("/admin/bulk/deactivate/assistants", { ids });
  },

  async bulkDeleteAssistants(ids: string[]) {
    await API.post("/admin/bulk/delete/assistants", { ids });
  },
};

export const adminPatientService = {
  async getPatients(): Promise<Patient[]> {
    const response = await API.get("/admin/list/patients");
    return response.data;
  },

  async updatePatient(patient_id: string, data: PatientRequest) {
    const response = await API.patch(`/admin/update/${patient_id}`, data);
    return response.data;
  },
};

export const adminDashboardService = {
  async getStats() {
    const response = await API.get("/admin/dashboard");
    return response.data;
  },

  async getLastThreeDoctors() {
    const response = await API.get("/admin/last/doctors");
    return response.data;
  },

  async getLastThreeAppointments() {
    const response = await API.get("/admin/last/appointments");
    return response.data;
  },

  async getLastThreeAssistants() {
    const response = await API.get("/admin/last/assistants");
    return response.data;
  },

  async getProfile() {
    const response = await API.get("/admin/my/profile");
    return response.data;
  },

  async updateProfile(data: UserRequest) {
    const response = await API.patch("/admin/update/profile", data);
    return response.data;
  },
};

export const adminAppointmentService = {
  async getAppointments(): Promise<Appointment[]> {
    const response = await API.get(`/admin/list/appointments`);
    return response.data;
  },

  async createAppointment(data: AppointmentRequest) {
    const response = await API.post(`/admin/create/appointment`, data);
    return response.data;
  },

  async updateAppointment(id: string | undefined, data: AppointmentRequest) {
    const response = await API.patch(`/admin/update/${id}`, data);
    return response.data;
  },

  async cancelAppointment(id: string) {
    await API.delete(`/admin/cancel/${id}`);
    return "Appointment cancelled";
  },
};
