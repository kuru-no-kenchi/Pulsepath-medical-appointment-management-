package com.phantom.medapp_backend.appointment.dto;

import java.time.LocalDate;
import java.time.LocalTime;

import com.phantom.medapp_backend.appointment.AppointmentStatus;
import com.phantom.medapp_backend.assistant.dto.AssistantSummaryResponse;
import com.phantom.medapp_backend.doctor.dto.DoctorSummaryResponse;
import com.phantom.medapp_backend.patient.dto.PatientSummaryResponse;
import com.phantom.medapp_backend.utils.NotBlankIfPresent;

import jakarta.validation.constraints.NotNull;


public record AppointmentRequest(
        @NotNull
        LocalDate appointmentDate,
        @NotNull
        LocalTime startTime,
        AppointmentStatus status,
        @NotBlankIfPresent
        String reason,
        DoctorSummaryResponse doctor,
        AssistantSummaryResponse assistant,
        PatientSummaryResponse patient
        ) {

}
