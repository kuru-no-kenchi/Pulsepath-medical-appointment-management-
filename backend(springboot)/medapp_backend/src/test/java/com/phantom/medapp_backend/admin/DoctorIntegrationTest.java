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

import com.phantom.medapp_backend.doctor.Doctor;
import com.phantom.medapp_backend.support.IntegrationTestSupport;
import com.phantom.medapp_backend.user.Role;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class DoctorIntegrationTest extends IntegrationTestSupport {

    @Test
    void adminShouldCreateDoctor() throws Exception {

        createTestUser(
                "doctor.admin@test.com",
                "Password123!",
                Role.ADMIN
        );

        String token = loginAndGetAccessToken(
                "doctor.admin@test.com",
                "Password123!"
        );

        String request = """
        {
            "firstName": "John",
            "lastName": "Doe",
            "email": "john.doe@test.com",
            "password": "Password123!",
            "phone": "0612345678",
            "specialty": "Cardiology",
            "experienceYears": 5,
            "bio": "Test doctor",
            "consultationDuration": 30
        }
        """;

        mockMvc.perform(
                post("/admin/create/doctor")
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
    void adminShouldUpdateDoctor() throws Exception {

        createTestUser(
                "doctor.update.admin@test.com",
                "Password123!",
                Role.ADMIN
        );

        Doctor doctor = createTestDoctor(
                "doctor.update@test.com",
                "Password123!"
        );

        String token = loginAndGetAccessToken(
                "doctor.update.admin@test.com",
                "Password123!"
        );

        String request = """
        {
            "firstName": "Updated",
            "lastName": "Doctor",
            "email": "doctor.update@test.com",
            "phone": "0699999999",
            "specialty": "Neurology",
            "experienceYears": 10,
            "bio": "Updated biography",
            "consultationDuration": 45
        }
        """;

        mockMvc.perform(
                patch("/admin/update/doctor/" + doctor.getId())
                        .header(
                                "Authorization",
                                "Bearer " + token
                        )
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(request)
        )
                .andExpect(status().isOk());

        Doctor updated = doctorRepository
                .findById(doctor.getId())
                .orElseThrow();

        assertEquals("Neurology", updated.getSpecialty());
        assertEquals(10, updated.getExperienceYears());
        assertEquals(45, updated.getConsultationDuration());
    }

    @Test
    void adminShouldDeactivateDoctor() throws Exception {

        createTestAdmin(
                "doctor.deactivate.admin@test.com",
                "Password123!"
        );

        Doctor doctor = createTestDoctor(
                "doctor.deactivate@test.com",
                "Password123!"
        );

        assertTrue(doctor.isActive());

        String token = loginAndGetAccessToken(
                "doctor.deactivate.admin@test.com",
                "Password123!"
        );

        mockMvc.perform(
                delete("/admin/delete/doctor/" + doctor.getId())
                        .header(
                                "Authorization",
                                "Bearer " + token
                        )
        )
                .andExpect(status().isOk());

        Doctor deactivated = doctorRepository
                .findById(doctor.getId())
                .orElseThrow();

        assertFalse(deactivated.isActive());
    }

    @Test
    void adminShouldRetrieveDoctor() throws Exception {

        createTestAdmin(
                "doctor.retrieve.admin@test.com",
                "Password123!"
        );

        Doctor doctor = createTestDoctor(
                "doctor.retrieve@test.com",
                "Password123!"
        );

        String token = loginAndGetAccessToken(
                "doctor.retrieve.admin@test.com",
                "Password123!"
        );

        mockMvc.perform(
                get("/admin/doctor/" + doctor.getId())
                        .header(
                                "Authorization",
                                "Bearer " + token
                        )
        )
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(doctor.getId().toString()));
    }

    @Test
    void unauthorizedRoleCannotManageDoctors() throws Exception {

        createTestPatient(
                "doctor.unauthorized.patient@test.com",
                "Password123!"
        );

        String token = loginAndGetAccessToken(
                "doctor.unauthorized.patient@test.com",
                "Password123!"
        );

        mockMvc.perform(
                post("/admin/create/doctor")
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
    void userCannotManipulateUnauthorizedDoctorResource() throws Exception {

        createTestDoctor(
                "doctor.resource.target@test.com",
                "Password123!"
        );

        createTestDoctor(
                "doctor.resource.actor@test.com",
                "Password123!"
        );

        String token = loginAndGetAccessToken(
                "doctor.resource.actor@test.com",
                "Password123!"
        );

        Doctor target = doctorRepository
                .findByUserEmail("doctor.resource.target@test.com")
                .orElseThrow();

        mockMvc.perform(
                patch("/admin/update/doctor/" + target.getId())
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
    void invalidDoctorIdReturnsNotFound() throws Exception {

        createTestAdmin(
                "doctor.invalid-id.admin@test.com",
                "Password123!"
        );

        String token = loginAndGetAccessToken(
                "doctor.invalid-id.admin@test.com",
                "Password123!"
        );

        mockMvc.perform(
                get("/admin/doctor/" + UUID.randomUUID())
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
                "doctor.invalid-data.admin@test.com",
                "Password123!"
        );

        Doctor doctor = createTestDoctor(
                "doctor.invalid-data@test.com",
                "Password123!"
        );

        String token = loginAndGetAccessToken(
                "doctor.invalid-data.admin@test.com",
                "Password123!"
        );
        mockMvc.perform(
                patch("/admin/update/doctor/" + doctor.getId())
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
