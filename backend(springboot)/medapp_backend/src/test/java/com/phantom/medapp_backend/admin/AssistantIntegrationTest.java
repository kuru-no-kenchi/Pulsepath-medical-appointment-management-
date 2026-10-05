package com.phantom.medapp_backend.admin;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.phantom.medapp_backend.assistant.Assistant;
import com.phantom.medapp_backend.support.IntegrationTestSupport;
import com.phantom.medapp_backend.user.Role;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class AssistantIntegrationTest extends IntegrationTestSupport {

    @Test
    void adminShouldCreateAssistant() throws Exception {

        createTestAdmin(
                "assistant.admin@test.com",
                "Password123!"
        );

        String token = loginAndGetAccessToken(
                "assistant.admin@test.com",
                "Password123!"
        );

        String request = """
        {
            "firstName": "John",
            "lastName": "Doe",
            "email": "john.doe@test.com",
            "password": "Password123!",
            "phone": "0612345678"
        }
        """;

        mockMvc.perform(
                post("/admin/create/assistant")
                        .header(
                                "Authorization",
                                "Bearer " + token
                        )
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(request)
        )
                .andExpect(status().isCreated());
    }

    @Test
    void adminShouldUpdateAssistant() throws Exception {

        createTestUser(
                "assistant.update.admin@test.com",
                "Password123!",
                Role.ADMIN
        );

        Assistant assistant = createTestAssistant(
                "assistant.update@test.com",
                "Password123!"
        );

        String token = loginAndGetAccessToken(
                "assistant.update.admin@test.com",
                "Password123!"
        );

        String request = """
        {
            "firstName": "Updated",
            "lastName": "Assistant",
            "email": "assistant.update@test.com",
            "phone": "0699999999"
        }
        """;

        mockMvc.perform(
                patch("/admin/update/assistant/" + assistant.getId())
                        .header(
                                "Authorization",
                                "Bearer " + token
                        )
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(request)
        )
                .andExpect(status().isOk());

        Assistant updated = assistantRepository
                .findById(assistant.getId())
                .orElseThrow();

        assertEquals("Updated", updated.getUser().getFirstName());
        assertEquals("Assistant", updated.getUser().getLastName());
        assertEquals("0699999999", updated.getUser().getPhone());
    }

    @Test
    void adminShouldDeactivateAssistant() throws Exception {

        createTestAdmin(
                "assistant.deactivate.admin@test.com",
                "Password123!"
        );

        Assistant assistant = createTestAssistant(
                "assistant.deactivate@test.com",
                "Password123!"
        );

        assertTrue(assistant.isActive());

        String token = loginAndGetAccessToken(
                "assistant.deactivate.admin@test.com",
                "Password123!"
        );

        mockMvc.perform(
                delete("/admin/delete/assistant/" + assistant.getId())
                        .header(
                                "Authorization",
                                "Bearer " + token
                        )
        )
                .andExpect(status().isOk());

        Assistant deactivated = assistantRepository
                .findById(assistant.getId())
                .orElseThrow();

        assertFalse(deactivated.isActive());
    }

    @Test
    void adminShouldRetrieveAssistant() throws Exception {

        createTestAdmin(
                "assistant.retrieve.admin@test.com",
                "Password123!"
        );

        Assistant assistant = createTestAssistant(
                "assistant.retrieve@test.com",
                "Password123!"
        );

        String token = loginAndGetAccessToken(
                "assistant.retrieve.admin@test.com",
                "Password123!"
        );

        mockMvc.perform(
                get("/admin/assistant/" + assistant.getId())
                        .header(
                                "Authorization",
                                "Bearer " + token
                        )
        )
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(assistant.getId().toString()));
    }

    @Test
    void unauthorizedRoleCannotManageAssistants() throws Exception {

        createTestPatient(
                "assistant.unauthorized.patient@test.com",
                "Password123!"
        );

        String token = loginAndGetAccessToken(
                "assistant.unauthorized.patient@test.com",
                "Password123!"
        );

        mockMvc.perform(
                post("/admin/create/assistant")
                        .header(
                                "Authorization",
                                "Bearer " + token
                        )
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}")
        )
                .andExpect(status().isForbidden());
    }

    @Test
    void userCannotManipulateUnauthorizedAssistantResource() throws Exception {

        createTestAssistant(
                "assistant.resource.target@test.com",
                "Password123!"
        );

        createTestAssistant(
                "assistant.resource.actor@test.com",
                "Password123!"
        );

        String token = loginAndGetAccessToken(
                "assistant.resource.actor@test.com",
                "Password123!"
        );

        Assistant target = assistantRepository
                .findByUserEmail("assistant.resource.target@test.com")
                .orElseThrow();

        mockMvc.perform(
                patch("/admin/update/assistant/" + target.getId())
                        .header(
                                "Authorization",
                                "Bearer " + token
                        )
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}")
        )
                .andExpect(status().isForbidden());
    }

    @Test
    void invalidAssistantIdReturnsNotFound() throws Exception {

        createTestAdmin(
                "assistant.invalid-id.admin@test.com",
                "Password123!"
        );

        String token = loginAndGetAccessToken(
                "assistant.invalid-id.admin@test.com",
                "Password123!"
        );

        mockMvc.perform(
                get("/admin/assistant/" + UUID.randomUUID())
                        .header(
                                "Authorization",
                                "Bearer " + token
                        )
        )
                .andExpect(status().isNotFound());
    }

    @Test
    void invalidUpdateDataReturnsBadRequest() throws Exception {

        createTestAdmin(
                "assistant.invalid-data.admin@test.com",
                "Password123!"
        );

        Assistant assistant = createTestAssistant(
                "assistant.invalid-data@test.com",
                "Password123!"
        );

        String token = loginAndGetAccessToken(
                "assistant.invalid-data.admin@test.com",
                "Password123!"
        );
        mockMvc.perform(
                patch("/admin/update/assistant/" + assistant.getId())
                        .header(
                                "Authorization",
                                "Bearer " + token
                        )
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}")
        )
                .andExpect(status().isBadRequest());
    }

}
