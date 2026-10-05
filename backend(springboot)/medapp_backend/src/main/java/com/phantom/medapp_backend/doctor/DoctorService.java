package com.phantom.medapp_backend.doctor;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.phantom.medapp_backend.appointment.Appointment;
import com.phantom.medapp_backend.appointment.AppointmentMapper;
import com.phantom.medapp_backend.appointment.AppointmentRepository;
import com.phantom.medapp_backend.appointment.AppointmentStatus;
import com.phantom.medapp_backend.appointment.dto.AppointmentDetailResponse;
import com.phantom.medapp_backend.appointment.dto.AppointmentResponse;
import com.phantom.medapp_backend.appointment.dto.AppointmentSummaryResponse;
import com.phantom.medapp_backend.assistant.Assistant;
import com.phantom.medapp_backend.assistant.AssistantRepository;
import com.phantom.medapp_backend.auditlog.AuditLogAction;
import com.phantom.medapp_backend.auditlog.AuditLogService;
import com.phantom.medapp_backend.doctor.dto.DoctorAssistantResponse;
import com.phantom.medapp_backend.doctor.dto.DoctorDashboardResponse;
import com.phantom.medapp_backend.doctor.dto.DoctorPatientResponse;
import com.phantom.medapp_backend.doctor.dto.DoctorRequest;
import com.phantom.medapp_backend.doctor.dto.DoctorResponse;
import com.phantom.medapp_backend.doctorschedule.DoctorScheduleRepository;
import com.phantom.medapp_backend.doctorschedule.dto.DoctorScheduleResponse;
import com.phantom.medapp_backend.exception.AppointmentNotFoundException;
import com.phantom.medapp_backend.exception.AssistantNotFoundException;
import com.phantom.medapp_backend.exception.DoctorNotFoundException;
import com.phantom.medapp_backend.exception.PatientNotFoundException;
import com.phantom.medapp_backend.patient.Patient;
import com.phantom.medapp_backend.patient.PatientMapper;
import com.phantom.medapp_backend.patient.dto.PatientResponse;
import com.phantom.medapp_backend.user.User;
import com.phantom.medapp_backend.user.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class DoctorService {

    private final DoctorRepository doctorRepository;
    private final UserRepository userRepository;
    private final AppointmentRepository appointmentRepository;
    private final AppointmentMapper appointmentMapper;
    private final AssistantRepository assistantRepository;
    private final DoctorScheduleRepository doctorScheduleRepository;
    private final DoctorMapper doctorMapper;
    private final PatientMapper patientMapper;
    private final AuditLogService auditLogService;

    private Doctor getCurrentDoctor() {
        String email = SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();

        User user = userRepository.findUserByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return doctorRepository.findByUser(user)
                .orElseThrow(() -> new DoctorNotFoundException("Doctor not found"));
    }

    public DoctorDashboardResponse getDashboard() {

        Doctor doctor = getCurrentDoctor();

        List<Appointment> appointments
                = appointmentRepository.findByDoctorId(doctor.getId());

        LocalDate today = LocalDate.now();

        long todayAppointments = appointments.stream()
                .filter(a -> a.getAppointmentDate().equals(today))
                .count();

        long remainingAppointments = doctorRepository.countRemainingAppointments(doctor.getId(), today);

        long completedAppointments = appointments.stream()
                .filter(a -> a.getStatus() == AppointmentStatus.COMPLETED)
                .count();

        long totalPatients = appointments.stream()
                .map(a -> a.getPatient().getId())
                .distinct()
                .count();

        return new DoctorDashboardResponse(
                todayAppointments,
                completedAppointments,
                remainingAppointments,
                totalPatients
        );
    }

    public List<AppointmentResponse> getAppointments() {

        Doctor doctor = getCurrentDoctor();

        return appointmentRepository.findByDoctorId(doctor.getId())
                .stream()
                .map(appointmentMapper::map)
                .toList();
    }

    public DoctorResponse getProfile() {
        Doctor doctor = getCurrentDoctor();
        return doctorMapper.map(doctor);
    }

    public AppointmentDetailResponse getAppointmentDetails(UUID appointmentId) {

        Doctor doctor = getCurrentDoctor();

        Appointment appointment;
        appointment = appointmentRepository
                .findByIdAndDoctorId(
                        appointmentId,
                        doctor.getId())
                .orElseThrow(()
                        -> new AppointmentNotFoundException("Appointment not found"));

        return new AppointmentDetailResponse(
                appointment.getId(),
                appointment.getDoctor(),
                appointment.getAssistant(),
                appointment.getPatient(),
                appointment.getAppointmentDate(),
                appointment.getStartTime(),
                appointment.getReason(),
                appointment.getStatus(),
                appointment.getNotes()
        );
    }

    public DoctorResponse updateProfile(DoctorRequest request) {

        Doctor doctor = getCurrentDoctor();

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
        if (request.getPhotoUrl() != null) {
            user.setPhotoUrl(request.getPhotoUrl());
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
        auditLogService.log(
                user,
                AuditLogAction.UPDATE,
                "DOCTOR",
                user.getId(),
                user.getFullName() + "updated profile"
        );
        return doctorMapper.map(updatedDoctor);
    }

    public List<PatientResponse> getPatients() {

        Doctor doctor = getCurrentDoctor();

        return doctorRepository
                .findPatientsByDoctor(doctor.getId())
                .stream()
                .map(patientMapper::map)
                .toList();
    }

    public DoctorPatientResponse getPatientDetails(UUID patientId) {

        Doctor doctor = getCurrentDoctor();

        List<Appointment> appointments
                = doctorRepository.findByDoctorIdAndPatientId(
                        doctor.getId(),
                        patientId
                );

        if (appointments.isEmpty()) {
            throw new PatientNotFoundException("Patient not found");
        }

        Patient patient = appointments.get(0).getPatient();

        List<AppointmentSummaryResponse> history
                = appointments.stream()
                        .map(a -> new AppointmentSummaryResponse(
                        a.getId(),
                        a.getAppointmentDate(),
                        a.getStartTime(),
                        a.getStatus(),
                        a.getReason(),
                        a.getNotes()
                ))
                        .toList();

        return new DoctorPatientResponse(
                patient.getId(),
                patient.getUser().getFirstName(),
                patient.getUser().getLastName(),
                patient.getUser().getEmail(),
                patient.getUser().getPhone(),
                patient.getUser().getPhotoUrl(),
                patient.getAddress(),
                patient.getDateOfBirth(),
                patient.getGender(),
                patient.getEmergencyContact(),
                history
        );
    }

    public DoctorAssistantResponse getAssignedAssistant() {

        Doctor doctor = getCurrentDoctor();

        Assistant assistant = assistantRepository.findByDoctorsContains(doctor)
                .orElseThrow(() -> new AssistantNotFoundException("This doctor does not have an assigned assistant"));

        return new DoctorAssistantResponse(
                assistant.getId(),
                assistant.getUser().getFirstName(),
                assistant.getUser().getLastName(),
                assistant.getUser().getEmail(),
                assistant.getUser().getPhone()
        );
    }

    public List<AppointmentResponse> getMyAppointments() {

        Doctor doctor = getCurrentDoctor();

        return appointmentRepository.findByDoctorOrderByAppointmentDateDescStartTimeDesc(doctor).stream()
                .map(appointmentMapper::map).toList();
    }

    public List<AppointmentResponse> getTodayAppointments() {
        Doctor doctor = getCurrentDoctor();
        return appointmentRepository.findByDoctorAndAppointmentDateOrderByStartTimeDesc(doctor, LocalDate.now())
                .stream().map(appointmentMapper::map).toList();
    }

    public List<DoctorScheduleResponse> getSchedule() {

        Doctor doctor = getCurrentDoctor();

        return doctorScheduleRepository.findByDoctor(doctor)
                .stream()
                .map(s -> new DoctorScheduleResponse(
                s.getId(),
                s.getDayOfWeek(),
                s.getStartTime(),
                s.getEndTime()
        ))
                .toList();
    }
}
