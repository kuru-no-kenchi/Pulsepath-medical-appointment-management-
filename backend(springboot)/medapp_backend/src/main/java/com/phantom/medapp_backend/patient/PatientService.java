package com.phantom.medapp_backend.patient;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
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
import com.phantom.medapp_backend.assistant.Assistant;
import com.phantom.medapp_backend.assistant.AssistantRepository;
import com.phantom.medapp_backend.auditlog.AuditLogAction;
import com.phantom.medapp_backend.auditlog.AuditLogService;
import com.phantom.medapp_backend.doctor.Doctor;
import com.phantom.medapp_backend.doctor.DoctorMapper;
import com.phantom.medapp_backend.doctor.DoctorRepository;
import com.phantom.medapp_backend.doctor.dto.DoctorResponse;
import com.phantom.medapp_backend.exception.AppointmentNotFoundException;
import com.phantom.medapp_backend.exception.AssistantNotFoundException;
import com.phantom.medapp_backend.exception.ConflictException;
import com.phantom.medapp_backend.exception.DoctorNotFoundException;
import com.phantom.medapp_backend.exception.PatientNotFoundException;
import com.phantom.medapp_backend.notification.NotificationService;
import com.phantom.medapp_backend.notification.NotificationType;
import com.phantom.medapp_backend.patient.dto.PatientDashboardResponse;
import com.phantom.medapp_backend.patient.dto.PatientRequest;
import com.phantom.medapp_backend.patient.dto.PatientResponse;
import com.phantom.medapp_backend.user.User;
import com.phantom.medapp_backend.user.UserRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PatientService {

    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final AssistantRepository assistantRepository;
    private final UserRepository userRepository;
    private final AppointmentRepository appointmentRepository;
    private final AvailableSlotsService availableSlotsService;
    private final AppointmentMapper appointmentMapper;
    private final DoctorMapper doctorMapper;
    private final PatientMapper patientMapper;
    private final AuditLogService auditLogService;
    private final NotificationService notificationService;

    private Patient getCurrentPatient() {
        String email = SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();

        User user = userRepository.findUserByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return patientRepository.findByUser(user)
                .orElseThrow(() -> new PatientNotFoundException("Doctor not found"));
    }

    public PatientDashboardResponse getStats() {
        Patient patient = getCurrentPatient();

        Optional<Appointment> upcoming = appointmentRepository
                .findFirstByPatientAndStatusAndAppointmentDateGreaterThanEqualOrderByAppointmentDateDescStartTimeDesc(
                        patient,
                        AppointmentStatus.CONFIRMED,
                        LocalDate.now());

        long total = appointmentRepository.countByPatient(patient);

        long completed = appointmentRepository.countByPatientAndStatus(
                patient,
                AppointmentStatus.COMPLETED);

        long pending = appointmentRepository.countByPatientAndStatus(
                patient,
                AppointmentStatus.CONFIRMED);

        return new PatientDashboardResponse(
                upcoming.map(Appointment::getAppointmentDate).orElse(null),
                upcoming.map(Appointment::getStartTime).orElse(null),
                upcoming.map(a -> a.getDoctor().getUser().getFullName()).orElse(null),
                upcoming.map(a -> a.getDoctor().getSpecialty()).orElse(null),
                total,
                completed,
                pending);
    }

    public List<AppointmentResponse> getUpcomingAppointments() {
        AppointmentStatus status = AppointmentStatus.CONFIRMED;
        Patient patient = getCurrentPatient();
        LocalDate date = LocalDate.now();
        List<Appointment> appointments = appointmentRepository
                .findByPatientAndStatusAndAppointmentDateGreaterThanEqualOrderByAppointmentDateDescStartTimeDesc(
                        patient, status, date);
        return appointments.stream()
                .map(appointmentMapper::map)
                .toList();
    }

    public List<AppointmentResponse> getRecentVisits() {
        AppointmentStatus status = AppointmentStatus.COMPLETED;
        Patient patient = getCurrentPatient();
        List<Appointment> appointments = appointmentRepository.findTop5ByPatientAndStatusOrderByAppointmentDateDescStartTimeDesc(
                patient, status
        );
        return appointments.stream()
                .map(appointmentMapper::map)
                .toList();

    }

    public List<DoctorResponse> getVisitedDoctors() {
        Patient patient = getCurrentPatient();
        List<Doctor> doctors = patientRepository.findVisitedDoctors(patient);
        return doctors.stream()
                .map(doctorMapper::map)
                .toList();
    }

    public PatientResponse getProfile() {

        Patient patient = getCurrentPatient();

        return patientMapper.map(patient);
    }

    public PatientResponse updateProfile(PatientRequest request) {
        Patient patient = getCurrentPatient();
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
        if (request.getPhotoUrl() != null) {
            user.setPhotoUrl(request.getPhotoUrl());
        }
        if (request.getAddress() != null) {
            patient.setAddress(request.getAddress());
        }

        if (request.getEmergencyContact() != null) {
            patient.setEmergencyContact(request.getEmergencyContact());
        }
        userRepository.save(user);
        Patient updatedPatient = patientRepository.save(patient);
        auditLogService.log(
                user,
                AuditLogAction.UPDATE,
                "PATIENT",
                user.getId(),
                user.getFullName() + "updated profile"
        );
        return patientMapper.map(updatedPatient);
    }

    public List<AppointmentResponse> getMyappointmentsForPatient() {

        Patient patient = getCurrentPatient();
        List<Appointment> appointments = appointmentRepository.findByPatient(patient);
        return appointments.stream()
                .map(appointmentMapper::map)
                .toList();
    }

    public AppointmentResponse getAppointmentById(UUID appointmentId) {
        Patient patient = getCurrentPatient();
        Appointment appointment = appointmentRepository.findByIdAndPatient(appointmentId, patient)
                .orElseThrow(() -> new AppointmentNotFoundException("Appointment not found"));

        return appointmentMapper.map(appointment);
    }

    @Transactional
    public ResponseEntity<AppointmentResponse> createAppointment(AppointmentRequest request) {

        Patient patient = getCurrentPatient();

        Doctor doctor = doctorRepository.findByIdForUpdate(request.doctor().id())
                .orElseThrow(() -> new DoctorNotFoundException("Doctor not found"));
        if (!doctor.isActive()) {
            throw new DoctorNotFoundException("Doctor is inactive");
        }

        Assistant assistant = assistantRepository.findById(request.assistant().id())
                .orElseThrow(() -> new AssistantNotFoundException("Assistant not found"));
        if (!assistant.isActive()) {
            throw new DoctorNotFoundException("Assistant is inactive");
        }
        boolean available = availableSlotsService.isSlotAvailable(
                doctor,
                request.appointmentDate(),
                request.startTime(),
                doctor.getConsultationDuration(),
                null
        );

        if (!available) {
            throw new ConflictException(
                    "The selected appointment slot is not available"
            );
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
        appointmentRepository.save(appointment);
        auditLogService.log(
                patient.getUser(),
                AuditLogAction.CREATE,
                "PATIENT",
                appointment.getId(),
                patient.getUser().getFullName() + "booked an appointment" + appointment.getId()
        );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(appointmentMapper.map(appointment));
    }

    @Transactional
    public AppointmentResponse rescheduleAppointment(UUID appointmentId, AppointmentRescheduleRequest request) {
        Patient patient = getCurrentPatient();
        User currentUser = patient.getUser();
        Appointment appointment = appointmentRepository.findByIdAndPatient(appointmentId, patient)
                .orElseThrow(() -> new AppointmentNotFoundException("Appointment not found"));
        boolean available = availableSlotsService.isSlotAvailable(
                appointment.getDoctor(),
                request.appointmentDate(),
                request.startTime(),
                appointment.getDoctor().getConsultationDuration(),
                null
        );

        if (!available) {
            throw new ConflictException(
                    "The selected appointment slot is not available"
            );
        }

        Doctor doctor = appointment.getDoctor();
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
                "APPOINTMENT"
        );

        notificationService.create(
                appointment.getDoctor().getUser(),
                NotificationType.APPOINTMENT_RESCHEDULED,
                "Appointment Rescheduled",
                "Your appointment with "
                + appointment.getPatient().getUser().getFirstName()
                + " "
                + appointment.getPatient().getUser().getLastName()
                + "has been rescheduled. Please check your new appointment date",
                appointment.getId(),
                "APPOINTMENT"
        );
        notificationService.create(
                appointment.getAssistant().getUser(),
                NotificationType.APPOINTMENT_RESCHEDULED,
                "Appointment Rescheduled",
                "The appointment you are assigned to it has been rescheduled. Please check your new appointment date",
                appointment.getId(),
                "APPOINTMENT"
        );
        auditLogService.log(
                currentUser,
                AuditLogAction.RESCHEDULE,
                "APPOINTMENT",
                appointment.getId(),
                "The patient" + currentUser.getFullName() + "rescheduled the appoinment with Dr." + appointment.getDoctor().getUser().getFullName()
                + "and assistant" + appointment.getAssistant().getUser().getFullName()
                + "to new date" + saved.getAppointmentDate()
                + "starting at" + saved.getStartTime()
                + "."
        );
        return appointmentMapper.map(saved);
    }

    @Transactional
    public AppointmentCancellationResponse cancelAppointment(UUID id, AppointmentCancellationRequest request) {

        Patient patient = getCurrentPatient();
        User currentUser = patient.getUser();

        Appointment appointment = appointmentRepository.findByIdAndPatient(id, patient)
                .orElseThrow(() -> new AppointmentNotFoundException("Appointment not found"));

        appointment.setStatus(AppointmentStatus.CANCELLED);
        appointment.setCancelledBy(currentUser);
        appointment.setCancelReason(request.cancelReason());
        appointment.setCancelledAt(LocalDateTime.now());
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
                "APPOINTMENT"
        );

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
                "APPOINTMENT"
        );
        notificationService.create(
                appointment.getAssistant().getUser(),
                NotificationType.APPOINTMENT_CANCELLED,
                "Appointment Cancelled",
                "The appointment with Dr. "
                + appointment.getDoctor().getUser().getFullName()
                + "and" + appointment.getPatient().getUser().getFullName()
                + " has been cancelled .",
                appointment.getId(),
                "APPOINTMENT"
        );
        auditLogService.log(
                currentUser,
                AuditLogAction.CANCEL,
                "APPOINTMENT",
                appointment.getId(),
                currentUser.getFullName() + "cancelled the appoinment between Dr." + appointment.getDoctor().getUser().getFullName()
                + "and assistant" + appointment.getAssistant().getUser().getFullName() + "for patient" + appointment.getPatient().getUser().getFullName()
                + "."
        );
        return new AppointmentCancellationResponse(
                request.cancelReason(),
                LocalDateTime.now(),
                currentUser,
                currentUser.getRole(),
                currentUser.getEmail()
        );
    }
}
