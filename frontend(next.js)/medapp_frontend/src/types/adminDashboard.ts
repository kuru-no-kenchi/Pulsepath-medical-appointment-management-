export interface AppointmentStats {
  confirmed: number;
  completed: number;
  cancelled: number;
  no_show: number;
}

export interface AppointmentTrend {
  date: string;
  count: number;
}

export interface AdminDashboard {
  doctors: number;
  assistants: number;
  patients: number;
  appointments: number;
  appointmentStats: AppointmentStats;
  appointmentsByDay: AppointmentTrend[];
}