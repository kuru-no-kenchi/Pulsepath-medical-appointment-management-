package com.phantom.medapp_backend.notification;

import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.phantom.medapp_backend.notification.dto.NotificationCountResponse;
import com.phantom.medapp_backend.notification.dto.NotificationResponse;
import com.phantom.medapp_backend.user.User;
import com.phantom.medapp_backend.user.UserService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;
    private final UserService userService;

    @GetMapping
    public ResponseEntity<List<NotificationResponse>> getNotifications(
            Authentication authentication
    ) {

        User user = userService.getUserFromAuthentication(authentication);

        return ResponseEntity.ok(
                notificationService.getMyNotifications(user)
        );
    }

    @GetMapping("/unread-count")
    public ResponseEntity<NotificationCountResponse> getUnreadCount(
            Authentication authentication
    ) {

        User user = userService.getUserFromAuthentication(authentication);

        return ResponseEntity.ok(
                new NotificationCountResponse(
                        notificationService.getUnreadCount(user)
                )
        );
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<Void> markAsRead(
            @PathVariable UUID id,
            Authentication authentication
    ) {

        User user = userService.getUserFromAuthentication(authentication);

        notificationService.markAsRead(id, user);

        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/read-all")
    public ResponseEntity<Void> markAllAsRead(
            Authentication authentication
    ) {

        User user = userService.getUserFromAuthentication(authentication);

        notificationService.markAllAsRead(user);

        return ResponseEntity.noContent().build();
    }
}
