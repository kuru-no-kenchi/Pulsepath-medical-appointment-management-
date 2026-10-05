package com.phantom.medapp_backend.auditlog;

import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.phantom.medapp_backend.user.User;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;

    public AuditLog log(
            User user,
            AuditLogAction action,
            String entityType,
            UUID entityId,
            String description
    ) {

        AuditLog auditLog = new AuditLog();

        auditLog.setUser(user);
        auditLog.setAction(action);
        auditLog.setEntityType(entityType);
        auditLog.setEntityId(entityId);
        auditLog.setDescription(description);

        return auditLogRepository.save(auditLog);
    }

    public Page<AuditLog> getAllLogs(Pageable pageable) {
        return auditLogRepository
                .findAllByOrderByCreatedAtDesc(pageable);
    }

    public Page<AuditLog> getByUser(
            UUID userId,
            Pageable pageable
    ) {
        return auditLogRepository
                .findByUserIdOrderByCreatedAtDesc(
                        userId,
                        pageable
                );
    }

    public Page<AuditLog> getByAction(
            AuditLogAction action,
            Pageable pageable
    ) {
        return auditLogRepository
                .findByActionOrderByCreatedAtDesc(
                        action,
                        pageable
                );
    }

    public Page<AuditLog> getByEntityType(
            String entityType,
            Pageable pageable
    ) {
        return auditLogRepository
                .findByEntityTypeOrderByCreatedAtDesc(
                        entityType,
                        pageable
                );
    }

    public Page<AuditLog> getByEntity(
            UUID entityId,
            Pageable pageable
    ) {
        return auditLogRepository
                .findByEntityIdOrderByCreatedAtDesc(
                        entityId,
                        pageable
                );
    }
}
