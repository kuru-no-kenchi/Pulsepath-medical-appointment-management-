package com.phantom.medapp_backend.appointment.dto;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

import com.phantom.medapp_backend.appointment.AppointmentStatus;
import com.phantom.medapp_backend.assistant.dto.AssistantSummaryResponse;
import com.phantom.medapp_backend.doctor.dto.DoctorSummaryResponse;
import com.phantom.medapp_backend.patient.dto.PatientSummaryResponse;

public record AppointmentResponse(
        UUID id,
        LocalDate appointmentDate,
        LocalTime startTime,
        AppointmentStatus status,
        String reason,
        String notes,
        DoctorSummaryResponse doctor,
        AssistantSummaryResponse assistant,
        PatientSummaryResponse patient
        ) {

}
