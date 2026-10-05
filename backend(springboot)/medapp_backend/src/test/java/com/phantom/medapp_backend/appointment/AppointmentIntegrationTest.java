package com.phantom.medapp_backend.appointment;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.BrokenBarrierException;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.CyclicBarrier;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertEquals;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.phantom.medapp_backend.appointment.dto.AppointmentResponse;
import com.phantom.medapp_backend.assistant.Assistant;
import com.phantom.medapp_backend.doctor.Doctor;
import com.phantom.medapp_backend.doctorschedule.DoctorSchedule;
import com.phantom.medapp_backend.doctorschedule.DoctorScheduleRepository;
import com.phantom.medapp_backend.patient.Patient;
import com.phantom.medapp_backend.support.IntegrationTestSupport;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AppointmentIntegrationTest extends IntegrationTestSupport {

    @Autowired
    private DoctorScheduleRepository doctorScheduleRepository;

    @Test
    void patientShouldBeAbleToCreateAppointment() throws Exception {

        createTestPatient(
                "appointment.patient@test.com",
                "Password123!"
        );

        Doctor doctor = createTestDoctor(
                "appointment.doctor@test.com",
                "Password123!"
        );

        Assistant assistant = createTestAssistant(
                "appointment.assistant@test.com",
                "Password123!"
        );

        String accessToken = loginAndGetAccessToken(
                "appointment.patient@test.com",
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
                "appointmentDate": "2026-08-25",
                                "startTime": "10:00",
                                "reason": "Routine consultation"
            }
                        """.formatted(doctor.getId(), assistant.getId());

        mockMvc.perform(
                post("/patient/appointments/create")
                        .header(
                                "Authorization",
                                "Bearer " + accessToken
                        )
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(appointmentRequest)
        )
                .andExpect(status().isCreated());
    }

    @Test
    void assistantShouldBeAbleToCreateAppointment() throws Exception {
        createTestAssistant(
                "appointment.assistant1@test.com",
                "Password123!"
        );
        // Create doctor
        Doctor doctor = createTestDoctor(
                "appointment.assistant.doctor@test.com",
                "Password123!"
        );

        // Create patient
        Patient patient = createTestPatient(
                "appointment.assistant.patient@test.com",
                "Password123!"
        );

        // Login as assistant
        String accessToken = loginAndGetAccessToken(
                "appointment.assistant1@test.com",
                "Password123!"
        );

        String appointmentRequest = """
        {
                                "doctor": {
                                        "id": "%s"
                                },
                                "patient": {
                                        "id": "%s"
                                },
                "appointmentDate": "2026-08-25",
                                "startTime": "10:00",
                                "reason": "Routine consultation"
            }
        """.formatted(
                doctor.getId(),
                patient.getId()
        );

        mockMvc.perform(
                post("/assistant/appointments/create")
                        .header(
                                "Authorization",
                                "Bearer " + accessToken
                        )
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(appointmentRequest)
        )
                .andExpect(status().isOk());
    }

    @Test
    void adminShouldBeAbleToCreateAppointment() throws Exception {

        createTestAdmin(
                "appointment.admin@test.com",
                "Password123!"
        );

        // Create assistant
        Assistant assistant = createTestAssistant(
                "appointment.admin.assistant@test.com",
                "Password123!"
        );

        // Create doctor
        Doctor doctor = createTestDoctor(
                "appointment.admin.doctor@test.com",
                "Password123!"
        );

        // Create patient
        Patient patient = createTestPatient(
                "appointment.admin.patient@test.com",
                "Password123!"
        );

        // Login as admin
        String accessToken = loginAndGetAccessToken(
                "appointment.admin@test.com",
                "Password123!"
        );

        String appointmentRequest = """
        {
                                "doctor": {
                                        "id": "%s"
                                },
                                "patient": {
                                        "id": "%s"
                                },
                                "assistant" : {
                                        "id": "%s"
                                },
                "appointmentDate": "2026-08-25",
                                "startTime": "10:00",
                                "reason": "Routine consultation"
            }
        """.formatted(
                doctor.getId(),
                patient.getId(),
                assistant.getId()
        );

        mockMvc.perform(
                post("/admin/create/appointment")
                        .header(
                                "Authorization",
                                "Bearer " + accessToken
                        )
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(appointmentRequest)
        )
                .andExpect(status().isOk());
    }

    @Test
    void adminShouldRejectOverlappingAppointmentSlot() throws Exception {
        createTestAdmin(
                "appointment.conflict.admin@test.com",
                "Password123!"
        );

        Doctor doctor = createTestDoctor(
                "appointment.conflict.doctor@test.com",
                "Password123!"
        );

        Assistant assistant = createTestAssistant(
                "appointment.conflict.assistant@test.com",
                "Password123!"
        );

        Patient patient = createTestPatient(
                "appointment.conflict.patient@test.com",
                "Password123!"
        );

        Patient existingPatient = createTestPatient(
                "appointment.conflict.existing.patient@test.com",
                "Password123!"
        );

        doctorScheduleRepository.save(
                DoctorSchedule.builder()
                        .doctor(doctor)
                        .dayOfWeek(LocalDate.of(2026, 8, 25).getDayOfWeek())
                        .startTime(LocalTime.of(9, 0))
                        .endTime(LocalTime.of(18, 0))
                        .build()
        );

        Appointment existingAppointment = createTestAppointment(
                existingPatient,
                doctor,
                assistant,
                LocalDate.of(2026, 8, 25),
                LocalTime.of(10, 0)
        );
        existingAppointment.setEndTime(LocalTime.of(10, 30));
        appointmentRepository.save(existingAppointment);

        String accessToken = loginAndGetAccessToken(
                "appointment.conflict.admin@test.com",
                "Password123!"
        );

        String appointmentRequest = """
            {
                "doctor": {"id": "%s"},
                "patient": {"id": "%s"},
                "assistant": {"id": "%s"},
                "appointmentDate": "2026-08-25",
                "startTime": "10:15",
                "reason": "Routine consultation"
            }
            """.formatted(
                doctor.getId(),
                patient.getId(),
                assistant.getId()
        );

        mockMvc.perform(
                post("/admin/create/appointment")
                        .header("Authorization", "Bearer " + accessToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(appointmentRequest)
        )
                .andExpect(status().isConflict());
    }

    @Test
    void forbiddenShouldNotBeAbleToCreateAppointment() throws Exception {

        Patient patient = createTestPatient(
                "appointment.forbidden.patient@test.com",
                "Password123!"
        );

        Doctor doctor = createTestDoctor(
                "appointment.forbidden.doctor@test.com",
                "Password123!"
        );

        Assistant assistant = createTestAssistant(
                "appointment.forbidden.assistant@test.com",
                "Password123!"
        );

        String accessToken = loginAndGetAccessToken(
                "appointment.forbidden.doctor@test.com",
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
                                "patient": {
                                        "id": "%s"
                                },
                "appointmentDate": "2026-08-25",
                                "startTime": "10:00",
                                "reason": "Routine consultation"
            }
                        """.formatted(doctor.getId(), assistant.getId(), patient.getId());

        mockMvc.perform(
                post("/patient/appointments/s/create")
                        .header(
                                "Authorization",
                                "Bearer " + accessToken
                        )
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(appointmentRequest)
        )
                .andExpect(status().isForbidden());
    }

    @Test
    void unauthenticatedUserShouldNotCreateAppointment() throws Exception {

        Patient patient = createTestPatient(
                "appointment.unauth.patient@test.com",
                "Password123!"
        );

        Doctor doctor = createTestDoctor(
                "appointment.unauth.doctor@test.com",
                "Password123!"
        );

        String appointmentRequest = """
        {
            "doctor": {"id" : "%s"},
            "patient": {"id" : "%s"},
            "appointmentDate": "2026-08-27",
            "startTime": "10:00"
        }
        """.formatted(
                doctor.getId(),
                patient.getId()
        );

        mockMvc.perform(
                post("/patient/appointments/s/create")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(appointmentRequest)
        )
                .andExpect(status().isUnauthorized());
    }

    @Test
    void patientShouldNotAccessAnotherPatientsAppointment() throws Exception {

        // Patient A
        createTestPatient(
                "appointment.owner@test.com",
                "Password123!"
        );

        // Patient B
        createTestPatient(
                "appointment.other@test.com",
                "Password123!"
        );

        //Assistant
        Assistant assistant = createTestAssistant(
                "appointment.security.assistant@test.com",
                "Password123!"
        );

        // Doctor
        Doctor doctor = createTestDoctor(
                "appointment.security.doctor@test.com",
                "Password123!"
        );

        // Login as Patient A
        String tokenA = loginAndGetAccessToken(
                "appointment.owner@test.com",
                "Password123!"
        );

        String tokenB = loginAndGetAccessToken(
                "appointment.other@test.com",
                "Password123!"
        );
        // Create an appointment belonging to Patient B
        String appointmentRequest = """
            {
                                "doctor": {
                                        "id": "%s"
                                },
                                "assistant": {
                                        "id": "%s"
                                },
                "appointmentDate": "2026-08-25",
                                "startTime": "10:00",
                                "reason": "Routine consultation"
            }
                        """.formatted(doctor.getId(), assistant.getId());
        var createAppointmentResult = mockMvc.perform(
                post("/patient/appointments/s/create")
                        .header(
                                "Authorization",
                                "Bearer " + tokenB
                        )
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(appointmentRequest)
        )
                .andExpect(status().isCreated())
                .andReturn();

        AppointmentResponse appointment = objectMapper.readValue(
                createAppointmentResult.getResponse().getContentAsString(),
                AppointmentResponse.class
        );

        mockMvc.perform(
                get("/patient/appointments/" + appointment.id())
                        .header(
                                "Authorization",
                                "Bearer " + tokenA
                        )
        )
                .andExpect(status().isNotFound());
    }

    @Test
    void shouldRejectAppointmentWithInvalidDoctorId() throws Exception {

        createTestPatient(
                "appointment.invalid.doctor.patient@test.com",
                "Password123!"
        );

        String token = loginAndGetAccessToken(
                "appointment.invalid.doctor.patient@test.com",
                "Password123!"
        );

        UUID nonExistentDoctorId = UUID.randomUUID();

        Assistant assistant = createTestAssistant(
                "appointment.invalid.doctor.assistant@test.com",
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
                "appointmentDate": "2026-08-25",
                                "startTime": "10:00",
                                "reason": "Routine consultation"
            }
        """.formatted(
                nonExistentDoctorId,
                assistant.getId()
        );

        mockMvc.perform(
                post("/patient/appointments/s/create")
                        .header(
                                "Authorization",
                                "Bearer " + token
                        )
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(request)
        )
                .andExpect(status().isNotFound());
    }

    @Test
    void shouldRejectInvalidAppointmentData() throws Exception {

        createTestPatient(
                "appointment.invalid.data@test.com",
                "Password123!"
        );

        String token = loginAndGetAccessToken(
                "appointment.invalid.data@test.com",
                "Password123!"
        );

        String request = """
        {
            "doctor": {
                                        "id": ""
                                },
                                "assistant": {
                                        "id": ""
                                },
            "appointmentDate": "",
            "startTime": ""
        }
        """;

        mockMvc.perform(
                post("/patient/appointments/s/create")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(request)
        )
                .andExpect(status().isBadRequest());
    }

    @Test
    void inactiveDoctorShouldNotBeAvailableForAppointments() throws Exception {

        createTestAdmin("inactive.doctor.admin@test.com", "Password123!");
        Patient patient = createTestPatient(
                "inactive.doctor.patient@test.com",
                "Password123!"
        );

        Doctor doctor = createTestDoctor(
                "inactive.doctor@test.com",
                "Password123!"
        );

        Assistant assistant = createTestAssistant(
                "inactive.doctor.assistant@test.com",
                "Password123!"
        );
        doctor.setActive(false);
        doctorRepository.save(doctor);
        String token = loginAndGetAccessToken(
                "inactive.doctor.admin@test.com",
                "Password123!"
        );
        String request = """
        {
                "doctor": {
                                        "id": "%s"
                                },
                "patient": {
                                        "id": "%s"
                                },
                                "assistant" : {
                                        "id": "%s"
                                        },
                "appointmentDate": "2026-08-25",
                "startTime": "10:00",
                "reason": "Routine consultation"
            }
        """.formatted(
                doctor.getId(),
                patient.getId(),
                assistant.getId()
        );

        mockMvc.perform(
                post("/admin/create/appointment")
                        .header(
                                "Authorization",
                                "Bearer " + token
                        )
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(request)
        )
                .andExpect(status().isNotFound());
    }

    /* still did not implement duplicated appointments check*/
    @Test
    void shouldRejectDuplicateAppointment() throws Exception {

        Patient patient = createTestPatient(
                "appointment.duplicate.patient@test.com",
                "Password123!"
        );

        Doctor doctor = createTestDoctor(
                "appointment.duplicate.doctor@test.com",
                "Password123!"
        );

        String token = loginAndGetAccessToken(
                "appointment.duplicate.patient@test.com",
                "Password123!"
        );

        String request = """
        {
            "doctorId": "%s",
            "patientId": "%s",
            "appointmentDate": "2026-08-27",
            "startTime": "10:00"
        }
        """.formatted(
                doctor.getId(),
                patient.getId()
        );

        mockMvc.perform(
                post("/appointments")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(request)
        )
                .andExpect(status().isOk());

        mockMvc.perform(
                post("/appointments")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(request)
        )
                .andExpect(status().isConflict());
    }

    @Test
    void patientShouldCancelOwnAppointment() throws Exception {

        Patient patient = createTestPatient(
                "cancel.patient@test.com",
                "Password123!"
        );

        Doctor doctor = createTestDoctor(
                "cancel.doctor@test.com",
                "Password123!"
        );

        Assistant assistant = createTestAssistant(
                "cancel.assistant@test.com",
                "Password123!"
        );
        String token = loginAndGetAccessToken(
                "cancel.patient@test.com",
                "Password123!"
        );

        Appointment appointment = createTestAppointment(
                patient,
                doctor,
                assistant,
                LocalDate.of(2026, 8, 27),
                LocalTime.of(10, 0)
        );

        String request = """
        {
            "cancelReason": "Not available for appointment"
        }
        """;

        mockMvc.perform(
                patch("/patient/appointments/" + appointment.getId() + "/cancel")
                        .header(
                                "Authorization",
                                "Bearer " + token
                        )
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(request)
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
    void patientShouldNotCancelAnotherPatientsAppointment() throws Exception {

        Patient owner = createTestPatient(
                "appointment.owner@test.com",
                "Password123!"
        );

        createTestPatient(
                "appointment.other@test.com",
                "Password123!"
        );

        Assistant assistant = createTestAssistant(
                "cancel.assistant@test.com",
                "Password123!"
        );

        Doctor doctor = createTestDoctor(
                "cancel.security.doctor@test.com",
                "Password123!"
        );

        Appointment appointment = createTestAppointment(
                owner,
                doctor,
                assistant,
                LocalDate.of(2026, 8, 27),
                LocalTime.of(10, 0)
        );

        String otherPatientToken = loginAndGetAccessToken(
                "appointment.other@test.com",
                "Password123!"
        );
        String request = """
        {
            "cancelReason": "Not available for appointment"
        }
        """;
        mockMvc.perform(
                patch("/patient/appointments/" + appointment.getId() + "/cancel")
                        .header(
                                "Authorization",
                                "Bearer " + otherPatientToken
                        )
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(request)
        )
                .andExpect(status().isNotFound());
    }

    @Test
    void patientShouldRescheduleOwnAppointment() throws Exception {

        Patient patient = createTestPatient(
                "reschedule.patient@test.com",
                "Password123!"
        );

        Doctor doctor = createTestDoctor(
                "reschedule.doctor@test.com",
                "Password123!"
        );

        Assistant assistant = createTestAssistant(
                "cancel.assistant@test.com",
                "Password123!"
        );

        String token = loginAndGetAccessToken(
                "reschedule.patient@test.com",
                "Password123!"
        );

        Appointment appointment = createTestAppointment(
                patient,
                doctor,
                assistant,
                LocalDate.of(2026, 8, 27),
                LocalTime.of(10, 0)
        );

        String request = """
        {
            "appointmentDate": "2026-08-28",
            "startTime": "14:00"
        }
        """;

        mockMvc.perform(
                patch("/patient/appointments/" + appointment.getId() + "/reschedule")
                        .header(
                                "Authorization",
                                "Bearer " + token
                        )
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(request)
        )
                .andExpect(status().isOk());
        Appointment updated
                = appointmentRepository
                        .findById(appointment.getId())
                        .orElseThrow();

        assertEquals(
                LocalDate.of(2026, 8, 28),
                updated.getAppointmentDate()
        );

        assertEquals(
                LocalTime.of(14, 0),
                updated.getStartTime()
        );
    }

    /* Endpoint not implemented yet */
    @Test
    void shouldRejectRescheduleToOccupiedTime() throws Exception {

        Patient patientA = createTestPatient(
                "reschedule.conflict.a@test.com",
                "Password123!"
        );

        Patient patientB = createTestPatient(
                "reschedule.conflict.b@test.com",
                "Password123!"
        );

        Doctor doctor = createTestDoctor(
                "reschedule.conflict.doctor@test.com",
                "Password123!"
        );

        Assistant assistant = createTestAssistant(
                "cancel.assistant@test.com",
                "Password123!"
        );

        Appointment appointmentA = createTestAppointment(
                patientA,
                doctor,
                assistant,
                LocalDate.of(2026, 8, 29),
                LocalTime.of(10, 0)
        );

        createTestAppointment(
                patientB,
                doctor,
                assistant,
                LocalDate.of(2026, 8, 29),
                LocalTime.of(14, 0)
        );

        String token = loginAndGetAccessToken(
                "reschedule.conflict.a@test.com",
                "Password123!"
        );

        String request = """
        {
            "appointmentDate": "2026-08-29",
            "startTime": "14:00"
        }
        """;

        mockMvc.perform(
                put("/appointments/" + appointmentA.getId() + "/reschedule")
                        .header(
                                "Authorization",
                                "Bearer " + token
                        )
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(request)
        )
                .andExpect(status().isConflict());
    }

    @Test
    void shouldPreventConcurrentDoubleBooking() throws Exception {

        String DEFAULT_PASSWORD = "Password123!";

        createTestPatient("patient111@test.com", DEFAULT_PASSWORD);
        createTestPatient("patient222@test.com", DEFAULT_PASSWORD);

        Doctor doctor111 = createTestDoctor("doctor111@test.com", DEFAULT_PASSWORD);
        Assistant assistant111 = createTestAssistant("assistant111@test.com", DEFAULT_PASSWORD);

        String token1 = loginAndGetAccessToken("patient111@test.com", DEFAULT_PASSWORD);
        String token2 = loginAndGetAccessToken("patient222@test.com", DEFAULT_PASSWORD);

        String appointmentRequest = """
            {
                "doctor": {
                    "id": "%s"
                },
                "assistant": {
                    "id": "%s"
                },
                "appointmentDate": "2026-09-25",
                "startTime": "10:00",
                "reason": "Routine consultation"
            }
            """.formatted(doctor111.getId(), assistant111.getId());

        int numberOfRequests = 2;
        ExecutorService executor = Executors.newFixedThreadPool(numberOfRequests);
        CyclicBarrier barrier = new CyclicBarrier(numberOfRequests);

        try {
            CompletableFuture<Integer> future1 = CompletableFuture.supplyAsync(() -> {
                try {
                    barrier.await(10, TimeUnit.SECONDS);
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    throw new RuntimeException(e);
                } catch (BrokenBarrierException | TimeoutException e) {
                    throw new RuntimeException(e);
                }

                try {
                    mockMvc.perform(
                            post("/patient/appointments/create")
                                    .header("Authorization", "Bearer " + token1)
                                    .contentType(MediaType.APPLICATION_JSON)
                                    .content(appointmentRequest)
                    );

                    return 200;
                } catch (Exception e) {
                    throw new RuntimeException(e);
                }
            }, executor);

            CompletableFuture<Integer> future2 = CompletableFuture.supplyAsync(() -> {
                try {
                    barrier.await(10, TimeUnit.SECONDS);
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    throw new RuntimeException(e);
                } catch (BrokenBarrierException | TimeoutException e) {
                    throw new RuntimeException(e);
                }

                try {
                    mockMvc.perform(
                            post("/patient/appointments/create")
                                    .header("Authorization", "Bearer " + token2)
                                    .contentType(MediaType.APPLICATION_JSON)
                                    .content(appointmentRequest)
                    );

                    return 200;
                } catch (Exception e) {
                    throw new RuntimeException(e);
                }
            }, executor);

            CompletableFuture.allOf(future1, future2).join();

            int status1 = future1.join();
            int status2 = future2.join();

            List<Integer> statuses = List.of(status1, status2);

            assertThat(
                    statuses.stream()
                            .filter(status -> status == 200 || status == 201)
                            .count()
                        ).isEqualTo(1);

            assertThat(
                    statuses.stream()
                            .filter(status -> status == 409)
                            .count()
            ).isEqualTo(1);

            List<Appointment> appointments
                    = appointmentRepository
                            .findByDoctorAndAppointmentDateAndStatusNot(
                                    doctor111,
                                    LocalDate.of(2026, 9, 25),
                                    AppointmentStatus.CANCELLED
                            );

            assertThat(appointments).hasSize(1);

        } finally {
            executor.shutdown();
        }
    }
}
