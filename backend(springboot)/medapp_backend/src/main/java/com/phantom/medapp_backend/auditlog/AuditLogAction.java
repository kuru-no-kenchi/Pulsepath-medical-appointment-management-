package com.phantom.medapp_backend.auditlog;

public enum AuditLogAction {

    PASSWORD_CHANGE,

    CREATE,
    UPDATE,
    DELETE,

    REGISTER,
    LOGIN,
    LOGOUT,

    ASSIGN,
    UNASSIGN,

    CANCEL,
    RESCHEDULE,
    MARK_COMPLETE,
    MARK_NOSHOW,
    
    DEACTIVATE,
    REACTIVATE
}
