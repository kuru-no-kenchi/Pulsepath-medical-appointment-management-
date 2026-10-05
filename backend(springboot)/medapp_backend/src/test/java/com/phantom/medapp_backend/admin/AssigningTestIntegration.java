package com.phantom.medapp_backend.admin;

import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.context.ActiveProfiles;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.phantom.medapp_backend.assistant.Assistant;
import com.phantom.medapp_backend.doctor.Doctor;
import com.phantom.medapp_backend.notification.Notification;
import com.phantom.medapp_backend.support.IntegrationTestSupport;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class AssigningTestIntegration extends IntegrationTestSupport {

    @Test
    void adminShouldAssignAssistantToDoctor() throws Exception {

        createTestAdmin(
                "assignment.admin@test.com",
                "Password123!"
        );

        Doctor doctor = createTestDoctor(
                "assignment.doctor@test.com",
                "Password123!"
        );

        Assistant assistant = createTestAssistant(
                "assignment.assistant@test.com",
                "Password123!"
        );

        String token = loginAndGetAccessToken(
                "assignment.admin@test.com",
                "Password123!"
        );

        mockMvc.perform(
                post("/admin/assistants/" + assistant.getId() + "/doctors/" + doctor.getId())
                        .header(
                                "Authorization",
                                "Bearer " + token
                        )
        )
                .andExpect(status().isOk());
        List<Notification> assistantNotifications;
        assistantNotifications = notificationRepository.findByRecipientId(
                assistant.getUser().getId()
        );

        assertTrue(
                assistantNotifications.stream()
                        .anyMatch(n
                                -> {
                            return n.getMessage().contains("Dr");
                        }
                        )
        );
        List<Notification> doctorNotifications
                = notificationRepository.findByRecipientId(doctor.getUser().getId());

        assertTrue(
                doctorNotifications.stream()
                        .anyMatch(n
                                -> n.getMessage().contains("Assistant")
                        )
        );
    }

    @Test
    void unauthorizedUserShouldNotAssignAssistant() throws Exception {

        createTestPatient(
                "assignment.patient@test.com",
                "Password123!"
        );

        Doctor doctor = createTestDoctor(
                "assignment.unauthorized.doctor@test.com",
                "Password123!"
        );

        Assistant assistant = createTestAssistant(
                "assignment.unauthorized.assistant@test.com",
                "Password123!"
        );

        String token = loginAndGetAccessToken(
                "assignment.patient@test.com",
                "Password123!"
        );

        mockMvc.perform(
                post("/admin/assistants/" + assistant.getId() + "/doctors/" + doctor.getId())
                        .header(
                                "Authorization",
                                "Bearer " + token
                        )
        )
                .andExpect(status().isForbidden());
    }

    @Test
    void shouldRejectAssignmentWithInvalidAssistant() throws Exception {

        createTestAdmin(
                "assignment.invalid.assistant.admin@test.com",
                "Password123!"
        );

        Doctor doctor = createTestDoctor(
                "assignment.invalid.assistant.doctor@test.com",
                "Password123!"
        );

        String token = loginAndGetAccessToken(
                "assignment.invalid.assistant.admin@test.com",
                "Password123!"
        );

        mockMvc.perform(
                post("/admin/assistants/" + UUID.randomUUID() + "/doctors/" + doctor.getId())
                        .header(
                                "Authorization",
                                "Bearer " + token
                        )
        )
                .andExpect(status().isNotFound());
    }

    @Test
    void shouldRejectAssignmentWithInvalidDoctor() throws Exception {

        createTestAdmin(
                "assignment.invalid.doctor.admin@test.com",
                "Password123!"
        );

        Assistant assistant = createTestAssistant(
                "assignment.invalid.doctor.assistant@test.com",
                "Password123!"
        );

        String token = loginAndGetAccessToken(
                "assignment.invalid.doctor.admin@test.com",
                "Password123!"
        );

        mockMvc.perform(
                post("/admin/assistants/" + assistant.getId() + "/doctors/" + UUID.randomUUID())
                        .header(
                                "Authorization",
                                "Bearer " + token
                        )
        )
                .andExpect(status().isNotFound());
    }
}
