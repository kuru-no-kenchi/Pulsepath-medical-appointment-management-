package com.phantom.medapp_backend.patient.dto;

import java.time.LocalDate;
import java.util.UUID;

import com.phantom.medapp_backend.patient.Gender;

public record PatientResponse(
    UUID id,
    String firstName,
    String lastName,
    String email,
    String phone,
    String photoUrl,
    String address,
    LocalDate dateOfBirth,
    Gender gender,
    String emergencyContact

) {

}
