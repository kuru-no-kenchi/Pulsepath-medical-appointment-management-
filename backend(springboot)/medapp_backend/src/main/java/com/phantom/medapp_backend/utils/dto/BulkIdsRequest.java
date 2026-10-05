package com.phantom.medapp_backend.utils.dto;

import java.util.List;
import java.util.UUID;

import jakarta.validation.constraints.NotEmpty;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class BulkIdsRequest {
    @NotEmpty(message = "At least one ID is required")
    private List<UUID> ids;
}