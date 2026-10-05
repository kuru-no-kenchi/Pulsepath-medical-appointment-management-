package com.phantom.medapp_backend.doctorschedule.dto;

import java.time.DayOfWeek;
import java.time.LocalTime;
import java.util.UUID;

import jakarta.validation.constraints.NotNull;

public record DoctorScheduleRequest(
    UUID doctorId,
    @NotNull
    LocalTime startTime,
    LocalTime endTime,
    @NotNull
    DayOfWeek dayOfWeek
) {

}
