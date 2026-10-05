package com.phantom.medapp_backend.doctor.dto;

import java.time.LocalDate;
import java.util.UUID;
import java.util.List;

import com.phantom.medapp_backend.appointment.dto.AppointmentSummaryResponse;
import com.phantom.medapp_backend.patient.Gender;

public record DoctorPatientResponse(
        UUID id,
        String firstName,
        String lastName,
        String email,
        String phone,
        String photoUrl,
        String address,
        LocalDate dateOfBirth,
        Gender gender,
        String emergencyContact,
        List<AppointmentSummaryResponse> history
        ) {

}
