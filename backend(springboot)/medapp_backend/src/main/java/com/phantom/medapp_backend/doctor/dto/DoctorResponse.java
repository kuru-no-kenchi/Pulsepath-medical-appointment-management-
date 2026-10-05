package com.phantom.medapp_backend.doctor.dto;

import java.util.UUID;

public record DoctorResponse(
        UUID id,
        String firstName,
        String lastName,
        String email,
        String phone,
        String photoUrl,
        String specialty,
        String bio,
        Integer experienceYears,
        Integer consultationDuration,
        boolean active
        ) {

}
