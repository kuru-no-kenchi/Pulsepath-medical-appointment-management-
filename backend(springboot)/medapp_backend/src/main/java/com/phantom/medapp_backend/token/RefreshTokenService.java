package com.phantom.medapp_backend.token;

import java.security.SecureRandom;
import java.time.Instant;
import java.util.Base64;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.phantom.medapp_backend.exception.InvalidRefreshTokenException;
import com.phantom.medapp_backend.user.User;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class RefreshTokenService {

    private final RefreshTokenRepository refreshTokenRepository;

    @Value("${jwt.refresh-expiration}")
    private long refreshExpiration;

    private final SecureRandom secureRandom = new SecureRandom();

    @Transactional
    public RefreshToken createRefreshToken(User user) {

        byte[] randomBytes = new byte[64];
        secureRandom.nextBytes(randomBytes);

        String token = Base64.getUrlEncoder()
                .withoutPadding()
                .encodeToString(randomBytes);

        RefreshToken refreshToken = new RefreshToken(
                token,
                user,
                Instant.now().plusMillis(refreshExpiration)
        );

        return refreshTokenRepository.save(refreshToken);
    }

    public RefreshToken validate(String token) {

                if (token == null || token.isBlank()) {
                        throw new InvalidRefreshTokenException("Refresh token is missing");
                }

        RefreshToken refreshToken
                = refreshTokenRepository.findByToken(token)
                        .orElseThrow(()
                                -> new InvalidRefreshTokenException(
                                "Invalid refresh token"
                        )
                        );

        if (refreshToken.isRevoked()) {
            throw new InvalidRefreshTokenException(
                    "Refresh token has been revoked"
            );
        }

        if (refreshToken.getExpiresAt()
                .isBefore(Instant.now())) {

            throw new InvalidRefreshTokenException(
                    "Refresh token has expired"
            );
        }

        return refreshToken;
    }

    @Transactional
    public void revoke(String token) {

                if (token == null || token.isBlank()) {
                        return;
                }

        refreshTokenRepository.findByToken(token)
                .ifPresent(refreshToken -> {
                    refreshToken.setRevoked(true);
                    refreshTokenRepository.save(refreshToken);
                });
    }

    @Transactional
    public RefreshToken rotateRefreshToken(String token) {

                if (token == null || token.isBlank()) {
                        throw new InvalidRefreshTokenException("Refresh token is missing");
                }

        RefreshToken oldToken = refreshTokenRepository
                .findByTokenForUpdate(token)
                .orElseThrow(()
                        -> new InvalidRefreshTokenException("Invalid refresh token")
                );

        if (oldToken.isRevoked()) {
                        // A revoked token being presented again indicates token theft/reuse.
                        // Revoke every active session for this user.
                        revokeAll(oldToken.getUser());
            throw new InvalidRefreshTokenException("Refresh token has been revoked");
        }

        if (oldToken.getExpiresAt().isBefore(Instant.now())) {
            throw new InvalidRefreshTokenException("Refresh token has expired");
        }
                // Revoke the old token before issuing its replacement.
        oldToken.setRevoked(true);

                RefreshToken newToken = new RefreshToken(
                                generateTokenValue(),
                                oldToken.getUser(),
                                Instant.now().plusMillis(refreshExpiration)
                );

        return refreshTokenRepository.save(newToken);
    }

        @Transactional
        public void revokeAll(User user) {
                refreshTokenRepository.findAllByUser(user).forEach(token -> token.setRevoked(true));
        }

        private String generateTokenValue() {
                byte[] randomBytes = new byte[64];
                secureRandom.nextBytes(randomBytes);
                return Base64.getUrlEncoder().withoutPadding().encodeToString(randomBytes);
        }
}
