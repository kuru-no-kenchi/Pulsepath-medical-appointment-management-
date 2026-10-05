package com.phantom.medapp_backend.notification;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.phantom.medapp_backend.notification.dto.NotificationResponse;
import com.phantom.medapp_backend.user.User;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public Notification create(
            User recipient,
            NotificationType type,
            String title,
            String message,
            UUID relatedEntityId,
            String relatedEntityType
    ) {

        Notification notification = Notification.builder()
                .recipient(recipient)
                .type(type)
                .title(title)
                .message(message)
                .read(false)
                .relatedEntityId(relatedEntityId)
                .relatedEntityType(relatedEntityType)
                .build();

        return notificationRepository.save(notification);
    }

    public List<NotificationResponse> getMyNotifications(User user) {

        return notificationRepository
                .findByRecipientIdOrderByCreatedAtDesc(user.getId())
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public long getUnreadCount(User user) {

        return notificationRepository
                .countByRecipientIdAndReadFalse(user.getId());
    }

    @Transactional
    public void markAsRead(UUID notificationId, User user) {

        Notification notification = notificationRepository
                .findByIdAndRecipientId(notificationId, user.getId())
                .orElseThrow(()
                        -> new RuntimeException("Notification not found")
                );

        notification.setRead(true);
    }

    @Transactional
    public void markAllAsRead(User user) {

        List<Notification> notifications
                = notificationRepository
                        .findByRecipientIdAndReadFalseOrderByCreatedAtDesc(
                                user.getId()
                        );

        notifications.forEach(notification
                -> notification.setRead(true)
        );
    }

    private NotificationResponse toResponse(Notification notification) {

        return NotificationResponse.builder()
                .id(notification.getId())
                .type(notification.getType())
                .title(notification.getTitle())
                .message(notification.getMessage())
                .read(notification.isRead())
                .relatedEntityId(notification.getRelatedEntityId())
                .relatedEntityType(notification.getRelatedEntityType())
                .createdAt(notification.getCreatedAt())
                .build();
    }
}
