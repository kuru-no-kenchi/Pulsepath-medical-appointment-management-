package com.phantom.medapp_backend.admin.dto;

import java.util.UUID;

public record AdminAssistantResponse(
    UUID assistant_id,
    String email,
    String temporaryPassword
) {

}
