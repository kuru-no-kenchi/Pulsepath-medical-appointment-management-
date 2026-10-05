package com.phantom.medapp_backend.user;

import static org.junit.jupiter.api.Assertions.assertEquals;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.phantom.medapp_backend.patient.Patient;
import com.phantom.medapp_backend.support.IntegrationTestSupport;

@AutoConfigureMockMvc
@SpringBootTest
@ActiveProfiles("test")
public class UserIntegrationTest extends IntegrationTestSupport {

    @Test
    void shouldReturnAuthenticatedUser() throws Exception {

        createTestPatient(
                "me@test.com",
                "Password123!"
        );

        String token = loginAndGetAccessToken(
                "me@test.com",
                "Password123!"
        );

        mockMvc.perform(
                get("/users/me")
                        .header(
                                "Authorization",
                                "Bearer " + token
                        )
        )
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("me@test.com"))
                .andExpect(jsonPath("$.role").value("PATIENT"));
    }

    @Test
    void shouldRejectUnauthenticatedUserFromMeEndpoint() throws Exception {

        mockMvc.perform(
                get("/users/me")
        )
                .andExpect(status().isUnauthorized());
    }

    @Test
    void userShouldUpdateOwnProfile() throws Exception {

        Patient patient = createTestPatient(
                "profile@test.com",
                "Password123!"
        );

        String token = loginAndGetAccessToken(
                "profile@test.com",
                "Password123!"
        );

        String request = """
        {
            "phone": "0699999999"
        }
        """;

        mockMvc.perform(
                patch("/patient/update/profile")
                        .header(
                                "Authorization",
                                "Bearer " + token
                        )
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(request)
        )
                .andExpect(status().isOk());

        User updated = userRepository
                .findById(patient.getUser().getId())
                .orElseThrow();
        assertEquals("0699999999", updated.getPhone());
    }

    @Test
    void shouldRejectInvalidProfileUpdate() throws Exception {

        createTestPatient(
                "invalid.profile@test.com",
                "Password123!"
        );

        String token = loginAndGetAccessToken(
                "invalid.profile@test.com",
                "Password123!"
        );

        String request = """
        {
            "firstName": "",
            "lastName": "Patient",
            "phone": "0699999999"
        }
        """;

        mockMvc.perform(
                patch("/patient/update/profile")
                        .header(
                                "Authorization",
                                "Bearer " + token
                        )
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(request)
        )
                .andExpect(status().isBadRequest());
    }

    @Test
    void shouldResetPasswordSuccessfully() throws Exception {

        createTestPatient(
                "password@test.com",
                "OldPassword123!"
        );

        String request = """
        {
            "email": "password@test.com",
            "newPassword": "NewPassword123!"
        }
        """;

        mockMvc.perform(
                post("/auth/reset-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(request)
        )
                .andExpect(status().isOk());

        // Old password should no longer work
        mockMvc.perform(
                post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                        {
                            "email": "password@test.com",
                            "password": "OldPassword123!"
                        }
                    """)
        )
                .andExpect(status().isUnauthorized());

        // New password should work
        mockMvc.perform(
                post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                        {
                            "email": "password@test.com",
                            "password": "NewPassword123!"
                        }
                    """)
        )
                .andExpect(status().isOk());
    }
}
