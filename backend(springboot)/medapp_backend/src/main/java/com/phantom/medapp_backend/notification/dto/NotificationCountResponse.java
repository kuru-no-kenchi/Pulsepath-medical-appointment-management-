package com.phantom.medapp_backend.notification.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class NotificationCountResponse {
    private long unreadCount;
}
