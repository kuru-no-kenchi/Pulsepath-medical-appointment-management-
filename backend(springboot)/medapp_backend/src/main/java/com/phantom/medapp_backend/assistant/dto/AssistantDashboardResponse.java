package com.phantom.medapp_backend.assistant.dto;

public record AssistantDashboardResponse(
    long doctorsManaged,
    long todayAppointments,
    long remainingAppointments,
    long totalPatients
) {

}
