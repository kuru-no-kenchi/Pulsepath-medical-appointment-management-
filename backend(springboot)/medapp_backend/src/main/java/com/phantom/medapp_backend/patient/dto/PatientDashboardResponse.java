package com.phantom.medapp_backend.patient.dto;

import java.time.LocalDate;
import java.time.LocalTime;

public record PatientDashboardResponse(LocalDate nextAppointmentDate, LocalTime nextAppointmentTime,
        String nextDoctorName, String nextDoctorSpecialty, long totalAppointments, long completedVisits,
        long pendingAppointments) {

}
