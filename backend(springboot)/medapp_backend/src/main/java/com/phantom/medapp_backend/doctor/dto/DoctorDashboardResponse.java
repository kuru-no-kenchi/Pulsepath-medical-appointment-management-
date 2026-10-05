package com.phantom.medapp_backend.doctor.dto;

public record DoctorDashboardResponse(
        long todayAppointments,
        long completedAppointments,
        long remainingAppointments,
        long totalPatients
        ) {

}
