package com.phantom.medapp_backend.appointment.dto;

import java.time.LocalDate;
import java.time.LocalTime;

import jakarta.validation.constraints.NotNull;

public record AppointmentRescheduleRequest(
    @NotNull
    LocalDate appointmentDate,
    @NotNull
    LocalTime startTime
) {

}
