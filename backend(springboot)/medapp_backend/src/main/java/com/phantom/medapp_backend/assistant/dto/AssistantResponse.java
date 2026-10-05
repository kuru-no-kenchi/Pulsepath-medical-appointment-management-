package com.phantom.medapp_backend.assistant.dto;

import java.util.List;
import java.util.UUID;


public record AssistantResponse(
    UUID id,
    String firstName,
    String lastName,
    String email,
    String phone,
    String photoUrl,
    boolean active,
    List<AssistantDoctorResponse> doctors
) {

}
