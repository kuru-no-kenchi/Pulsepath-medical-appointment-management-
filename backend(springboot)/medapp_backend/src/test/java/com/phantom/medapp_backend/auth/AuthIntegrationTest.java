package com.phantom.medapp_backend.auth;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.cookie;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.phantom.medapp_backend.auth.dto.AuthResponse;
import com.phantom.medapp_backend.user.Role;
import com.phantom.medapp_backend.user.User;
import com.phantom.medapp_backend.user.UserRepository;

import jakarta.servlet.http.Cookie;

@ActiveProfiles("test")
@SpringBootTest
@AutoConfigureMockMvc
class AuthIntegrationTest {

    @Autowired
    private MockMvc mockMvc;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    
    
    @Autowired
    private ObjectMapper objectMapper;

   /*  @BeforeEach
    void setUp() {
        userRepository.deleteAll();
    } */

    @Test
    void shouldLoginSuccessfully() throws Exception {
        User user = new User();

        user.setFirstName("Test");
        user.setLastName("Admin");
        user.setEmail("test.admin@medapp.com");
        user.setPhone("0600000000");

        user.setPassword(
                passwordEncoder.encode("Password123!")
        );

        user.setRole(Role.ADMIN);

        userRepository.save(user);
        String requestBody = """
                {
                    "email":"test.admin@medapp.com",
                    "password":"Password123!"
                }
                """;
        mockMvc.perform(
                post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody)
        )
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").exists())
                .andExpect(jsonPath("$.role").value("ADMIN"))
                .andExpect(cookie().exists("refreshToken"));
    }
    
    @Test
    void shouldRejectLoginWithWrongPassword() throws Exception {

        User user = new User();

        user.setFirstName("Test");
        user.setLastName("Admin");
        user.setEmail("wrong-password@test.com");
        user.setPhone("0600000001");
        user.setPassword(
                passwordEncoder.encode("Password123!")
        );
        user.setRole(Role.ADMIN);

        userRepository.save(user);

        String requestBody = """
        {
            "email": "wrong-password@test.com",
            "password": "WrongPassword!"
        }
        """;

        mockMvc.perform(
                post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody)
        )
                .andExpect(status().isUnauthorized());
    }


    @Test
    void shouldRejectUnknownEmail() throws Exception {

        String requestBody = """
        {
            "email": "does-not-exist@test.com",
            "password": "Password123!"
        }
        """;

        mockMvc.perform(
                post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody)
        )
                .andExpect(status().isNotFound());
    }

    @Test
    void shouldRejectMissingCredentials() throws Exception {

        String requestBody = """
        {
        }
        """;

        mockMvc.perform(
                post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody)
        )
                .andExpect(status().isBadRequest());
    }

    @Test
    void shouldRotateRefreshToken() throws Exception {

        // 1. Create test user
        User user = new User();

        user.setFirstName("Test");
        user.setLastName("Admin");
        user.setEmail("rotation@test.com");
        user.setPhone("0600000002");
        user.setPassword(
                passwordEncoder.encode("Password123!")
        );
        user.setRole(Role.ADMIN);

        userRepository.save(user);

        // 2. Login
        String loginRequest = """
        {
            "email": "rotation@test.com",
            "password": "Password123!"
        }
        """;

        MvcResult loginResult = mockMvc.perform(
                post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(loginRequest)
        )
                .andExpect(status().isOk())
                .andReturn();

        // 3. Get Refresh A
        Cookie refreshA
                = loginResult.getResponse()
                        .getCookie("refreshToken");

        assertNotNull(refreshA);

        // 4. Refresh → Refresh B
        MvcResult refreshResult = mockMvc.perform(
                post("/token/refresh")
                        .cookie(refreshA)
        )
                .andExpect(status().isOk())
                .andReturn();

        Cookie refreshB
                = refreshResult.getResponse()
                        .getCookie("refreshToken");

        assertNotNull(refreshB);

        // 5. Refresh A must now fail
        mockMvc.perform(
                post("/token/refresh")
                        .cookie(refreshA)
        )
                .andExpect(status().isUnauthorized());

        // 6. Refresh B must work
        mockMvc.perform(
                post("/token/refresh")
                        .cookie(refreshB)
        )
                .andExpect(status().isOk());
    }

    @Test
    void shouldRevokeRefreshTokenOnLogout() throws Exception {

        // Create user
        User user = new User();

        user.setFirstName("Test");
        user.setLastName("Logout");
        user.setEmail("logout@test.com");
        user.setPhone("0600000003");
        user.setPassword(
                passwordEncoder.encode("Password123!")
        );
        user.setRole(Role.ADMIN);

        userRepository.save(user);

        // Login
        String loginRequest = """
        {
            "email": "logout@test.com",
            "password": "Password123!"
        }
        """;

        MvcResult loginResult = mockMvc.perform(
                post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(loginRequest)
        )
                .andExpect(status().isOk())
                .andReturn();

        Cookie refreshToken
                = loginResult.getResponse()
                        .getCookie("refreshToken");

        assertNotNull(refreshToken);

        // Logout
        mockMvc.perform(
                post("/auth/logout")
                        .cookie(refreshToken)
        )
                .andExpect(status().isOk());

        // Refresh should now fail
        mockMvc.perform(
                post("/token/refresh")
                        .cookie(refreshToken)
        )
                .andExpect(status().isUnauthorized());
    }

    @Test
    void shouldRejectUnauthenticatedRequest() throws Exception {

        mockMvc.perform(
                get("/users/me")
        )
                .andExpect(status().isUnauthorized());
    }

    @Test
    void shouldAllowAuthentictedUser() throws Exception {

        // Create user
        User user = new User();

        user.setFirstName("Authenticated");
        user.setLastName("User");
        user.setEmail("authenticated.user@test.com");
        user.setPhone("0600000004");
        user.setPassword(
                passwordEncoder.encode("Password123!")
        );
        user.setRole(Role.ADMIN);

        userRepository.save(user);

        // Login
        String loginRequest = """
        {
            "email": "authenticated.user@test.com",
            "password": "Password123!"
        }
        """;

        MvcResult loginResult = mockMvc.perform(
                post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(loginRequest)
        )
                .andExpect(status().isOk())
                .andReturn();
        String responseBody = loginResult.getResponse().getContentAsString();
        AuthResponse authResponse
                = objectMapper.readValue(
                        responseBody,
                        AuthResponse.class
                );
        String accessToken = authResponse.token();
        mockMvc.perform(
                get("/users/me")
                        .header(
                                "Authorization",
                                "Bearer " + accessToken
                        )
        )
                .andExpect(status().isOk());
    }
}
