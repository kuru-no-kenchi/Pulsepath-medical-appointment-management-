package com.phantom.medapp_backend.auth;

import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.phantom.medapp_backend.auth.dto.AuthResponse;
import com.phantom.medapp_backend.user.UserService;
import com.phantom.medapp_backend.user.dto.ResetPasswordRequest;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@Tag(name = "Authentification APIs")
@SecurityRequirement(name = "bearerAuth")
@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final UserService userService;

    @Operation(
            summary = "Register a new user",
            description = """
            Creates a new user account in the system.

            Available roles:
            - PATIENT (self-registration)
            
            The system validates:
            - Unique email address
            - Required fields
            - Password format

            After successful registration, the user can authenticate using the login endpoint.
            """
    )
    @PostMapping("register")
    public ResponseEntity<Void> register(@Valid @RequestBody RegisterRequest request) {
        authService.register(request);
        return ResponseEntity.noContent().build();
    }

    @Operation(
            summary = "Authenticate user",
            description = """
            Authenticates a user using email and password.

            Returns a JWT access token that must be used
            in the Authorization header for protected endpoints.

            Example:
            Authorization: Bearer <jwt-token>
            """
    )
    @PostMapping("login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletRequest request, HttpServletResponse response) {

        authService.logout(request);

        ResponseCookie cookie = AuthService.clearRefreshCookie();

        response.addHeader(
                HttpHeaders.SET_COOKIE,
                cookie.toString()
        );

        return ResponseEntity.ok().build();
    }

    @PostMapping("/reset-password")
    public ResponseEntity<Void> resetPassword(
            @Valid @RequestBody ResetPasswordRequest request
    ) {
        userService.resetPassword(request);
        return ResponseEntity.ok(null);
    }
}
