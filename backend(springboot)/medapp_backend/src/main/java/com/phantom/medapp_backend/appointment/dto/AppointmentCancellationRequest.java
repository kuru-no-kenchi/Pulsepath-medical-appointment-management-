package com.phantom.medapp_backend.appointment.dto;

import jakarta.validation.constraints.NotNull;

public record AppointmentCancellationRequest(
    @NotNull
    String cancelReason

) {

}
