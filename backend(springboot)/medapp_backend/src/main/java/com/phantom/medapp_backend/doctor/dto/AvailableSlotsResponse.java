package com.phantom.medapp_backend.doctor.dto;

import java.time.LocalTime;

public record AvailableSlotsResponse(
        LocalTime startTime,
        LocalTime endTime,
        boolean available
        ) {

}
