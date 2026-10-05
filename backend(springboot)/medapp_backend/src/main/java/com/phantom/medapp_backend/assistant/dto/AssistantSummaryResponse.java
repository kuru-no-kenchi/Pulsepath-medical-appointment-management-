package com.phantom.medapp_backend.assistant.dto;

import java.util.UUID;

public record AssistantSummaryResponse(
    UUID id,
    String firstName,
    String lastName,
    String email,
    String phone
) {

}
