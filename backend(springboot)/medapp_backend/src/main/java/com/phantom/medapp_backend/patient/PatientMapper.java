package com.phantom.medapp_backend.patient;

import org.springframework.stereotype.Component;

import com.phantom.medapp_backend.patient.dto.PatientResponse;

@Component
public class PatientMapper {

    public PatientResponse map(Patient patient){
                return new PatientResponse(
                patient.getId(),
                patient.getUser().getFirstName(),
                patient.getUser().getLastName(),
                patient.getUser().getEmail(),
                patient.getUser().getPhone(),
                patient.getUser().getPhotoUrl(),
                patient.getAddress(),
                patient.getDateOfBirth(),
                patient.getGender(),
                patient.getEmergencyContact()
        );
    }

}
