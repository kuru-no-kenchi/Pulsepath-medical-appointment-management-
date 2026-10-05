package com.phantom.medapp_backend.support;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.concurrent.ThreadLocalRandom;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;

import com.phantom.medapp_backend.appointment.Appointment;
import com.phantom.medapp_backend.appointment.AppointmentStatus;
import com.phantom.medapp_backend.appointment.AppointmentRepository;
import com.phantom.medapp_backend.assistant.Assistant;
import com.phantom.medapp_backend.assistant.AssistantRepository;
import com.phantom.medapp_backend.auditlog.AuditLogRepository;
import com.phantom.medapp_backend.auth.dto.AuthResponse;
import com.phantom.medapp_backend.doctor.Doctor;
import com.phantom.medapp_backend.doctor.DoctorRepository;
import com.phantom.medapp_backend.notification.NotificationRepository;
import com.phantom.medapp_backend.patient.Patient;
import com.phantom.medapp_backend.patient.PatientRepository;
import com.phantom.medapp_backend.user.Role;
import com.phantom.medapp_backend.user.User;
import com.phantom.medapp_backend.user.UserRepository;

public class IntegrationTestSupport {

    @Autowired
    protected MockMvc mockMvc;

    @Autowired
    protected UserRepository userRepository;

    @Autowired
    protected PatientRepository patientRepository;

    @Autowired
    protected DoctorRepository doctorRepository;

    @Autowired
    protected AssistantRepository assistantRepository;

    @Autowired
    protected PasswordEncoder passwordEncoder;

    @Autowired
    protected ObjectMapper objectMapper;

    @Autowired
    protected AppointmentRepository appointmentRepository;

    @Autowired
    protected NotificationRepository notificationRepository;

    @Autowired
    protected AuditLogRepository auditLogRepository;

    private String generateUniquePhone() {
        String phone;

        do {
            String prefix = ThreadLocalRandom.current().nextBoolean()
                    ? "06"
                    : "07";
            int suffix = ThreadLocalRandom.current().nextInt(100_000_000);
            phone = prefix + String.format("%08d", suffix);
        } while (userRepository.existsByPhone(phone));

        return phone;
    }

    protected User createTestUser(
            String email,
            String password,
            Role role
    ) {

        User user = new User();

        user.setFirstName("Test");
        user.setLastName("User");
        user.setEmail(email);
        user.setPhone(generateUniquePhone());

        user.setPassword(
                passwordEncoder.encode(password)
        );

        user.setRole(role);

        return userRepository.save(user);
    }

    protected User createTestAdmin(String email, String password) {
        User admin = createTestUser(
                email,
                password,
                Role.ADMIN
        );
        return userRepository.save(admin);
    }

    protected Patient createTestPatient(
            String email,
            String password
    ) {

        User user = createTestUser(
                email,
                password,
                Role.PATIENT
        );

        Patient patient = new Patient();

        patient.setUser(user);

        return patientRepository.save(patient);
    }

    protected Doctor createTestDoctor(
            String email,
            String password
    ) {

        User user = createTestUser(
                email,
                password,
                Role.DOCTOR
        );

        Doctor doctor = new Doctor();

        doctor.setUser(user);

        return doctorRepository.save(doctor);
    }

    protected Assistant createTestAssistant(
            String email,
            String password
    ) {

        User user = createTestUser(
                email,
                password,
                Role.ASSISTANT
        );

        Assistant assistant = new Assistant();

        assistant.setUser(user);

        return assistantRepository.save(assistant);
    }

    protected String loginAndGetAccessToken(
            String email,
            String password
    ) throws Exception {

        String requestBody = """
        {
            "email": "%s",
            "password": "%s"
        }
        """.formatted(email, password);

        MvcResult result = mockMvc.perform(
                post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody)
        )
                .andExpect(status().isOk())
                .andReturn();

        String responseBody
                = result.getResponse()
                        .getContentAsString();

        AuthResponse authResponse
                = objectMapper.readValue(
                        responseBody,
                        AuthResponse.class
                );

        return authResponse.token();
    }

    protected Appointment createTestAppointment(
            Patient patient,
            Doctor doctor,
            Assistant assistant,
            LocalDate appointmentDate,
            LocalTime startTime
    ) {
        Appointment appointment = new Appointment();

        appointment.setPatient(patient);
        appointment.setDoctor(doctor);
        appointment.setAssistant(assistant);
        appointment.setAppointmentDate(appointmentDate);
        appointment.setStartTime(startTime);
        appointment.setEndTime(startTime.plusMinutes(doctor.getConsultationDuration()));
        appointment.setReason("Regular Consultation");
        appointment.setStatus(AppointmentStatus.CONFIRMED);

        return appointmentRepository.save(appointment);
    }
}
