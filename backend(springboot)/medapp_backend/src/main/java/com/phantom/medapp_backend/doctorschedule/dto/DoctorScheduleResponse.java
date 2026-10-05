package com.phantom.medapp_backend.doctorschedule.dto;

import java.time.LocalTime;
import java.time.DayOfWeek;
import java.util.UUID;

public record DoctorScheduleResponse(
    UUID id,
    DayOfWeek dayOfWeek,
    LocalTime startTime,
    LocalTime endTime
) {

}
