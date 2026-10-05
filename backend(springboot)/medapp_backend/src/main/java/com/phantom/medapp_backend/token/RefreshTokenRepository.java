package com.phantom.medapp_backend.token;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;

import jakarta.persistence.LockModeType;

import com.phantom.medapp_backend.user.User;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, UUID> {

    Optional<RefreshToken> findByToken(String token);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @org.springframework.data.jpa.repository.Query("select token from RefreshToken token where token.token = :value")
    Optional<RefreshToken> findByTokenForUpdate(@org.springframework.data.repository.query.Param("value") String value);

    java.util.List<RefreshToken> findAllByUser(User user);

    void deleteByUser(User user);
}
