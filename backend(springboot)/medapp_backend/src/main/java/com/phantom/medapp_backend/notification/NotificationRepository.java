package com.phantom.medapp_backend.notification;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

public interface NotificationRepository
        extends JpaRepository<Notification, UUID> {

    List<Notification> findByRecipientIdOrderByCreatedAtDesc(UUID recipientId);

    List<Notification> findByRecipientIdAndReadFalseOrderByCreatedAtDesc(
            UUID recipientId
    );

    long countByRecipientIdAndReadFalse(UUID recipientId);

    Optional<Notification> findByIdAndRecipientId(
            UUID id,
            UUID recipientId
    );

    void deleteByRecipientId(UUID recipientId);

        List<Notification> findByRecipientId(UUID recipientId);
}
