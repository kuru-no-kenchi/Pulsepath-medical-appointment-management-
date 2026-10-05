package com.phantom.medapp_backend.notification.dto;

import java.time.LocalDateTime;
import java.util.UUID;

import com.phantom.medapp_backend.notification.NotificationType;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class NotificationResponse {
    private UUID id;
    private NotificationType type;
    private String title;
    private String message;
    private boolean read;
    private UUID relatedEntityId;
    private String relatedEntityType;
    private LocalDateTime createdAt;
}
