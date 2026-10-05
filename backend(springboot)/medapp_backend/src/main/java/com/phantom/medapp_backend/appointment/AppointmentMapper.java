package com.phantom.medapp_backend.appointment;

import org.springframework.stereotype.Component;

import com.phantom.medapp_backend.appointment.dto.AppointmentResponse;
import com.phantom.medapp_backend.assistant.dto.AssistantSummaryResponse;
import com.phantom.medapp_backend.doctor.dto.DoctorSummaryResponse;
import com.phantom.medapp_backend.patient.dto.PatientSummaryResponse;

@Component
public class AppointmentMapper {

    public AppointmentResponse map(Appointment appointment) {

        DoctorSummaryResponse doctor = new DoctorSummaryResponse(appointment.getDoctor().getId(),
                appointment.getDoctor().getUser().getFirstName(),
                appointment.getDoctor().getUser().getLastName(),
                appointment.getDoctor().getSpecialty(),
                appointment.getDoctor().getConsultationDuration());

        AssistantSummaryResponse assistant = null;

        if (appointment.getAssistant() != null) {

            assistant = new AssistantSummaryResponse(appointment.getAssistant().getId(),
                    appointment.getAssistant().getUser().getFirstName(),
                    appointment.getAssistant().getUser().getLastName(),
                    appointment.getAssistant().getUser().getEmail(),
                    appointment.getAssistant().getUser().getPhone()
            );
        }

        PatientSummaryResponse patient = new PatientSummaryResponse(appointment.getPatient().getId(),
                appointment.getPatient().getUser().getFirstName(),
                appointment.getPatient().getUser().getLastName(),
                appointment.getPatient().getUser().getEmail(),
                appointment.getPatient().getUser().getPhone(),
                appointment.getPatient().getAddress()
        );

        return new AppointmentResponse(appointment.getId(), appointment.getAppointmentDate(),
                appointment.getStartTime(), appointment.getStatus(), appointment.getReason(),
                appointment.getNotes(), doctor, assistant, patient);
    }
}
