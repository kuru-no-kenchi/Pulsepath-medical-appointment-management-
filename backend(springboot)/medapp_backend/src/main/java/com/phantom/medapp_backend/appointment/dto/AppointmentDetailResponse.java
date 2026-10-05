package com.phantom.medapp_backend.appointment.dto;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

import com.phantom.medapp_backend.appointment.AppointmentStatus;
import com.phantom.medapp_backend.assistant.Assistant;
import com.phantom.medapp_backend.doctor.Doctor;
import com.phantom.medapp_backend.patient.Patient;

public record AppointmentDetailResponse(
        UUID id,
        Doctor doctor,
        Assistant assistant,
        Patient patient,
        LocalDate appointmentDate,
        LocalTime startTime,
        String reason,
        AppointmentStatus status,
        String notes
        ) {

}
