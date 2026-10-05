package com.phantom.medapp_backend.appointment.dto;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

import com.phantom.medapp_backend.appointment.AppointmentStatus;

public record AppointmentSummaryResponse(
        UUID id,
        LocalDate appointmentDate,
        LocalTime startTime,
        AppointmentStatus status,
        String reason,
        String notes) {

}
