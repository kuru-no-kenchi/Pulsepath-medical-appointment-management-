package com.phantom.medapp_backend.doctor.dto;

import java.util.UUID;

public record DoctorAssistantResponse(
        UUID id,
        String firstName,
        String lastName,
        String email,
        String phone
        ) {

}
