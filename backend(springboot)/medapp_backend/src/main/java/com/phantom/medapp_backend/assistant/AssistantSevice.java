package com.phantom.medapp_backend.assistant;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.phantom.medapp_backend.appointment.Appointment;
import com.phantom.medapp_backend.appointment.AppointmentMapper;
import com.phantom.medapp_backend.appointment.AppointmentRepository;
import com.phantom.medapp_backend.appointment.AppointmentStatus;
import com.phantom.medapp_backend.appointment.AvailableSlotsService;
import com.phantom.medapp_backend.appointment.dto.AppointmentCancellationRequest;
import com.phantom.medapp_backend.appointment.dto.AppointmentCancellationResponse;
import com.phantom.medapp_backend.appointment.dto.AppointmentRequest;
import com.phantom.medapp_backend.appointment.dto.AppointmentRescheduleRequest;
import com.phantom.medapp_backend.appointment.dto.AppointmentResponse;
import com.phantom.medapp_backend.assistant.dto.AssistantDashboardResponse;
import com.phantom.medapp_backend.assistant.dto.AssistantDoctorResponse;
import com.phantom.medapp_backend.assistant.dto.AssistantRequest;
import com.phantom.medapp_backend.assistant.dto.AssistantResponse;
import com.phantom.medapp_backend.auditlog.AuditLogAction;
import com.phantom.medapp_backend.auditlog.AuditLogService;
import com.phantom.medapp_backend.doctor.Doctor;
import com.phantom.medapp_backend.doctor.DoctorRepository;
import com.phantom.medapp_backend.doctorschedule.DoctorSchedule;
import com.phantom.medapp_backend.doctorschedule.DoctorScheduleRepository;
import com.phantom.medapp_backend.doctorschedule.dto.DoctorScheduleRequest;
import com.phantom.medapp_backend.doctorschedule.dto.DoctorScheduleResponse;
import com.phantom.medapp_backend.exception.AppointmentNotFoundException;
import com.phantom.medapp_backend.exception.AssistantNotFoundException;
import com.phantom.medapp_backend.exception.ConflictException;
import com.phantom.medapp_backend.exception.DoctorNotFoundException;
import com.phantom.medapp_backend.exception.PatientNotFoundException;
import com.phantom.medapp_backend.exception.ScheduleNotFoundException;
import com.phantom.medapp_backend.exception.UnauthorizedActionException;
import com.phantom.medapp_backend.exception.UserNotFoundException;
import com.phantom.medapp_backend.notification.NotificationService;
import com.phantom.medapp_backend.notification.NotificationType;
import com.phantom.medapp_backend.patient.Patient;
import com.phantom.medapp_backend.patient.PatientRepository;
import com.phantom.medapp_backend.patient.PatientMapper;
import com.phantom.medapp_backend.patient.dto.PatientResponse;
import com.phantom.medapp_backend.user.Role;
import com.phantom.medapp_backend.user.User;
import com.phantom.medapp_backend.user.UserRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AssistantSevice {

    private final AssistantRepository assistantRepository;
    private final DoctorRepository doctorRepository;
    private final AppointmentRepository appointmentRepository;
    private final UserRepository userRepository;
    private final PatientRepository patientRepository;
    private final DoctorScheduleRepository scheduleRepository;
    private final AppointmentMapper appointmentMapper;
    private final AssistantMapper assistantMapper;
    private final PatientMapper patientMapper;
    private final AvailableSlotsService availableSlotsService;
    private final NotificationService notificationService;
    private final AuditLogService auditLogService;

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()
                || "anonymousUser".equals(authentication.getName())) {
            throw new RuntimeException("User is not authenticated");
        }

        String email = authentication.getName();
        return userRepository.findUserByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User not found"));
    }

    private Assistant getCurrentAssistant() {
        String email = SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();

        User user = userRepository.findUserByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return assistantRepository.findByUser(user)
                .orElseThrow(() -> new AssistantNotFoundException("Assistant not found"));
    }

    public void validateDoctorAssignment(Assistant assistant, Doctor doctor) {
        if (assistant == null) {
            throw new AssistantNotFoundException("Assistant not found");
        }
        if (doctor == null) {
            throw new DoctorNotFoundException("Doctor not found");
        }
        boolean assigned = assistant.getDoctors() != null && assistant.getDoctors().stream()
                .anyMatch(d -> d.getId() != null && d.getId().equals(doctor.getId()));

        if (!assigned) {
            throw new RuntimeException("Assistant is not assigned to this doctor");
        }
    }

    public AssistantResponse getProfile() {

        Assistant assistant = getCurrentAssistant();

        return assistantMapper.map(assistant);
    }

    public AssistantResponse updateProfile(AssistantRequest request) {
        Assistant assistant = getCurrentAssistant();
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
        assistantRepository.save(assistant);
        auditLogService.log(
                user,
                AuditLogAction.UPDATE,
                "ASSISTANT",
                assistant.getId(),
                assistant.getUser().getFullName() + "updated profile");
        return assistantMapper.map(assistant);
    }

    public AssistantDashboardResponse getDashboard() {

        Assistant assistant = getCurrentAssistant();
        List<Doctor> doctors = assistant.getDoctors();
        LocalDate today = LocalDate.now();
        List<Appointment> appointments = appointmentRepository.findByDoctorInAndAppointmentDate(doctors, today);

        long doctorsManaged = doctors.size();

        long todayAppointments = appointments.size();

        long remainingAppointments = appointments.stream()
                .filter(a -> a.getStatus() != AppointmentStatus.COMPLETED)
                .count();

        long totalPatients = appointments.stream()
                .map(Appointment::getPatient)
                .map(Patient::getId)
                .distinct()
                .count();

        return new AssistantDashboardResponse(
                doctorsManaged,
                todayAppointments,
                remainingAppointments,
                totalPatients);
    }

    public List<AppointmentResponse> getTodayAppointments() {

        Assistant assistant = getCurrentAssistant();

        List<Doctor> doctors = assistant.getDoctors();

        LocalDate today = LocalDate.now();

        return appointmentRepository
                .findByDoctorInAndAppointmentDateOrderByStartTimeDesc(doctors, today)
                .stream()
                .map(appointmentMapper::map)
                .toList();
    }

    public List<AppointmentResponse> getAppointments() {

        Assistant assistant = getCurrentAssistant();

        return appointmentRepository
                .findByAssistantIdOrderByAppointmentDateDescStartTimeDesc(assistant.getId())
                .stream()
                .map(appointmentMapper::map)
                .toList();
    }

    public List<AssistantDoctorResponse> getManagedDoctors() {

        Assistant assistant = getCurrentAssistant();

        List<Appointment> appointments = appointmentRepository.findByDoctorInAndAppointmentDate(
                assistant.getDoctors(),
                LocalDate.now());

        Map<UUID, Long> appointmentsCount = appointments.stream()
                .collect(Collectors.groupingBy(
                        a -> a.getDoctor().getId(),
                        Collectors.counting()));

        return assistant.getDoctors()
                .stream()
                .map(doctor -> {
                    long todayAppointments = appointmentsCount.getOrDefault(
                            doctor.getId(),
                            0L);
                    return new AssistantDoctorResponse(
                            doctor.getId(),
                            doctor.getUser().getFullName(),
                            doctor.getUser().getEmail(),
                            doctor.getSpecialty(),
                            doctor.getUser().getPhone(),
                            todayAppointments);
                })
                .toList();
    }

    public List<PatientResponse> getPatients() {
        return patientRepository.findAll()
                .stream()
                .map(patientMapper::map)
                .toList();
    }

    @Transactional
    public AppointmentResponse createAppointment(AppointmentRequest request) {
        User currentUser = getCurrentUser();
        Assistant assistant = getCurrentAssistant();
        Patient patient = patientRepository.findById(request.patient().id())
                .orElseThrow(() -> new PatientNotFoundException("Patient not found"));
        Doctor doctor = doctorRepository.findByIdForUpdate(request.doctor().id())
                .orElseThrow(() -> new DoctorNotFoundException("Doctor not found"));
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
        LocalTime endTime = request.startTime().plusMinutes(doctor.getConsultationDuration());

        Appointment appointment = Appointment.builder().patient(patient).doctor(doctor).assistant(assistant)
                .appointmentDate(request.appointmentDate()).startTime(request.startTime())
                .endTime(endTime).reason(request.reason()).status(AppointmentStatus.CONFIRMED).build();

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
                "The assistant" + currentUser.getFullName() + "created an appoinment with Dr."
                + doctor.getUser().getFullName()
                + "for patient" + patient.getUser().getFullName()
                + ".");
        return appointmentMapper.map(appointmentRepository.save(appointment));
    }

    @Transactional
    public AppointmentResponse markCompleted(UUID appointmentId) {
        User currentUser = getCurrentUser();

        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new AppointmentNotFoundException("Appointment not found"));

        if (appointment.getStatus() != AppointmentStatus.CONFIRMED) {
            throw new RuntimeException("Only confirmed appointments can be completed");
        }

        appointment.setStatus(AppointmentStatus.COMPLETED);
        auditLogService.log(
                currentUser,
                AuditLogAction.MARK_COMPLETE,
                "APPOINTMENT",
                appointment.getId(),
                "The assistant" + currentUser.getFullName() + "marked the appoinment with Dr."
                + appointment.getDoctor().getUser().getFullName()
                + "for patient" + appointment.getPatient().getUser().getFullName()
                + "as complete.");
        return appointmentMapper.map(appointmentRepository.save(appointment));
    }

    @Transactional
    public AppointmentResponse markNoShow(UUID appointmentId) {
        User currentUser = getCurrentUser();

        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new AppointmentNotFoundException("Appointment not found"));

        if (appointment.getStatus() != AppointmentStatus.CONFIRMED) {
            throw new RuntimeException("Only confirmed appointments can become NO_SHOW");
        }
        appointment.setStatus(AppointmentStatus.NO_SHOW);
        auditLogService.log(
                currentUser,
                AuditLogAction.MARK_NOSHOW,
                "APPOINTMENT",
                appointment.getId(),
                "The assistant" + currentUser.getFullName() + "marked the appoinment with Dr."
                + appointment.getDoctor().getUser().getFullName()
                + "for patient" + appointment.getPatient().getUser().getFullName()
                + "as no show.");
        return appointmentMapper.map(appointmentRepository.save(appointment));
    }

    @Transactional
    public AppointmentCancellationResponse cancelAppointment(
            UUID appointmentId, AppointmentCancellationRequest request) {
        User currentUser = getCurrentUser();

        Assistant assistant = getCurrentAssistant();

        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new AppointmentNotFoundException("Appointment not found"));

        validateDoctorAssignment(assistant, appointment.getDoctor());
        appointment.setStatus(AppointmentStatus.CANCELLED);
        appointment.setCancelReason(request.cancelReason());
        appointment.setCancelledAt(LocalDateTime.now());
        appointment.setCancelledBy(assistant.getUser());
        notificationService.create(
                appointment.getPatient().getUser(),
                NotificationType.APPOINTMENT_CANCELLED,
                "Appointment Cancelled",
                "Your appointment with Dr. "
                + appointment.getDoctor().getUser().getFullName()
                + " has been cancelled .",
                appointment.getId(),
                "APPOINTMENT");

        notificationService.create(
                appointment.getDoctor().getUser(),
                NotificationType.APPOINTMENT_CANCELLED,
                "Appointment Cancelled",
                "Your appointment with "
                + appointment.getPatient().getUser().getFullName()
                + "has been cancelled",
                appointment.getId(),
                "APPOINTMENT");
        auditLogService.log(
                currentUser,
                AuditLogAction.CANCEL,
                "APPOINTMENT",
                appointment.getId(),
                "The assistant" + currentUser.getFullName() + "cancelled the appoinment with Dr."
                + appointment.getDoctor().getUser().getFullName()
                + "for patient" + appointment.getPatient().getUser().getFullName()
                + ".");
        return new AppointmentCancellationResponse(
                appointment.getCancelReason(),
                appointment.getCancelledAt(),
                assistant.getUser(),
                Role.ASSISTANT,
                assistant.getUser().getEmail());
    }

    @Transactional
    public AppointmentResponse rescheduleAppointment(UUID appointmentId, AppointmentRescheduleRequest request) {
        User currentUser = getCurrentUser();

        Assistant assistant = getCurrentAssistant();

        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new AppointmentNotFoundException("Appointment not found"));

        Doctor doctor = appointment.getDoctor();
        validateDoctorAssignment(assistant, doctor);
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
        LocalTime endTime = request.startTime().plusMinutes(doctor.getConsultationDuration());
        appointment.setAppointmentDate(request.appointmentDate());
        appointment.setStartTime(request.startTime());
        appointment.setEndTime(endTime);
        appointment.setStatus(AppointmentStatus.CONFIRMED);
        Appointment saved = appointmentRepository.save(appointment);
        notificationService.create(
                appointment.getPatient().getUser(),
                NotificationType.APPOINTMENT_RESCHEDULED,
                "Appointment Cancelled",
                "Your appointment with Dr. "
                + appointment.getDoctor().getUser().getFirstName()
                + " "
                + appointment.getDoctor().getUser().getLastName()
                + " has been rescheduled. Please check your new appointment date",
                appointment.getId(),
                "APPOINTMENT");

        notificationService.create(
                appointment.getDoctor().getUser(),
                NotificationType.APPOINTMENT_RESCHEDULED,
                "Appointment Cancelled",
                "Your appointment with "
                + appointment.getPatient().getUser().getFirstName()
                + " "
                + appointment.getPatient().getUser().getLastName()
                + "has been rescheduled. Please check your new appointment date",
                appointment.getId(),
                "APPOINTMENT");
        notificationService.create(
                appointment.getAssistant().getUser(),
                NotificationType.APPOINTMENT_RESCHEDULED,
                "Appointment Cancelled",
                "The appointment you are assigned to it has been rescheduled. Please check your new appointment date",
                appointment.getId(),
                "APPOINTMENT");
        auditLogService.log(
                currentUser,
                AuditLogAction.RESCHEDULE,
                "APPOINTMENT",
                appointment.getId(),
                "The assistant" + currentUser.getFullName() + "rescheduled the appoinment with Dr."
                + appointment.getDoctor().getUser().getFullName()
                + "for patient" + appointment.getPatient().getUser().getFullName()
                + "to new date" + saved.getAppointmentDate()
                + "starting at" + saved.getStartTime()
                + ".");
        return appointmentMapper.map(saved);
    }

    public List<AppointmentResponse> getDoctorAppointments(UUID doctorId) {

        Assistant assistant = getCurrentAssistant();

        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new DoctorNotFoundException("Doctor not found"));

        validateDoctorAssignment(assistant, doctor);

        return appointmentRepository.findByDoctorOrderByAppointmentDateDescStartTimeDesc(doctor).stream()
                .map(appointmentMapper::map).toList();
    }

    @Transactional
    public void createSchedule(DoctorScheduleRequest request) {

        Assistant assistant = getCurrentAssistant();

        Doctor doctor = doctorRepository.findById(request.doctorId())
                .orElseThrow(() -> new DoctorNotFoundException("Doctor not Found"));

        if (!assistant.getDoctors().contains(doctor)) {
            throw new RuntimeException(
                    "You are not assigned to this doctor");
        }
        if (!request.startTime().isBefore(request.endTime())) {
            throw new RuntimeException(
                    "Start time must be before end time");
        }
        validateNoOverlap(doctor, request);
        DoctorSchedule schedule = DoctorSchedule.builder()
                .doctor(doctor)
                .dayOfWeek(request.dayOfWeek())
                .startTime(request.startTime())
                .endTime(request.endTime())
                .build();

        scheduleRepository.save(schedule);
    }

    private void validateNoOverlap(Doctor doctor, DoctorScheduleRequest request) {

        List<DoctorSchedule> schedules = scheduleRepository.findByDoctorAndDayOfWeek(
                doctor,
                request.dayOfWeek());

        for (DoctorSchedule existing : schedules) {

            boolean overlap = request.startTime().isBefore(existing.getEndTime())
                    && request.endTime().isAfter(existing.getStartTime());

            if (overlap) {
                throw new RuntimeException(
                        "Schedule overlaps with existing period");
            }
        }
    }

    public List<DoctorScheduleResponse> getDoctorSchedules(UUID doctorId) {

        Assistant assistant = getCurrentAssistant();

        Doctor doctor = doctorRepository
                .findById(doctorId)
                .orElseThrow(() -> new DoctorNotFoundException("Doctor not found"));

        if (!assistant.getDoctors().contains(doctor)) {
            throw new UnauthorizedActionException(
                    "You are not assigned to this doctor");
        }

        return scheduleRepository.findByDoctor(doctor)
                .stream()
                .map(s -> new DoctorScheduleResponse(
                s.getId(),
                s.getDayOfWeek(),
                s.getStartTime(),
                s.getEndTime()))
                .toList();
    }

    @Transactional
    public void deleteDoctorSchedule(UUID scheduleId) {
        DoctorSchedule schedule = scheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new ScheduleNotFoundException("Schedule not found"));
        scheduleRepository.delete(schedule);
    }
}
