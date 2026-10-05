package com.phantom.medapp_backend.doctor;

import java.util.List;
import java.util.UUID;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.phantom.medapp_backend.appointment.dto.AppointmentDetailResponse;
import com.phantom.medapp_backend.appointment.dto.AppointmentResponse;
import com.phantom.medapp_backend.doctor.dto.DoctorAssistantResponse;
import com.phantom.medapp_backend.doctor.dto.DoctorDashboardResponse;
import com.phantom.medapp_backend.doctor.dto.DoctorPatientResponse;
import com.phantom.medapp_backend.doctor.dto.DoctorRequest;
import com.phantom.medapp_backend.doctor.dto.DoctorResponse;
import com.phantom.medapp_backend.doctorschedule.dto.DoctorScheduleResponse;
import com.phantom.medapp_backend.patient.dto.PatientResponse;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@Tag(name = "Doctor APIs",
        description = "Doctor Endpoints used to view and manage their actions"
)
@SecurityRequirement(name = "bearer")
@RestController
@RequestMapping("/doctor")
@RequiredArgsConstructor
public class DoctorController {

    private final DoctorService doctorService;

    @Operation(
            summary = "Retrieve doctor profile",
            description = """
            Retrieves detailed information about a doctor.

            Includes:
            - Personal information
            - Specialty
            - Experience
            - Consultation duration
            """
    )
    @GetMapping("/my/profile")
    public DoctorResponse getProfile() {
        return doctorService.getProfile();
    }

    @PatchMapping("/update/profile")
    public DoctorResponse updateProfile(@Valid @RequestBody DoctorRequest request) {
        return doctorService.updateProfile(request);
    }

    @GetMapping("/dashboard")
    public DoctorDashboardResponse getDashboard() {
        return doctorService.getDashboard();
    }

    @GetMapping("/view/schedule")
    public List<DoctorScheduleResponse> getSchedule() {
        return doctorService.getSchedule();
    }

    @GetMapping("/my/patients")
    public List<PatientResponse> getPatients() {
        return doctorService.getPatients();
    }

    @GetMapping("/patient/{patient_id}/details")
    public DoctorPatientResponse getPatientDetails(UUID patient_id) {
        return doctorService.getPatientDetails(patient_id);
    }

    @GetMapping("/assistant")
    public DoctorAssistantResponse getAssignedAssistant() {
        return doctorService.getAssignedAssistant();
    }

    @Operation(
            summary = "Retrieve doctor's appointments",
            description = """
            Returns all appointments assigned
            to the enticated doctor.

            Provides a complete view of
            upcoming and historical consultations.
            """
    )
    @GetMapping("/view/my/appointments")
    public List<AppointmentResponse> getAppointments() {
        return doctorService.getMyAppointments();
    }

    @Operation(
            summary = "Retrieve today's appointments",
            description = """
            Returns appointments scheduled
            for the current day.

            Useful for daily consultation planning
            and workload management.
            """
    )
    @GetMapping("/view/my/appointments/today")
    public List<AppointmentResponse> getAppointmentsForToday() {
        return doctorService.getTodayAppointments();
    }

    @GetMapping("/{appointment_id}")
    public AppointmentDetailResponse getAppointmentDetail(@Valid @RequestBody UUID appointment_id) {
        return doctorService.getAppointmentDetails(appointment_id);
    }
}
