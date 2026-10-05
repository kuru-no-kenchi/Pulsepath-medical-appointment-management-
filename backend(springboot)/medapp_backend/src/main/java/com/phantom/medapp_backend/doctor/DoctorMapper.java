package com.phantom.medapp_backend.doctor;

import org.springframework.stereotype.Component;

import com.phantom.medapp_backend.doctor.dto.DoctorResponse;

@Component
public class DoctorMapper {

    public DoctorResponse map(Doctor doctor){
        return new DoctorResponse(doctor.getId(), doctor.getUser().getFirstName(),
                doctor.getUser().getLastName(), doctor.getUser().getEmail(),
                doctor.getUser().getPhone(),doctor.getUser().getPhotoUrl(), doctor.getSpecialty(), doctor.getBio(),
                doctor.getExperienceYears(), doctor.getConsultationDuration(), doctor.isActive());
    }
}
