package com.phantom.medapp_backend.appointment.dto;

import java.time.LocalDateTime;

import com.phantom.medapp_backend.user.Role;
import com.phantom.medapp_backend.user.User;

import jakarta.validation.constraints.NotNull;

public record AppointmentCancellationResponse(
        @NotNull
        String cancelReason,
        @NotNull
        LocalDateTime cancelledAt,
        @NotNull
        User cancelledBy,
        @NotNull
        Role role,
        @NotNull
        String canceller_email
        ) {

}
