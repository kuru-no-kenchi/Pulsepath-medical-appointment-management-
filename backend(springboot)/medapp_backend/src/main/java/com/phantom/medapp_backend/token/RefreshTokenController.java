package com.phantom.medapp_backend.token;

import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.phantom.medapp_backend.auth.AuthService;
import com.phantom.medapp_backend.auth.dto.AuthResponse;
import com.phantom.medapp_backend.config.JwtService;
import com.phantom.medapp_backend.user.User;

import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

@Tag(name = "Token",
        description = "Endpoints that handle token expiration and refresh"
)
@RestController
@RequestMapping("token")
@RequiredArgsConstructor
public class RefreshTokenController {

    private final RefreshTokenService refreshTokenService;
    private final JwtService jwtService;
    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refresh(
            HttpServletRequest request,
            HttpServletResponse response
    ) {

        String oldRefreshToken
                = AuthService.extractRefreshToken(request);

        RefreshToken newRefreshToken
                = refreshTokenService.rotateRefreshToken(
                        oldRefreshToken
                );

        User user = newRefreshToken.getUser();

        String newAccessToken
                = jwtService.generateToken(user);

        ResponseCookie cookie = AuthService.createRefreshCookie(newRefreshToken.getToken());

        response.addHeader(
                HttpHeaders.SET_COOKIE,
                cookie.toString()
        );

        return ResponseEntity.ok(
                new AuthResponse(
                        newAccessToken,
                        user.getEmail(),
                        user.getRole().name(),
                        user.getFirstName(),
                        user.getLastName()
                )
        );
    }
}
