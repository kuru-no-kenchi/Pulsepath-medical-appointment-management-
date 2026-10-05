package com.phantom.medapp_backend.appointment;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.phantom.medapp_backend.doctor.Doctor;
import com.phantom.medapp_backend.patient.Patient;

public interface AppointmentRepository extends JpaRepository<Appointment, UUID> {

    boolean existsByDoctorAndAppointmentDateAndStartTime(Doctor doctor, LocalDate appointmentDate,
            LocalTime startTime, AppointmentStatus status);

    List<Appointment> findByPatient(Patient patient);

    List<Appointment> findByDoctorOrderByAppointmentDateDescStartTimeDesc(Doctor doctor);

    List<Appointment> findByAssistantIdOrderByAppointmentDateDescStartTimeDesc(UUID assistantId);

    List<Appointment> findByDoctorAndAppointmentDateAndStatusNot(Doctor doctor, LocalDate appointmentDate,
            AppointmentStatus status);

    List<Appointment> findByDoctorAndAppointmentDateOrderByStartTimeDesc(Doctor doctor, LocalDate appointmentDate);

    @Override
    Optional<Appointment> findById(UUID id);

    List<Appointment> findByStatus(AppointmentStatus status);

    List<Appointment> findByDoctorId(UUID doctorId);

    List<Appointment> findByPatientId(UUID patientId);

    long countByStatus(AppointmentStatus status);

    long countByAppointmentDate(LocalDate appointmentDate);

    Optional<Appointment> findByIdAndDoctorId(UUID appointmentId, UUID id);

        Optional<Appointment> findByIdAndPatient(UUID appointmentId, Patient patient);

    List<Appointment> findByDoctorInAndAppointmentDate(List<Doctor> doctors, LocalDate today);

    List<Appointment> findByDoctorInAndAppointmentDateOrderByStartTimeDesc(List<Doctor> doctors,
            LocalDate appointmentDate);

    Optional<Appointment> findFirstByPatientAndStatusAndAppointmentDateGreaterThanEqualOrderByAppointmentDateDescStartTimeDesc(
            Patient patient,
            AppointmentStatus status,
            LocalDate date
    );

    long countByPatient(Patient patient);

    List<Appointment> findByAppointmentDateBetween(
            LocalDate startDate,
            LocalDate endDate
    );

    long countByPatientAndStatus(
            Patient patient,
            AppointmentStatus status
    );

    List<Appointment> findByPatientAndStatusAndAppointmentDateGreaterThanEqualOrderByAppointmentDateDescStartTimeDesc(
            Patient patient,
            AppointmentStatus status,
            LocalDate date
    );

    List<Appointment> findTop5ByPatientAndStatusOrderByAppointmentDateDescStartTimeDesc(
            Patient patient,
            AppointmentStatus status
    );

    Optional<Appointment> findByPatientIdAndDoctorId(UUID patient_id, UUID doctor_id);
}
