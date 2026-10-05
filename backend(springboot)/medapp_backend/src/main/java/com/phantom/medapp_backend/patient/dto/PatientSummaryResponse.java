package com.phantom.medapp_backend.patient.dto;


import java.util.UUID;

public record PatientSummaryResponse(
    UUID id,
    String firstName,
    String lastName,
    String email,
    String phone,
    String address
) {

}
