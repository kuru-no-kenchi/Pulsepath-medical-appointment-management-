package com.phantom.medapp_backend.admin;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.phantom.medapp_backend.admin.dto.AdminAssistantResponse;
import com.phantom.medapp_backend.admin.dto.AdminDashboardResponse;
import com.phantom.medapp_backend.admin.dto.AdminDoctorResponse;
import com.phantom.medapp_backend.appointment.Appointment;
import com.phantom.medapp_backend.appointment.AppointmentMapper;
import com.phantom.medapp_backend.appointment.AppointmentRepository;
import com.phantom.medapp_backend.appointment.AppointmentStatus;
import com.phantom.medapp_backend.appointment.AvailableSlotsService;
import com.phantom.medapp_backend.appointment.dto.AppointmentCancellationRequest;
import com.phantom.medapp_backend.appointment.dto.AppointmentCancellationResponse;
import com.phantom.medapp_backend.appointment.dto.AppointmentRequest;
import com.phantom.medapp_backend.appointment.dto.AppointmentResponse;
import com.phantom.medapp_backend.appointment.dto.AppointmentStatsResponse;
import com.phantom.medapp_backend.assistant.Assistant;
import com.phantom.medapp_backend.assistant.AssistantMapper;
import com.phantom.medapp_backend.assistant.AssistantRepository;
import com.phantom.medapp_backend.assistant.dto.AssistantRequest;
import com.phantom.medapp_backend.assistant.dto.AssistantResponse;
import com.phantom.medapp_backend.auditlog.AuditLogAction;
import com.phantom.medapp_backend.auditlog.AuditLogService;
import com.phantom.medapp_backend.config.PasswordGenerator;
import com.phantom.medapp_backend.doctor.Doctor;
import com.phantom.medapp_backend.doctor.DoctorMapper;
import com.phantom.medapp_backend.doctor.DoctorRepository;
import com.phantom.medapp_backend.doctor.dto.DoctorRequest;
import com.phantom.medapp_backend.doctor.dto.DoctorResponse;
import com.phantom.medapp_backend.exception.AppointmentNotFoundException;
import com.phantom.medapp_backend.exception.AssistantNotFoundException;
import com.phantom.medapp_backend.exception.ConflictException;
import com.phantom.medapp_backend.exception.DoctorNotFoundException;
import com.phantom.medapp_backend.exception.PatientNotFoundException;
import com.phantom.medapp_backend.exception.UserNotFoundException;
import com.phantom.medapp_backend.notification.NotificationService;
import com.phantom.medapp_backend.notification.NotificationType;
import com.phantom.medapp_backend.patient.Patient;
import com.phantom.medapp_backend.patient.PatientMapper;
import com.phantom.medapp_backend.patient.PatientRepository;
import com.phantom.medapp_backend.patient.dto.PatientRequest;
import com.phantom.medapp_backend.patient.dto.PatientResponse;
import com.phantom.medapp_backend.user.Role;
import com.phantom.medapp_backend.user.User;
import com.phantom.medapp_backend.user.UserMapper;
import com.phantom.medapp_backend.user.UserRepository;
import com.phantom.medapp_backend.user.dto.UserRequest;
import com.phantom.medapp_backend.user.dto.UserResponse;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final PasswordEncoder passwordEncoder;
    private final UserRepository userRepository;
    private final AssistantRepository assistantRepository;
    private final DoctorRepository doctorRepository;
    private final PatientRepository patientRepository;
    private final AppointmentRepository appointmentRepository;
    private final UserMapper userMapper;
    private final DoctorMapper doctorMapper;
    private final AssistantMapper assistantMapper;
    private final PatientMapper patientMapper;
    private final AppointmentMapper appointmentMapper;
    private final AvailableSlotsService availableSlotsService;
    private final NotificationService notificationService;
    private final AuditLogService auditLogService;

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();

        User currentUser = userRepository.findUserByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User not found"));
        return currentUser;
    }

    /* Admin endpoints related to assistant */
 /* Admin actions towards assistants */
 /* CRUD functions for assistants */
    public List<Doctor> getDoctorsOfAssistant(UUID assistantId) {
        Assistant assistant = assistantRepository.findById(assistantId)
                .orElseThrow(() -> new AssistantNotFoundException("Assistant not found"));
        return new ArrayList<>(assistant.getDoctors());
    }

    public List<AssistantResponse> getAllAssistants() {
        return assistantRepository.findAll()
                .stream()
                .map(assistantMapper::map)
                .toList();
    }

    public AssistantResponse getAssistant(UUID assistant_id) {
        Assistant assistant = assistantRepository.findById(assistant_id)
                .orElseThrow(() -> new AssistantNotFoundException("Assistant not found"));
        return assistantMapper.map(assistant);
    }

    @Transactional
    public ResponseEntity<AdminAssistantResponse> createAssistant(AssistantRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }
        String temporaryPassword = PasswordGenerator.generateTemporaryPassword();
        User user = User.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .password(
                        passwordEncoder.encode(
                                temporaryPassword))
                .role(Role.ASSISTANT)
                .build();
        userRepository.save(user);
        Assistant assistant = Assistant.builder()
                .user(user)
                .build();
        assistantRepository.save(assistant);
        notificationService.create(
                assistant.getUser(),
                NotificationType.ASSISTANT_CREATED,
                "Account Created.",
                "Your account has been created. Go to your profile to see your information",
                assistant.getId(),
                "ASSISTANT");
        auditLogService.log(
                getCurrentUser(),
                AuditLogAction.CREATE,
                "ASSISTANT",
                assistant.getId(),
                getCurrentUser().getFullName() + "created assistant"
                + assistant.getUser().getFullName());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(
                        new AdminAssistantResponse(
                                assistant.getId(),
                                user.getEmail(),
                                temporaryPassword));
    }

    @Transactional
    public void assignDoctorToAssistant(UUID assistantId, UUID doctorId) {

        Assistant assistant = assistantRepository.findById(assistantId)
                .orElseThrow(() -> new AssistantNotFoundException("Assistant not found"));
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new DoctorNotFoundException("Doctor not found"));
        assistant.getDoctors().add(doctor);
        assistantRepository.save(assistant);
        notificationService.create(
                assistant.getUser(),
                NotificationType.ASSIGN_ASSISTANT,
                "You have been assigned.",
                "You have been assigned to Dr." + doctor.getUser().getFullName(),
                assistant.getId(),
                "ASSISTANT");
        notificationService.create(
                doctor.getUser(),
                NotificationType.ASSIGN_ASSISTANT,
                "Assistant assigned.",
                "Assistant" + assistant.getUser() + "have been assigned to you",
                doctor.getId(),
                "ASSISTANT");
        auditLogService.log(
                getCurrentUser(),
                AuditLogAction.ASSIGN,
                "ASSISTANT & DOCTOR",
                assistant.getId(),
                getCurrentUser().getFullName() + "assigned assistant"
                + assistant.getUser().getFullName() + "to doctor"
                + doctor.getUser().getFullName());

    }

    @Transactional
    public void removeAssistantFromDoctor(UUID assistantId, UUID doctorId) {

        Assistant assistant = assistantRepository.findById(assistantId)
                .orElseThrow(() -> new AssistantNotFoundException("Assistant not found"));
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new DoctorNotFoundException("Doctor not found"));
        assistant.getDoctors().remove(doctor);
        assistantRepository.save(assistant);
        notificationService.create(
                assistant.getUser(),
                NotificationType.UNASSIGN_ASSISTANT,
                "You have been unassigned.",
                "You have been unassigned from Dr." + doctor.getUser().getFullName(),
                assistant.getId(),
                "ASSISTANT");
        notificationService.create(
                doctor.getUser(),
                NotificationType.UNASSIGN_ASSISTANT,
                "Assistant unassigned.",
                "Assistant" + assistant.getUser().getFullName() + "is no longer assigned to you",
                doctor.getId(),
                "ASSISTANT");
        auditLogService.log(
                getCurrentUser(),
                AuditLogAction.UNASSIGN,
                "ASSISTANT & DOCTOR",
                assistant.getId(),
                getCurrentUser().getFullName() + "unassigned assistant"
                + assistant.getUser().getFullName() + "from doctor"
                + doctor.getUser().getFullName());
    }

    public void softDeleteAssistant(UUID assistant_id) {
        Assistant assistant = assistantRepository.findById(assistant_id)
                .orElseThrow(() -> new AssistantNotFoundException("Assistant not found"));
        assistant.setActive(false);
        assistantRepository.save(assistant);
        notificationService.create(
                assistant.getUser(),
                NotificationType.ASSISTANT_DEACTIVATED,
                "Account Deactivated.",
                "Your account has been deactivated. Speak to the administrator for more information.",
                assistant.getId(),
                "ASSISTANT");
        auditLogService.log(
                getCurrentUser(),
                AuditLogAction.DEACTIVATE,
                "ASSISTANT",
                assistant.getId(),
                getCurrentUser().getFullName() + "deactivated assistant"
                + assistant.getUser().getFullName());
    }

    public void restoreAssistant(UUID assistant_id) {
        Assistant assistant = assistantRepository.findById(assistant_id)
                .orElseThrow(() -> new AssistantNotFoundException("Assistant not found"));
        assistant.setActive(true);
        assistantRepository.save(assistant);
        notificationService.create(
                assistant.getUser(),
                NotificationType.ASSISTANT_REACTIVATED,
                "Account Reactivated.",
                "Your account has been Reactivated. Speak to the administrator for more information.",
                assistant.getId(),
                "ASSISTANT");
        auditLogService.log(
                getCurrentUser(),
                AuditLogAction.REACTIVATE,
                "ASSISTANT",
                assistant.getId(),
                getCurrentUser().getFullName() + "reactivated assistant"
                + assistant.getUser().getFullName());
    }

    @Transactional
    public void hardDeleteAssistant(UUID assistantId) {
        Assistant assistant = assistantRepository.findById(assistantId)
                .orElseThrow(() -> new AssistantNotFoundException("Assistant not found"));
        User user = assistant.getUser();
        auditLogService.log(
                getCurrentUser(),
                AuditLogAction.DELETE,
                "ASSISTANT",
                assistant.getId(),
                getCurrentUser().getFullName() + "deleted assistant"
                + assistant.getUser().getFullName());
        assistantRepository.delete(assistant);
        userRepository.delete(user);
    }

    public AssistantResponse updateAssistant(
            UUID assistant_id,
            AssistantRequest request) {

        Assistant assistant = assistantRepository.findById(assistant_id)
                .orElseThrow(() -> new AssistantNotFoundException("Assistant not found"));
        User user = assistant.getUser();
        if (request.getFirstName() != null) {
            user.setFirstName(request.getFirstName());
        }
        if (request.getLastName() != null) {
            user.setLastName(request.getLastName());
        }
        if (request.getEmail() != null) {
            user.setEmail(request.getEmail());
        }
        if (request.getPhone() != null) {
            user.setPhone(request.getPhone());
        }
        if (request.getPhotoUrl() != null) {
            user.setPhotoUrl(request.getPhotoUrl());
        }
        userRepository.save(user);
        Assistant updatedAssistant = assistantRepository.save(assistant);
        notificationService.create(
                assistant.getUser(),
                NotificationType.ASSISTANT_UPDATED,
                "Profile updated",
                "Your profile has been updated. Tap to see changes",
                assistant.getId(),
                "ASSISTANT");
        auditLogService.log(
                getCurrentUser(),
                AuditLogAction.UPDATE,
                "ASSISTANT",
                assistant.getId(),
                getCurrentUser().getFullName() + "updated assistant"
                + assistant.getUser().getFullName());
        return assistantMapper.map(updatedAssistant);
    }

    @Transactional
    public AssistantResponse updateAssignedDoctors(UUID assistantId, List<UUID> doctorIds) {
        Assistant assistant = assistantRepository.findById(assistantId)
                .orElseThrow(() -> new RuntimeException("Assistant not found"));
        List<Doctor> doctors = doctorRepository.findAllById(doctorIds);
        assistant.setDoctors(doctors);
        assistantRepository.save(assistant);
        notificationService.create(
                assistant.getUser(),
                NotificationType.ASSISTANT_UPDATED,
                "Doctors updated",
                "The list of doctors assigned to you is updated. Tap to see more",
                assistant.getId(),
                "ASSISTANT");
        auditLogService.log(
                getCurrentUser(),
                AuditLogAction.UPDATE,
                "ASSISTANT",
                assistant.getId(),
                getCurrentUser().getFullName() + "updated the list of doctors assigned to the assistant"
                + assistant.getUser().getFullName());
        return assistantMapper.map(assistant);
    }

    @Transactional
    public void bulkDeactivateAssistants(List<UUID> assistantIds) {
        List<Assistant> assistants = assistantRepository.findAllById(assistantIds);
        if (assistants.size() != assistantIds.size()) {
            throw new AssistantNotFoundException(
                    "One or more assistants were not found");
        }
        assistants.forEach(assistant -> assistant.setActive(false));
        assistantRepository.saveAll(assistants);
        assistants.forEach(assistant -> notificationService.create(
                assistant.getUser(),
                NotificationType.ASSISTANT_DEACTIVATED,
                "Account Deactivated.",
                "Your account has been deactivated. Speak to the administrator for more information.",
                assistant.getId(),
                "ASSISTANT"));
        auditLogService.log(
                getCurrentUser(),
                AuditLogAction.DEACTIVATE,
                "ASSISTANT",
                getCurrentUser().getId(),
                getCurrentUser().getFullName() + "deactivated" + assistants.size() + "assistants");
    }

    @Transactional
    public void bulkActivateAssistants(List<UUID> assistantIds) {
        List<Assistant> assistants = assistantRepository.findAllById(assistantIds);
        if (assistants.size() != assistantIds.size()) {
            throw new AssistantNotFoundException(
                    "One or more assistants were not found");
        }
        assistants.forEach(assistant -> assistant.setActive(true));
        assistantRepository.saveAll(assistants);
        assistants.forEach(assistant -> notificationService.create(
                assistant.getUser(),
                NotificationType.ASSISTANT_REACTIVATED,
                "Account Reactivated.",
                "Your account has been Reactivated. Speak to the administrator for more information.",
                assistant.getId(),
                "ASSISTANT"));
        auditLogService.log(
                getCurrentUser(),
                AuditLogAction.REACTIVATE,
                "ASSISTANT",
                getCurrentUser().getId(),
                getCurrentUser().getFullName() + "reactivated" + assistants.size() + "assistants");
    }

    @Transactional
    public void bulkDeleteAssistants(List<UUID> assistantIds) {
        List<Assistant> assistants = assistantRepository.findAllById(assistantIds);
        if (assistants.size() != assistantIds.size()) {
            throw new AssistantNotFoundException(
                    "One or more assistants were not found");
        }
        assistantRepository.deleteAll(assistants);
        auditLogService.log(
                getCurrentUser(),
                AuditLogAction.DELETE,
                "ASSISTANT",
                getCurrentUser().getId(),
                getCurrentUser().getFullName() + "deleted" + assistants.size() + "assistants");
    }

    /* Admin endpoints related to his dashboard and profile */
 /* Admin service that fetches data for the UI dashboard to render */
 /* Admin actions to fetch profile or update it */
    public AdminDashboardResponse getDashboardStats() {
        long doctors = doctorRepository.count();
        long assistants = assistantRepository.count();
        long patients = patientRepository.count();
        long appointments = appointmentRepository.count();
        long confirmed = appointmentRepository.countByStatus(AppointmentStatus.CONFIRMED);
        long completed = appointmentRepository.countByStatus(AppointmentStatus.COMPLETED);
        long cancelled = appointmentRepository.countByStatus(AppointmentStatus.CANCELLED);
        long no_show = appointmentRepository.countByStatus(AppointmentStatus.NO_SHOW);
        LocalDate today = LocalDate.now();
        LocalDate startDate = today.minusDays(6);
        List<Appointment> recentAppointments = appointmentRepository.findByAppointmentDateBetween(startDate,
                today);
        Map<LocalDate, Long> appointmentsByDate;
        appointmentsByDate = recentAppointments.stream()
                .collect(
                        Collectors.groupingBy(
                                Appointment::getAppointmentDate,
                                Collectors.counting()));
        List<AdminDashboardResponse.AppointmentTrend> trend = startDate.datesUntil(today.plusDays(1))
                .map(date -> AdminDashboardResponse.AppointmentTrend
                .builder()
                .date(date.toString())
                .count(appointmentsByDate.getOrDefault(date, 0L)).build())
                .toList();

        return AdminDashboardResponse.builder()
                .doctors(doctors)
                .assistants(assistants)
                .patients(patients)
                .appointments(appointments)
                .appointmentStats(
                        AdminDashboardResponse.AppointmentStats
                                .builder()
                                .confirmed(confirmed)
                                .completed(completed)
                                .cancelled(cancelled)
                                .no_show(no_show)
                                .build())
                .appointmentsByDay(trend)
                .build();
    }

    public List<AppointmentResponse> getLastThreeAppointments() {
        var page = appointmentRepository.findAll(PageRequest.of(0, 3,
                Sort.by("appointmentDate").descending().and(Sort.by("startTime").descending())));

        return page.getContent().stream()
                .map(appointmentMapper::map)
                .toList();
    }

    public List<DoctorResponse> getLastThreeDoctors() {
        var page = doctorRepository.findAll(PageRequest.of(0, 3,
                Sort.by(Sort.Order.desc("user.createdAt"), Sort.Order.desc("experienceYears"))));
        return page.getContent().stream()
                .map(doctorMapper::map)
                .toList();
    }

    List<AssistantResponse> getLastThreeAssistants() {
        var page = assistantRepository.findAll(PageRequest.of(0, 3,
                Sort.by(Sort.Order.desc("user.createdAt"))));
        return page.getContent().stream()
                .map(assistantMapper::map)
                .toList();
    }

    public UserResponse getProfile() {
        User user = getCurrentUser();
        return userMapper.map(user);
    }

    public UserResponse updateProfile(UserRequest request) {
        User user = getCurrentUser();
        if (request.getFirstName() != null) {
            user.setFirstName(request.getFirstName());
        }
        if (request.getLastName() != null) {
            user.setLastName(request.getLastName());
        }
        if (request.getEmail() != null) {
            user.setEmail(request.getEmail());
        }
        if (request.getPhone() != null) {
            user.setPhone(request.getPhone());
        }
        if (request.getPhotoUrl() != null) {
            user.setPhotoUrl(request.getPhotoUrl());
        }
        User updatedUser = userRepository.save(user);
        auditLogService.log(
                getCurrentUser(),
                AuditLogAction.DELETE,
                "ADMIN",
                getCurrentUser().getId(),
                getCurrentUser().getFullName() + "updated profile");
        return userMapper.map(updatedUser);
    }

    /* Admin endpoints related to doctor */
 /* Admin actions towards doctors */
 /* CRUD functions for doctors... */
    public DoctorResponse getDoctor(UUID doctor_id) {

        Doctor doctor = doctorRepository.findById(doctor_id)
                .orElseThrow(() -> new DoctorNotFoundException("Doctor not found"));

        return doctorMapper.map(doctor);
    }

    public List<DoctorResponse> getAllDoctors() {
        return doctorRepository.findAll()
                .stream()
                .map(doctorMapper::map)
                .toList();
    }

    @Transactional
    public ResponseEntity<AdminDoctorResponse> createDoctor(
            DoctorRequest request) {

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        String temporaryPassword = PasswordGenerator.generateTemporaryPassword();

        User user = User.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .password(
                        passwordEncoder.encode(
                                temporaryPassword))
                .role(Role.DOCTOR)
                .build();

        userRepository.save(user);

        Doctor doctor = Doctor.builder()
                .specialty(request.getSpecialty())
                .bio(request.getBio())
                .experienceYears(
                        request.getExperienceYears())
                .consultationDuration(request.getConsultationDuration())
                .user(user)
                .build();

        doctorRepository.save(doctor);
        notificationService.create(
                doctor.getUser(),
                NotificationType.DOCTOR_CREATED,
                "Account Created.",
                "Your account has been created. Go to your profile to see your information",
                doctor.getId(),
                "DOCTOR");
        auditLogService.log(
                getCurrentUser(),
                AuditLogAction.CREATE,
                "ASSISTANT",
                doctor.getId(),
                getCurrentUser().getFullName() + "created doctor" + doctor.getUser().getFullName());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new AdminDoctorResponse(
                        doctor.getId(),
                        user.getEmail(),
                        temporaryPassword));
    }

    public DoctorResponse updateDoctor(
            UUID doctor_id,
            DoctorRequest request) {

        Doctor doctor = doctorRepository.findById(doctor_id)
                .orElseThrow(() -> new DoctorNotFoundException("Doctor not found"));

        User user = doctor.getUser();

        if (request.getFirstName() != null) {
            user.setFirstName(request.getFirstName());
        }

        if (request.getLastName() != null) {
            user.setLastName(request.getLastName());
        }

        if (request.getEmail() != null) {
            user.setEmail(request.getEmail());
        }

        if (request.getPhone() != null) {
            user.setPhone(request.getPhone());
        }

        if (request.getSpecialty() != null) {
            doctor.setSpecialty(request.getSpecialty());
        }

        if (request.getBio() != null) {
            doctor.setBio(request.getBio());
        }

        if (request.getExperienceYears() != null) {
            doctor.setExperienceYears(request.getExperienceYears());
        }

        if (request.getConsultationDuration() != null) {
            doctor.setConsultationDuration(
                    request.getConsultationDuration());
        }

        userRepository.save(user);
        Doctor updatedDoctor = doctorRepository.save(doctor);
        notificationService.create(
                doctor.getUser(),
                NotificationType.DOCTOR_UPDATED,
                "Profile updated",
                "Your profile has been updated. Tap to see changes",
                doctor.getId(),
                "DOCTOR");
        auditLogService.log(
                getCurrentUser(),
                AuditLogAction.UPDATE,
                "DOCTOR",
                doctor.getId(),
                getCurrentUser().getFullName() + "updated doctor" + doctor.getUser().getFullName());

        return doctorMapper.map(updatedDoctor);
    }

    public void softDeleteDoctor(UUID doctor_id) {
        Doctor doctor = doctorRepository.findById(doctor_id)
                .orElseThrow(() -> new DoctorNotFoundException("Doctor not found"));
        doctor.setActive(false);
        doctorRepository.save(doctor);
        notificationService.create(
                doctor.getUser(),
                NotificationType.DOCTOR_DEACTIVATED,
                "Account Deactivated.",
                "Your account has been deactivated. Speak to the administrator for more information.",
                doctor.getId(),
                "DOCTOR");
        auditLogService.log(
                getCurrentUser(),
                AuditLogAction.DEACTIVATE,
                "DOCTOR",
                doctor.getId(),
                getCurrentUser().getFullName() + "deactivated doctor" + doctor.getUser().getFullName());
    }

    public void restoreDoctor(UUID doctorId) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new DoctorNotFoundException("Doctor not found"));
        doctor.setActive(true);
        doctorRepository.save(doctor);
        notificationService.create(
                doctor.getUser(),
                NotificationType.DOCTOR_REACTIVATED,
                "Account Reactivated.",
                "Your account has been Reactivated. Speak to the administrator for more information.",
                doctor.getId(),
                "DOCTOR");
        auditLogService.log(
                getCurrentUser(),
                AuditLogAction.REACTIVATE,
                "DOCTOR",
                doctor.getId(),
                getCurrentUser().getFullName() + "reactivated doctor" + doctor.getUser().getFullName());
    }

    @Transactional
    public void hardDeleteDoctor(UUID doctorId) {

        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new DoctorNotFoundException("Doctor not found"));

        User user = doctor.getUser();
        auditLogService.log(
                getCurrentUser(),
                AuditLogAction.DELETE,
                "DOCTOR",
                doctor.getId(),
                getCurrentUser().getFullName() + "deleted doctor" + doctor.getUser().getFullName());
        doctorRepository.delete(doctor);
        userRepository.delete(user);
    }

    @Transactional
    public void bulkDeactivateDoctors(List<UUID> doctorIds) {

        List<Doctor> doctors = doctorRepository.findAllById(doctorIds);

        if (doctors.size() != doctorIds.size()) {
            throw new DoctorNotFoundException(
                    "One or more doctors were not found");
        }

        doctors.forEach(doctor -> doctor.setActive(false));
        doctorRepository.saveAll(doctors);
        doctors.forEach(doctor -> notificationService.create(
                doctor.getUser(),
                NotificationType.DOCTOR_DEACTIVATED,
                "Account Deactivated.",
                "Your account has been deactivated. Speak to the administrator for more information.",
                doctor.getId(),
                "DOCTOR"));
        auditLogService.log(
                getCurrentUser(),
                AuditLogAction.DEACTIVATE,
                "DOCTOR",
                getCurrentUser().getId(),
                getCurrentUser().getFullName() + "deactivated" + doctors.size() + "doctors");
    }

    @Transactional
    public void bulkActivateDoctors(List<UUID> doctorIds) {

        List<Doctor> doctors = doctorRepository.findAllById(doctorIds);

        if (doctors.size() != doctorIds.size()) {
            throw new DoctorNotFoundException(
                    "One or more doctors were not found");
        }
        doctors.forEach(doctor -> doctor.setActive(true));
        doctorRepository.saveAll(doctors);
        doctors.forEach(doctor -> notificationService.create(
                doctor.getUser(),
                NotificationType.DOCTOR_REACTIVATED,
                "Account Reactivated.",
                "Your account has been Reactivated. Speak to the administrator for more information.",
                doctor.getId(),
                "DOCTOR"));
        auditLogService.log(
                getCurrentUser(),
                AuditLogAction.REACTIVATE,
                "DOCTOR",
                getCurrentUser().getId(),
                getCurrentUser().getFullName() + "reactivated" + doctors.size() + "doctors");
    }

    @Transactional
    public void bulkDeleteDoctors(List<UUID> doctorIds) {

        List<Doctor> doctors = doctorRepository.findAllById(doctorIds);

        if (doctors.size() != doctorIds.size()) {
            throw new DoctorNotFoundException(
                    "One or more doctors were not found");
        }

        doctorRepository.deleteAll(doctors);
        auditLogService.log(
                getCurrentUser(),
                AuditLogAction.DELETE,
                "DOCTOR",
                getCurrentUser().getId(),
                getCurrentUser().getFullName() + "deleted" + doctors.size() + "doctors");
    }

    /* Admin endpoints related to patient */
 /* Admin actions towards patients */
 /*
         * Admin can only fetch the patients not apply CRUD operations just update for
         * now(go check)...
     */
    public List<PatientResponse> getAllPatients() {
        return patientRepository.findAll()
                .stream()
                .map(patientMapper::map)
                .toList();
    }

    public PatientResponse updatePatient(
            UUID patient_id,
            PatientRequest request) {

        Patient patient = patientRepository.findById(patient_id)
                .orElseThrow(() -> new PatientNotFoundException("Patient not found"));

        User user = patient.getUser();

        if (request.getFirstName() != null) {
            user.setFirstName(request.getFirstName());
        }

        if (request.getLastName() != null) {
            user.setLastName(request.getLastName());
        }

        if (request.getEmail() != null) {
            user.setEmail(request.getEmail());
        }

        if (request.getPhone() != null) {
            user.setPhone(request.getPhone());
        }

        if (request.getAddress() != null) {
            patient.setAddress(request.getAddress());
        }

        if (request.getDateOfBirth() != null) {
            patient.setDateOfBirth(request.getDateOfBirth());
        }
        if (request.getGender() != null) {
            patient.setGender(request.getGender());
        }
        if (request.getEmergencyContact() != null) {
            patient.setEmergencyContact(request.getEmergencyContact());
        }

        userRepository.save(user);

        Patient updatedPatient = patientRepository.save(patient);
        notificationService.create(
                patient.getUser(),
                NotificationType.PATIENT_UPDATED,
                "Profile updated",
                "Your profile has been updated. Tap to see changes",
                patient.getId(),
                "PATIENT");
        return patientMapper.map(updatedPatient);
    }

    // Admin endpoints related to appointments
    // Admin actions towards appointments
    public List<AppointmentResponse> getAllAppointments() {

        return appointmentRepository.findAll(Sort.by("appointmentDate")
                .descending()
                .and(Sort.by("startTime")))
                .stream()
                .map(appointmentMapper::map)
                .toList();

    }

    @Transactional
    public AppointmentResponse createAppointment(AppointmentRequest request) {
        User currentUser = getCurrentUser();

        Doctor doctor = doctorRepository.findByIdForUpdate(request.doctor().id())
                .orElseThrow(() -> new DoctorNotFoundException("Doctor not found"));
        if (!doctor.isActive()) {
            throw new DoctorNotFoundException("Doctor is inactive");
        }
        Patient patient = patientRepository.findById(request.patient().id())
                .orElseThrow(() -> new PatientNotFoundException("Patient not found"));
        Assistant assistant = assistantRepository.findById(request.assistant().id())
                .orElseThrow(() -> new AssistantNotFoundException("Assistant not found"));
        if (!assistant.isActive()) {
            throw new AssistantNotFoundException("Assistant is inactive");
        }

        boolean available = availableSlotsService.isSlotAvailable(
                doctor,
                request.appointmentDate(),
                request.startTime(),
                doctor.getConsultationDuration(),
                null);

        if (!available) {
            throw new ConflictException(
                    "The selected appointment slot is not available");
        }
        Appointment appointment = Appointment.builder()
                .doctor(doctor)
                .assistant(assistant)
                .patient(patient)
                .appointmentDate(request.appointmentDate())
                .startTime(request.startTime())
                .endTime(request.startTime().plusMinutes(doctor.getConsultationDuration()))
                .reason(request.reason())
                .status(AppointmentStatus.CONFIRMED)
                .build();

        Appointment saved = appointmentRepository.save(appointment);

        notificationService.create(
                appointment.getPatient().getUser(),
                NotificationType.APPOINTMENT_CREATED,
                "Appointment Confirmed",
                "Your appointment with Dr. "
                + appointment.getDoctor().getUser().getFullName()
                + " has been confirmed.",
                appointment.getId(),
                "APPOINTMENT");

        notificationService.create(
                appointment.getDoctor().getUser(),
                NotificationType.APPOINTMENT_CREATED,
                "New Appointment",
                "You have a new appointment with "
                + appointment.getPatient().getUser().getFullName()
                + ".",
                appointment.getId(),
                "APPOINTMENT");
        notificationService.create(
                appointment.getAssistant().getUser(),
                NotificationType.APPOINTMENT_CREATED,
                "New Appointment",
                "A new appointment has been assigned to you.",
                appointment.getId(),
                "APPOINTMENT");
        auditLogService.log(
                currentUser,
                AuditLogAction.CREATE,
                "APPOINTMENT",
                appointment.getId(),
                currentUser.getFullName() + "created an appoinment with Dr."
                + doctor.getUser().getFullName()
                + "and assistant" + assistant.getUser().getFullName() + "for patient"
                + patient.getUser().getFullName()
                + ".");
        return appointmentMapper.map(saved);
    }

    public AppointmentResponse getAppointment(UUID id) {

        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new AppointmentNotFoundException("Appointment not found"));

        return appointmentMapper.map(appointment);

    }

    public AppointmentStatsResponse getStats() {

        long total = appointmentRepository.count();
        long confirmed = appointmentRepository.countByStatus(AppointmentStatus.CONFIRMED);
        long completed = appointmentRepository.countByStatus(AppointmentStatus.COMPLETED);
        long cancelled = appointmentRepository.countByStatus(AppointmentStatus.CANCELLED);
        long today = appointmentRepository.countByAppointmentDate(LocalDate.now());

        return new AppointmentStatsResponse(
                total,
                confirmed,
                completed,
                cancelled,
                today);
    }

    public AppointmentResponse updateAppointment(
            UUID id,
            AppointmentRequest request) {
        User currentUser = getCurrentUser();

        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new AppointmentNotFoundException("Appointment not found"));
        Doctor doctor = doctorRepository.findById(request.doctor().id())
                .orElseThrow(() -> new DoctorNotFoundException("Doctor not found"));
        Patient patient = patientRepository.findById(request.patient().id())
                .orElseThrow(() -> new PatientNotFoundException("Patient not found"));
        Assistant assistant = assistantRepository.findById(request.assistant().id())
                .orElseThrow(() -> new AssistantNotFoundException("Assistant not found"));
        boolean available = availableSlotsService.isSlotAvailable(
                doctor,
                request.appointmentDate(),
                request.startTime(),
                doctor.getConsultationDuration(),
                null);

        if (!available) {
            throw new ConflictException(
                    "The selected appointment slot is not available");
        }

        appointment.setDoctor(doctor);
        appointment.setAssistant(assistant);
        appointment.setPatient(patient);
        appointment.setAppointmentDate(request.appointmentDate());
        appointment.setStartTime(request.startTime());
        appointment.setStatus(request.status());
        appointment.setReason(request.reason());

        appointmentRepository.save(appointment);
        notificationService.create(
                appointment.getPatient().getUser(),
                NotificationType.APPOINTMENT_UPDATED,
                "Appointment Updated",
                "Your appointment with Dr. "
                + appointment.getDoctor().getUser().getFirstName()
                + " "
                + appointment.getDoctor().getUser().getLastName()
                + " has been updated go check what was changed .",
                appointment.getId(),
                "APPOINTMENT");

        notificationService.create(
                appointment.getDoctor().getUser(),
                NotificationType.APPOINTMENT_UPDATED,
                "Appointment Updated",
                "Your appointment with "
                + appointment.getPatient().getUser().getFirstName()
                + " "
                + appointment.getPatient().getUser().getLastName()
                + "has been changed. Please check what has been updated",
                appointment.getId(),
                "APPOINTMENT");
        notificationService.create(
                appointment.getAssistant().getUser(),
                NotificationType.APPOINTMENT_UPDATED,
                "Appointment Updated",
                "The appointment you are assigned to it has been gone to sime changes. Please check what has been updated.",
                appointment.getId(),
                "APPOINTMENT");
        auditLogService.log(
                currentUser,
                AuditLogAction.UPDATE,
                "APPOINTMENT",
                appointment.getId(),
                currentUser.getFullName() + "updated the appoinment with Dr."
                + doctor.getUser().getFullName()
                + "and assistant" + assistant.getUser().getFullName() + "for patient"
                + patient.getUser().getFullName()
                + ".");
        return appointmentMapper.map(appointment);
    }

    public AppointmentCancellationResponse cancelAppointment(UUID id, AppointmentCancellationRequest request) {
        User currentUser = getCurrentUser();

        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new AppointmentNotFoundException("Appointment not found"));

        appointment.setStatus(AppointmentStatus.CANCELLED);
        appointment.setCancelReason(request.cancelReason());
        appointment.setCancelledAt(LocalDateTime.now());
        appointment.setCancelledBy(currentUser);
        appointmentRepository.save(appointment);
        notificationService.create(
                appointment.getPatient().getUser(),
                NotificationType.APPOINTMENT_CANCELLED,
                "Appointment Cancelled",
                "Your appointment with Dr. "
                + appointment.getDoctor().getUser().getFirstName()
                + " "
                + appointment.getDoctor().getUser().getLastName()
                + " has been cancelled .",
                appointment.getId(),
                "APPOINTMENT");

        notificationService.create(
                appointment.getDoctor().getUser(),
                NotificationType.APPOINTMENT_CANCELLED,
                "Appointment Cancelled",
                "Your appointment with "
                + appointment.getPatient().getUser().getFirstName()
                + " "
                + appointment.getPatient().getUser().getLastName()
                + "has been cancelled",
                appointment.getId(),
                "APPOINTMENT");
        notificationService.create(
                appointment.getAssistant().getUser(),
                NotificationType.APPOINTMENT_CANCELLED,
                "Appointment Cancelled",
                "The appointment you are assigned to it has been cancelled.",
                appointment.getId(),
                "APPOINTMENT");
        auditLogService.log(
                currentUser,
                AuditLogAction.CANCEL,
                "APPOINTMENT",
                appointment.getId(),
                currentUser.getFullName() + "cancelled the appoinment between Dr."
                + appointment.getDoctor().getUser().getFullName()
                + "and assistant" + appointment.getAssistant().getUser().getFullName()
                + "for patient" + appointment.getPatient().getUser().getFullName()
                + ".");
        return new AppointmentCancellationResponse(appointment.getCancelReason(), appointment.getCancelledAt(),
                currentUser, Role.ASSISTANT, currentUser.getEmail());
    }
}
