package com.phantom.medapp_backend.auditlog;

import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@Tag(name = "Logs APIs")
@SecurityRequirement(name = "bearerAuth")
@RestController
@RequestMapping("/admin/logs")
@RequiredArgsConstructor
public class AuditLogController {

    private final AuditLogService auditLogService;

    @GetMapping("/all")
    public Page<AuditLog> getAllLogs(Pageable pageable) {
        return auditLogService.getAllLogs(pageable);
    }

    @GetMapping("/user")
    public Page<AuditLog> getByUser(UUID userId, Pageable pageable) {
        return auditLogService.getByUser(userId, pageable);
    }

    @GetMapping("/action")
    public Page<AuditLog> getByAction(AuditLogAction action, Pageable pageable) {
        return auditLogService.getByAction(action, pageable);
    }

    @GetMapping("/entity-type")
    public Page<AuditLog> getByEntityType(String entityType, Pageable pageable) {
        return auditLogService.getByEntityType(entityType, pageable);
    }

    @GetMapping("/entity")
    public Page<AuditLog> getByEntity(UUID entityId, Pageable pageable) {
        return auditLogService.getByEntity(entityId, pageable);
    }
}
