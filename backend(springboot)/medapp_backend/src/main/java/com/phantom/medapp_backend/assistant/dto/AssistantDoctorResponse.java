package com.phantom.medapp_backend.assistant.dto;

import java.util.UUID;


public record AssistantDoctorResponse(
    UUID id,
    String fullName,
    String email,
    String specialty,
    String phone,
    long todayAppointments
) {

}
