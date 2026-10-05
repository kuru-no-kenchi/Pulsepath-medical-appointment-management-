package com.phantom.medapp_backend.admin;

import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.phantom.medapp_backend.admin.dto.AdminAssistantResponse;
import com.phantom.medapp_backend.admin.dto.AdminDashboardResponse;
import com.phantom.medapp_backend.admin.dto.AdminDoctorResponse;
import com.phantom.medapp_backend.appointment.dto.AppointmentCancellationRequest;
import com.phantom.medapp_backend.appointment.dto.AppointmentCancellationResponse;
import com.phantom.medapp_backend.appointment.dto.AppointmentRequest;
import com.phantom.medapp_backend.appointment.dto.AppointmentResponse;
import com.phantom.medapp_backend.appointment.dto.AppointmentStatsResponse;
import com.phantom.medapp_backend.assistant.dto.AssistantRequest;
import com.phantom.medapp_backend.assistant.dto.AssistantResponse;
import com.phantom.medapp_backend.doctor.Doctor;
import com.phantom.medapp_backend.doctor.dto.DoctorRequest;
import com.phantom.medapp_backend.doctor.dto.DoctorResponse;
import com.phantom.medapp_backend.patient.dto.PatientRequest;
import com.phantom.medapp_backend.patient.dto.PatientResponse;
import com.phantom.medapp_backend.user.dto.UserRequest;
import com.phantom.medapp_backend.user.dto.UserResponse;
import com.phantom.medapp_backend.utils.dto.BulkIdsRequest;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@Tag(name = "Admin APIs")
@SecurityRequirement(name = "bearerAuth")
@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    @Operation(summary = "Create assistant account", description = """
            Creates a new assistant account.

            Only administrators can create assistants.

            Assistants are responsible for:
            - Managing doctor schedules
            - Managing appointments
            - Rescheduling bookings
            - Cancelling bookings
            """)
    @PostMapping("/create/assistant")
    public ResponseEntity<AdminAssistantResponse> createAssistant(@Valid @RequestBody AssistantRequest request) {
        return adminService.createAssistant(request);
    }

    @GetMapping("/assistant/{assistant_id}")
    public AssistantResponse getAssistant(@PathVariable UUID assistant_id) {
        return adminService.getAssistant(assistant_id);
    }

    @Operation(summary = "Assign assistant to doctor", description = """
            Assigns a doctor to an assistant.

            An assistant may manage multiple doctors.

            Only administrators are authorized
            to modify doctor-assistant assignments.
            """)
    @PostMapping("/assistants/{assistantId}/doctors/{doctorId}")
    public void assignDoctor(
            @PathVariable UUID assistantId,
            @PathVariable UUID doctorId) {
        adminService.assignDoctorToAssistant(assistantId, doctorId);
    }

    @Operation(summary = "Unassign assistant to doctor", description = """
            Show a list of doctors assigned to an assistant.

            Remove a doctor from the list of assigned doctors of an assistant for administration reasons only.

            Only administrators are authorized
            to modify doctor-assistant assignments.
            """)
    @DeleteMapping("/assistants/{assistantId}/doctors/{doctorId}")
    public void removeDoctor(
            @PathVariable UUID assistantId,
            @PathVariable UUID doctorId) {
        adminService.removeAssistantFromDoctor(assistantId, doctorId);
    }

    @Operation(summary = "Get Doctors of an Assistant", description = """
            Assigns a doctor to an assistant.

            Retreive a list of doctors assigned to an assistant.

            Only administrators are authorized
            to modify doctor-assistant assignments.
            """)
    @GetMapping("/assistants/{assistantId}/doctors")
    public List<Doctor> getAssignedDoctors(@PathVariable UUID assistantId) {
        return adminService.getDoctorsOfAssistant(assistantId);
    }

    @GetMapping("/list/assistants")
    public List<AssistantResponse> getAllAssistant() {
        return adminService.getAllAssistants();
    }

    @DeleteMapping("/delete/assistant/{assistant_id}")
    public String softDeleteAssistant(@PathVariable UUID assistant_id) {
        adminService.softDeleteAssistant(assistant_id);
        return "Assistant set as inactive";
    }

    @DeleteMapping("/delete/assistant/{assistant_id}/db")
    public String hardDeleteAssistant(@PathVariable UUID assistant_id) {
        adminService.hardDeleteAssistant(assistant_id);
        return "Assistant deleted succefully";
    }

    @PatchMapping("/update/assistant/{assistant_id}")
    public AssistantResponse updateAssistant(@PathVariable UUID assistant_id, @Valid @RequestBody AssistantRequest request) {
        return adminService.updateAssistant(assistant_id, request);
    }

    @PatchMapping("/assistant/{assistant_id}/restore")
    public String restoreAssistant(@PathVariable UUID assistant_id) {
        adminService.restoreAssistant(assistant_id);
        return "Assistant set as active and able to work again";
    }

    @PutMapping("/assistants/{assistantId}/doctors")
    public AssistantResponse updateAssignedDoctors(
            @PathVariable UUID assistantId,
            @Valid @RequestBody List<UUID> doctorIds) {

        return adminService.updateAssignedDoctors(
                assistantId,
                doctorIds);

    }

    @PostMapping("/bulk/activate/assistants")
    public ResponseEntity<Void> bulkActivateAssistants(
            @Valid @RequestBody BulkIdsRequest request) {
        adminService.bulkActivateAssistants(request.getIds());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/bulk/delete/assistants")
    public ResponseEntity<Void> bulkDeleteAssistants(
            @Valid @RequestBody BulkIdsRequest request) {
        adminService.bulkDeleteAssistants(request.getIds());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/bulk/deactivate/assistants")
    public ResponseEntity<Void> bulkDeactivateAssistants(
            @Valid @RequestBody BulkIdsRequest request) {
        adminService.bulkDeactivateAssistants(request.getIds());
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Create doctor account", description = """
            Creates a new doctor account.

            Only administrators are authorized to perform this action.

            The doctor receives:
            - User account
            - Doctor profile
            - Assigned medical specialty
            - Consultation duration settings

            Newly created doctors can immediately access
            their dashboard after authentication.
            """)
    @PostMapping("/create/doctor")
    public ResponseEntity<AdminDoctorResponse> createDoctor(@Valid @RequestBody DoctorRequest request) {
        return adminService.createDoctor(request);
    }

    @Operation(summary = "Get all doctors", description = """
            Retrieves all doctors registered in the system.

            Accessible only by administrators.

            Returns doctor profile information including:
            - Doctor ID
            - Full name
            - Email
            - Specialty
            - Consultation duration
            - Approval status
            """)
    @GetMapping("/list/doctors")
    public List<DoctorResponse> getAllDoctors() {
        return adminService.getAllDoctors();
    }

    @DeleteMapping("/delete/doctor/{doctor_id}")
    public String softDeleteDoctor(@PathVariable UUID doctor_id) {
        adminService.softDeleteDoctor(doctor_id);
        return "Doctor set as inactive";
    }

    @DeleteMapping("/delete/doctor/{doctor_id}/db")
    public String hardDeleteDoctor(@PathVariable UUID doctor_id) {
        adminService.hardDeleteDoctor(doctor_id);
        return "Doctor deleted succefully";
    }

    @PatchMapping("/update/doctor/{doctor_id}")
    public DoctorResponse updateDoctor(@PathVariable UUID doctor_id, @Valid @RequestBody DoctorRequest request) {
        return adminService.updateDoctor(doctor_id, request);
    }

    @PatchMapping("/doctor/{doctorId}/restore")
    public String restoreDoctor(@PathVariable UUID doctorId) {
        adminService.restoreDoctor(doctorId);
        return "Doctor set as active and able to work again";
    }

    @GetMapping("/doctor/{doctor_id}")
    public DoctorResponse getDoctor(@PathVariable UUID doctor_id) {
        return adminService.getDoctor(doctor_id);
    }

    @PostMapping("/bulk/activate/doctors")
    public ResponseEntity<Void> bulkActivateDoctors(
            @Valid @RequestBody BulkIdsRequest request) {
        adminService.bulkActivateDoctors(request.getIds());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/bulk/delete/doctors")
    public ResponseEntity<Void> bulkDeleteDoctors(
            @Valid @RequestBody BulkIdsRequest request) {
        adminService.bulkDeleteDoctors(request.getIds());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/bulk/deactivate/doctors")
    public ResponseEntity<Void> bulkDeactivateDoctors(
            @Valid @RequestBody BulkIdsRequest request) {
        adminService.bulkDeactivateDoctors(request.getIds());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/list/patients")
    public List<PatientResponse> getPatients() {
        return adminService.getAllPatients();
    }

    @PatchMapping("/update/{patient_id}")
    public PatientResponse updatePatient(@PathVariable UUID patient_id, @Valid @RequestBody PatientRequest request) {
        return adminService.updatePatient(patient_id, request);
    }

    @GetMapping("/dashboard")
    public AdminDashboardResponse getDashboardStats() {
        return adminService.getDashboardStats();
    }

    @GetMapping("/last/appointments")
    public List<AppointmentResponse> getLastThreeAppointments() {
        return adminService.getLastThreeAppointments();
    }

    @GetMapping("/last/doctors")
    public List<DoctorResponse> getLastThreeDoctors() {
        return adminService.getLastThreeDoctors();
    }

    @GetMapping("/last/assistants")
    public List<AssistantResponse> getLastThreeAssistants() {
        return adminService.getLastThreeAssistants();
    }

    @GetMapping("/my/profile")
    public UserResponse getProfile() {
        return adminService.getProfile();
    }

    @PatchMapping("/update/profile")
    public UserResponse updateProfile(@Valid @RequestBody UserRequest request) {
        return adminService.updateProfile(request);
    }

    @GetMapping("/list/appointments")
    public List<AppointmentResponse> getAppointments() {

        return adminService.getAllAppointments();

    }

    @GetMapping("/{appointmentId}")
    public AppointmentResponse getAppointment(@PathVariable UUID appointmentId) {

        return adminService.getAppointment(appointmentId);

    }

    @GetMapping("/stats")
    public AppointmentStatsResponse getStats() {
        return adminService.getStats();
    }

    @PostMapping("/create/appointment")
    public void createAppointment(@Valid @RequestBody AppointmentRequest request) {
        adminService.createAppointment(request);

    }

    @PatchMapping("/update/{appointmentId}")
    public AppointmentResponse updateAppointment(@PathVariable UUID appointmentId,
            @Valid @RequestBody AppointmentRequest request) {
        return adminService.updateAppointment(appointmentId, request);
    }

    @DeleteMapping("/cancel/{appointmentId}")
    public AppointmentCancellationResponse cancelAppointment(@PathVariable UUID appointmentId, AppointmentCancellationRequest request) {
        return adminService.cancelAppointment(appointmentId, request);
    }
}
