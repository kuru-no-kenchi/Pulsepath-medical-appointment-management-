export type NotificationType =
  | "APPOINTMENT_CREATED"
  | "APPOINTMENT_CANCELLED"
  | "APPOINTMENT_RESCHEDULED"
  | "DOCTOR_CREATED"
  | "DOCTOR_DEACTIVATED"
  | "DOCTOR_REACTIVATED"
  | "ASSISTANT_CREATED"
  | "ASSISTANT_DEACTIVATED"
  | "ASSISTANT_REACTIVATED"
  | "SYSTEM";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  relatedEntityId?: string;
  relatedEntityType?: string;
  createdAt: string;
}