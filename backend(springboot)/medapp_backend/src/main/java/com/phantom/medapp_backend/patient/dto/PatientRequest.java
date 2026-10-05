package com.phantom.medapp_backend.patient.dto;

import java.time.LocalDate;

import com.phantom.medapp_backend.patient.Gender;
import com.phantom.medapp_backend.user.dto.UserRequest;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter

public class PatientRequest extends UserRequest {
    private String address;
    private LocalDate dateOfBirth;
    private Gender gender;
    private String emergencyContact;

}
