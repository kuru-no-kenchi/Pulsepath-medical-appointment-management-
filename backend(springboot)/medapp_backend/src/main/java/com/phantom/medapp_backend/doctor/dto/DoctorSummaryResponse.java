package com.phantom.medapp_backend.doctor.dto;

import java.util.UUID;

public record DoctorSummaryResponse(
    UUID id,
    String firstName,
    String lastName,
    String specialty,
    Integer consultationDuration
) {

}