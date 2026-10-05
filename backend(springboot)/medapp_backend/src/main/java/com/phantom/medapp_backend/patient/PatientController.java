package com.phantom.medapp_backend.patient;

import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.phantom.medapp_backend.appointment.dto.AppointmentCancellationRequest;
import com.phantom.medapp_backend.appointment.dto.AppointmentCancellationResponse;
import com.phantom.medapp_backend.appointment.dto.AppointmentRequest;
import com.phantom.medapp_backend.appointment.dto.AppointmentRescheduleRequest;
import com.phantom.medapp_backend.appointment.dto.AppointmentResponse;
import com.phantom.medapp_backend.doctor.dto.DoctorResponse;
import com.phantom.medapp_backend.patient.dto.PatientDashboardResponse;
import com.phantom.medapp_backend.patient.dto.PatientRequest;
import com.phantom.medapp_backend.patient.dto.PatientResponse;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@Tag(name = "Patient DashBoard",
        description = "Endpoints used by patients to manage and monitor their profile and appointments"
)
@SecurityRequirement(name = "bearerAuth")
@RestController
@RequestMapping("patient")
@RequiredArgsConstructor
public class PatientController {

    private final PatientService patientService;

    @Operation(summary = "Get patient Profile",
            description = """
            Retrieves detailed information about a patient.

            Includes:
            - Personal information
            - Address
            - Phone
            """
    )
    @GetMapping("/profile")
    public PatientResponse getMyProfile() {
        return patientService.getProfile();
    }

    @PatchMapping("/update/profile")
    public PatientResponse updateProfile(@Valid @RequestBody PatientRequest request) {
        return patientService.updateProfile(request);
    }

    @Operation(
            summary = "Book an appointment",
            description = """
            Creates a new appointment between
            a patient and a doctor.

            Validation includes:
            - Existing doctor
            - Valid slot
            - Slot availability
            - Schedule compatibility

            Successful bookings are automatically
            marked as CONFIRMED.
            """
    )
    @PostMapping("/book/appointment")
    public ResponseEntity<AppointmentResponse> createAppointment(
            @Valid @RequestBody AppointmentRequest request) {
        return patientService.createAppointment(request);
    }

    @Operation(
            summary = "Retrieve patient appointments",
            description = """
            Returns all appointments belonging
            to the authenticated patient.

            Includes:
            - Doctor information
            - Appointment date
            - Time slot
            - Current status
            """
    )
    @GetMapping("/view/my/appointments")
    public List<AppointmentResponse> getMyAppointments() {
        return patientService.getMyappointmentsForPatient();
    }

    @GetMapping("/appointments/{appointmentId}")
    public AppointmentResponse getAppointmentById(@PathVariable UUID appointmentId) {
        return patientService.getAppointmentById(appointmentId);
    }

    @GetMapping("/stats")
    public PatientDashboardResponse getStats() {
        return patientService.getStats();
    }

    @GetMapping("/upcoming")
    public List<AppointmentResponse> getUpcoming() {
        return patientService.getUpcomingAppointments();
    }

    @GetMapping("/recent/visits")
    public List<AppointmentResponse> getRecentVisit() {
        return patientService.getRecentVisits();
    }

    @GetMapping("/doctors")
    public List<DoctorResponse> getVisitedDoctors() {
        return patientService.getVisitedDoctors();
    }

    @PatchMapping("/appointments/{appointmentId}/reschedule")
    public AppointmentResponse rescheduleAppointment(@PathVariable UUID appointmentId,
            @Valid @RequestBody AppointmentRescheduleRequest request) {
        return patientService.rescheduleAppointment(appointmentId, request);
    }

    @PatchMapping("/appointments/{appointmentId}/cancel")
    public AppointmentCancellationResponse cancelAppointment(@PathVariable UUID appointmentId,
            @Valid @RequestBody AppointmentCancellationRequest request) {
        return patientService.cancelAppointment(appointmentId, request);
    }
}
