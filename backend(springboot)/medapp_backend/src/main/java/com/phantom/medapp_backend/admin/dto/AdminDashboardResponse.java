package com.phantom.medapp_backend.admin.dto;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminDashboardResponse {
    private long doctors;
    private long assistants;
    private long patients;
    private long appointments;
    private AppointmentStats appointmentStats;
    private List<AppointmentTrend> appointmentsByDay;

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AppointmentStats {
        private long confirmed;
        private long completed;
        private long cancelled;
        private long no_show;
    }

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AppointmentTrend {
        private String date;
        private long count;
    }
}
