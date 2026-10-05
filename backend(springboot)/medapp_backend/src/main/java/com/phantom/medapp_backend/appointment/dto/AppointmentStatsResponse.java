package com.phantom.medapp_backend.appointment.dto;

public record AppointmentStatsResponse(

        long total,

        long confirmed,

        long completed,

        long cancelled,

        long today

) {
}
