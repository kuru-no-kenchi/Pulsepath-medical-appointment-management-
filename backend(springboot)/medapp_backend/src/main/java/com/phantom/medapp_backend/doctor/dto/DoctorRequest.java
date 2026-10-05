package com.phantom.medapp_backend.doctor.dto;

import com.phantom.medapp_backend.user.dto.UserRequest;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter

public class DoctorRequest extends UserRequest {
    @NotNull
    private String specialty;
    @NotNull
    private Integer experienceYears;
    @NotNull
    private String bio;
    @NotNull
    private Integer consultationDuration;
}
