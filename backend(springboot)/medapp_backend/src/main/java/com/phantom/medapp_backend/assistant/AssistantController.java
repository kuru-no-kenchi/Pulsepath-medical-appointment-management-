package com.phantom.medapp_backend.assistant;

import java.util.List;
import java.util.UUID;

import org.springframework.web.bind.annotation.DeleteMapping;
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
import com.phantom.medapp_backend.assistant.dto.AssistantDashboardResponse;
import com.phantom.medapp_backend.assistant.dto.AssistantDoctorResponse;
import com.phantom.medapp_backend.assistant.dto.AssistantRequest;
import com.phantom.medapp_backend.assistant.dto.AssistantResponse;
import com.phantom.medapp_backend.doctorschedule.dto.DoctorScheduleRequest;
import com.phantom.medapp_backend.doctorschedule.dto.DoctorScheduleResponse;
import com.phantom.medapp_backend.patient.dto.PatientResponse;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@Tag(name = "Assistant APIs")
@SecurityRequirement(name = "bearerAuth")
@RestController
@RequestMapping("/assistant")
@RequiredArgsConstructor
public class AssistantController {

    private final AssistantSevice assistantService;

    @GetMapping("/my/profile")
    public AssistantResponse getProfile() {
        return assistantService.getProfile();
    }

    @PatchMapping("/update/my/profile")
    public AssistantResponse updateProfile(@Valid @RequestBody AssistantRequest request) {
        return assistantService.updateProfile(request);
    }

    @GetMapping("/dashboard")
    public AssistantDashboardResponse getDashboard() {
        return assistantService.getDashboard();
    }

    @GetMapping("/today/appointments")
    public List<AppointmentResponse> getTodayAppointments() {
        return assistantService.getTodayAppointments();
    }

    @GetMapping("/my/doctors")
    public List<AssistantDoctorResponse> getManagedDoctors() {
        return assistantService.getManagedDoctors();
    }

    @GetMapping("/my/patients")
    public List<PatientResponse> getPatients() {
        return assistantService.getPatients();
    }

    @GetMapping("/my/doctors/appointments")
    public List<AppointmentResponse> getAppointments() {
        return assistantService.getAppointments();
    }

    @Operation(summary = "Cancel appointment", description = """
                        Cancels an existing appointment.

                        The appointment remains stored
                        for audit and reporting purposes.

                        Cancellation metadata includes:
                        - Cancellation reason
                        - Cancellation date
                        - User who performed cancellation

                        Cancelled appointments free their slot
                        for future bookings.
                        """)
    @PatchMapping("/appointment/{appointmentId}/cancel")
    public AppointmentCancellationResponse cancelAppointment(
            @PathVariable UUID appointmentId, @Valid AppointmentCancellationRequest request) {
        return assistantService.cancelAppointment(appointmentId, request);
    }

    @Operation(summary = "Retrieve doctor appointments", description = """
                        Returns all appointments belonging
                        to a doctor managed by the authenticated assistant.

                        Used for:
                        - Schedule coordination
                        - Appointment management
                        - Rescheduling activities
                        """)
    @GetMapping("/doctors/{doctorId}/appointments")
    public List<AppointmentResponse> getDoctorAppointments(@PathVariable UUID doctorId) {
        return assistantService.getDoctorAppointments(doctorId);
    }

    @Operation(summary = "Reschedule appointment", description = """
                        Moves an appointment to another
                        available slot.

                        The system validates:
                        - Assistant authorization
                        - Slot existence
                        - Slot availability
                        - Schedule compatibility

                        Existing appointment data
                        remains preserved.
                        """)
    @PatchMapping("/appointment/{appointmentId}/reschedule")
    public AppointmentResponse rescheduleAppointment(@PathVariable UUID appointmentId,
            @Valid @RequestBody AppointmentRescheduleRequest request) {
        return assistantService.rescheduleAppointment(appointmentId, request);
    }

    @Operation(summary = "Mark appointment as completed", description = """
                        Marks an appointment as successfully completed.

                        Only confirmed appointments
                        can transition to COMPLETED status.

                        This action represents that
                        the medical consultation took place.
                        """)
    @PatchMapping("/appointment/mark/{appointmentId}/complete")
    public AppointmentResponse markCompleted(@PathVariable UUID appointmentId) {
        return assistantService.markCompleted(appointmentId);
    }

    @Operation(summary = "Mark patient as no-show", description = """
                        Marks an appointment as NO_SHOW.

                        Used when a patient fails
                        to attend a scheduled consultation.

                        The appointment remains stored
                        for historical and reporting purposes.
                        """)
    @PatchMapping("/appointment/mark/{appointmentId}/no_show")
    public AppointmentResponse markNoShow(@PathVariable UUID appointmentId) {
        return assistantService.markNoShow(appointmentId);
    }

    @PostMapping("/appointment/create")
    public AppointmentResponse createAppointment(@Valid @RequestBody AppointmentRequest request) {
        return assistantService.createAppointment(request);
    }

    @Operation(
            summary = "Create doctor schedule",
            description = """
            Creates a recurring weekly schedule for a doctor.

            Examples:
            - Monday 09:00 → 12:00
            - Monday 14:00 → 18:00

            The system validates:
            - Assistant assignment
            - Schedule overlaps
            - Time consistency

            Schedule definitions are later used
            to generate available appointment slots.
            """
    )
    @PostMapping("/schedule/create")
    public void createSchedule(@RequestBody DoctorScheduleRequest request) {
        assistantService.createSchedule(request);
    }

    @Operation(
            summary = "Retrieve doctor schedules",
            description = """
            Returns all schedules assigned to a doctor.

            Used by assistants and frontend applications
            to display doctor availability.
            """
    )
    @GetMapping("/scheedule//doctor/{doctorId}")
    public List<DoctorScheduleResponse> getSchedules(@PathVariable UUID doctorId) {
        return assistantService.getDoctorSchedules(doctorId);
    }

    @Operation(
            summary = "Delete Schedule",
            description = """
            delete an existing doctor schedule.

            The schedule remains stored
            for audit and reporting purposes.

            Deletion metadata includes:
            - Deletion reason
            - Deletion date
            - User who performed Deletion

            Cancelled appointments free their slot
            for future bookings.
            """
    )
    @DeleteMapping("/schedule/{scheduleId}/delete")
    public void deleteSchedule(@PathVariable UUID scheduleId) {
        assistantService.deleteDoctorSchedule(scheduleId);
    }
}
