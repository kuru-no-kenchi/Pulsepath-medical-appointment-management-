package com.phantom.medapp_backend;

import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.phantom.medapp_backend.appointment.Appointment;
import com.phantom.medapp_backend.appointment.AppointmentStatus;
import com.phantom.medapp_backend.assistant.Assistant;
import com.phantom.medapp_backend.auditlog.AuditLog;
import com.phantom.medapp_backend.doctor.Doctor;
import com.phantom.medapp_backend.notification.Notification;
import com.phantom.medapp_backend.patient.Patient;
import com.phantom.medapp_backend.support.IntegrationTestSupport;

@SpringBootTest
@ActiveProfiles("test")
@AutoConfigureMockMvc
public class ApplicationWorkFlowIntegrationTest extends IntegrationTestSupport {

    @Test
    void shouldCompleteDoctorAssistantLifecycle() throws Exception {

        createTestAdmin(
                "workflow.admin@test.com",
                "Password123!"
        );

        String adminToken = loginAndGetAccessToken(
                "workflow.admin@test.com",
                "Password123!"
        );

        String doctorRequest = """
        {
            "firstName": "John",
            "lastName": "Doctor",
            "email": "workflow.doctor@test.com",
            "password": "Password123!",
            "phone": "0611111111",
            "specialty": "Cardiology",
            "experienceYears": 5,
            "bio": "Workflow doctor",
            "consultationDuration": 30
        }
        """;

        mockMvc.perform(
                post("/admin/create/doctor")
                        .header(
                                "Authorization",
                                "Bearer " + adminToken
                        )
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(doctorRequest)
        )
                .andExpect(status().isCreated());

        String assistantRequest = """
        {
            "firstName": "Jane",
            "lastName": "Assistant",
            "email": "workflow.assistant@test.com",
            "password": "Password123!",
            "phone": "0622222222"
        }
        """;

        mockMvc.perform(
                post("/admin/create/assistant")
                        .header(
                                "Authorization",
                                "Bearer " + adminToken
                        )
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(assistantRequest)
        )
                .andExpect(status().isCreated());

        Doctor doctor = doctorRepository
                .findByUserEmail("workflow.doctor@test.com")
                .orElseThrow();

        Assistant assistant = assistantRepository
                .findByUserEmail("workflow.assistant@test.com")
                .orElseThrow();

        String assignmentRequest = """
        {
            "doctorId": "%s",
            "assistantId": "%s"
        }
        """.formatted(
                doctor.getId(),
                assistant.getId()
        );

        mockMvc.perform(
                post("/admin/assistants/" + assistant.getId() + "/doctors/" + doctor.getId())
                        .header(
                                "Authorization",
                                "Bearer " + adminToken
                        )
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(assignmentRequest)
        )
                .andExpect(status().isOk());

        List<Notification> doctorNotifications
                = notificationRepository.findByRecipientId(
                        doctor.getUser().getId()
                );

        List<Notification> assistantNotifications
                = notificationRepository.findByRecipientId(
                        assistant.getUser().getId()
                );

        assertFalse(doctorNotifications.isEmpty());
        assertFalse(assistantNotifications.isEmpty());

        List<AuditLog> auditLogs
                = auditLogRepository.findAll();

        assertFalse(auditLogs.isEmpty());
    }

    @Test
    void shouldCompleteAppointmentLifecycle() throws Exception {

        Patient patient = createTestPatient(
                "workflow.patient@test.com",
                "Password123!"
        );

        Doctor doctor = createTestDoctor(
                "workflow.appointment.doctor@test.com",
                "Password123!"
        );

        Assistant assistant = createTestAssistant(
                "workflow.appointment.assistant@test.com",
                "Password123!"
        );

        String patientToken = loginAndGetAccessToken(
                "workflow.patient@test.com",
                "Password123!"
        );

        String appointmentRequest = """
            {
                                "doctor": {
                                        "id": "%s"
                                },
                                "assistant": {
                                        "id": "%s"
                                },
                "appointmentDate": "2026-09-15",
                                "startTime": "10:00",
                                "reason": "Routine consultation"
            }
                        """.formatted(doctor.getId(), assistant.getId());
        mockMvc.perform(
                post("/patient/appointments/create")
                        .header(
                                "Authorization",
                                "Bearer " + patientToken
                        )
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(appointmentRequest)
        )
                .andExpect(status().isCreated());

        Appointment appointment
                = appointmentRepository
                        .findByPatientIdAndDoctorId(
                                patient.getId(),
                                doctor.getId()
                        )
                        .orElseThrow();

        assertNotNull(appointment);

        String rescheduleRequest = """
        {
            "appointmentDate": "2026-09-16",
            "startTime": "11:00"
        }
        """;

        mockMvc.perform(
                patch(
                        "/patient/appointments/" + appointment.getId() + "/reschedule"
                )
                        .header(
                                "Authorization",
                                "Bearer " + patientToken
                        )
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(rescheduleRequest)
        )
                .andExpect(status().isOk());
        Appointment rescheduled
                = appointmentRepository
                        .findById(appointment.getId())
                        .orElseThrow();

        assertEquals(
                LocalDate.of(2026, 9, 16),
                rescheduled.getAppointmentDate()
        );

        String cancelRequest = """
        {
            "cancelReason": "Not available for appointment"
        }
        """;

        mockMvc.perform(
                patch(
                        "/patient/appointments/" + appointment.getId() + "/cancel"
                )
                        .header(
                                "Authorization",
                                "Bearer " + patientToken
                        )
                        .content(cancelRequest)
                        .contentType(MediaType.APPLICATION_JSON)
        )
                .andExpect(status().isOk());

        Appointment cancelled
                = appointmentRepository
                        .findById(appointment.getId())
                        .orElseThrow();

        assertEquals(
                AppointmentStatus.CANCELLED,
                cancelled.getStatus()
        );
    }

    @Test
    void inactiveDoctorShouldNotBeUsedForNewAppointment() throws Exception {

        createTestPatient(
                "workflow.inactive.patient@test.com",
                "Password123!"
        );

        Doctor doctor = createTestDoctor(
                "workflow.inactive.doctor@test.com",
                "Password123!"
        );

        Assistant assistant = createTestAssistant(
                "workflow.inactive.assistant@test.com",
                "Password123!"
        );

        doctor.setActive(false);
        doctorRepository.save(doctor);

        String token = loginAndGetAccessToken(
                "workflow.inactive.patient@test.com",
                "Password123!"
        );

        String request = """
            {
                                "doctor": {
                                        "id": "%s"
                                },
                                "assistant": {
                                        "id": "%s"
                                },
                "appointmentDate": "2026-09-15",
                                "startTime": "10:00",
                                "reason": "Routine consultation"
            }
                        """.formatted(doctor.getId(), assistant.getId());

        mockMvc.perform(
                post("/patient/appointments/create")
                        .header(
                                "Authorization",
                                "Bearer " + token
                        )
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(request)
        )
                .andExpect(status().isNotFound());
    }

}
