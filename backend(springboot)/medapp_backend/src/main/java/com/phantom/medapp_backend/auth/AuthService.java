package com.phantom.medapp_backend.auth;

import java.time.Duration;

import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.phantom.medapp_backend.auditlog.AuditLogAction;
import com.phantom.medapp_backend.auditlog.AuditLogService;
import com.phantom.medapp_backend.auth.dto.AuthResponse;
import com.phantom.medapp_backend.config.JwtService;
import com.phantom.medapp_backend.exception.MissingCredentialsException;
import com.phantom.medapp_backend.exception.UserNotFoundException;
import com.phantom.medapp_backend.exception.WrongPasswordException;
import com.phantom.medapp_backend.patient.Patient;
import com.phantom.medapp_backend.patient.PatientRepository;
import com.phantom.medapp_backend.token.RefreshToken;
import com.phantom.medapp_backend.token.RefreshTokenService;
import com.phantom.medapp_backend.user.Role;
import com.phantom.medapp_backend.user.User;
import com.phantom.medapp_backend.user.UserRepository;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final PatientRepository patientRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final RefreshTokenService refreshTokenService;
    private final AuditLogService auditLogService;

    public void register(RegisterRequest request) {
        if (request.email == null || request.password == null) {
            throw new MissingCredentialsException("Credentials are missing");
        }
        if (userRepository.existsByEmail(request.email)) {
            throw new RuntimeException("Email already exists");
        }
        User user = User.builder().firstName(request.firstName).lastName(request.lastName).email(request.email)
                .password(passwordEncoder.encode(request.password)).phone(request.phone).role(Role.PATIENT).build();

        userRepository.save(user);
        Patient patient = Patient.builder().user(user).build();
        patientRepository.save(patient);
        auditLogService.log(
                user,
                AuditLogAction.REGISTER,
                "USER",
                user.getId(),
                user.getFullName() + "has registered for the first time to this application"
        );
    }

    public ResponseEntity<AuthResponse> login(LoginRequest request) {
        if (request.email == null || request.password == null) {
            throw new MissingCredentialsException("Credentials are missing");
        }
        User user = userRepository.findUserByEmail(request.email)
                .orElseThrow(() -> new UserNotFoundException("User not found"));
        if (!passwordEncoder.matches(request.password, user.getPassword())) {
            throw new WrongPasswordException("Email or password are not correct");
        }
        String accessToken = jwtService.generateToken(user);

        RefreshToken refreshToken
                = refreshTokenService.createRefreshToken(user);
        ResponseCookie cookie = createRefreshCookie(refreshToken.getToken());
        auditLogService.log(
                user,
                AuditLogAction.LOGIN,
                "USER",
                user.getId(),
                user.getFullName() + "loged in"
        );
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(
                        new AuthResponse(
                                accessToken,
                                user.getEmail(),
                                user.getRole().name(),
                                user.getFirstName(),
                                user.getLastName()
                        )
                );
    }

    @Transactional
    public void logout(HttpServletRequest request) {

        String refreshToken = extractRefreshToken(request);

        if (refreshToken != null) {

            refreshTokenService.revoke(refreshToken);
        }
    }

    public static String extractRefreshToken(HttpServletRequest request) {
        if (request.getCookies() == null) {
            return null;
        }
        for (var cookie : request.getCookies()) {
            if ("refreshToken".equals(cookie.getName())
                    && cookie.getValue() != null
                    && !cookie.getValue().isBlank()) {
                return cookie.getValue();
            }
        }
        return null;
    }

    public static ResponseCookie createRefreshCookie(String token) {
        return ResponseCookie.from("refreshToken", token)
                .httpOnly(true)
                .secure(false) // Set true when running behind HTTPS.
                .sameSite("Lax")
                .path("/")
                .maxAge(Duration.ofDays(7))
                .build();
    }

    public static ResponseCookie clearRefreshCookie() {
        return ResponseCookie.from("refreshToken", "")
                .httpOnly(true)
                .secure(false)
                .sameSite("Lax")
                .path("/")
                .maxAge(Duration.ZERO)
                .build();
    }
}
