ALTER TABLE notifications
    DROP CONSTRAINT IF EXISTS notifications_type_check;

ALTER TABLE notifications
    ADD CONSTRAINT notifications_type_check CHECK (
        type IN (
            'APPOINTMENT_CREATED',
            'APPOINTMENT_UPDATED',
            'APPOINTMENT_CANCELLED',
            'APPOINTMENT_RESCHEDULED',
            'DOCTOR_CREATED',
            'DOCTOR_DEACTIVATED',
            'DOCTOR_REACTIVATED',
            'DOCTOR_UPDATED',
            'ASSISTANT_CREATED',
            'ASSISTANT_DEACTIVATED',
            'ASSISTANT_REACTIVATED',
            'ASSISTANT_UPDATED',
            'ASSIGN_ASSISTANT',
            'UNASSIGN_ASSISTANT',
            'PATIENT_UPDATED',
            'SYSTEM'
        )
    );