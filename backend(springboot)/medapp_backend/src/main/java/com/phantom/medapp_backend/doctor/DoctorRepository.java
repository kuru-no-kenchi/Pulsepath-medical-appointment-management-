package com.phantom.medapp_backend.doctor;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;

import com.phantom.medapp_backend.appointment.Appointment;
import com.phantom.medapp_backend.patient.Patient;
import com.phantom.medapp_backend.user.User;

import jakarta.persistence.LockModeType;

public interface DoctorRepository extends JpaRepository<Doctor, UUID> {

    Optional<Doctor> findByUserEmail(String email);

    Optional<Doctor> findByUser(User user);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select d from Doctor d where d.id = :id")
    Optional<Doctor> findByIdForUpdate(UUID id);

    @Override
    Optional<Doctor> findById(UUID id);

    @Query("""
            SELECT DISTINCT a.patient
            FROM Appointment a
            WHERE a.doctor.id = :id
            """)
    List<Patient> findPatientsByDoctor(UUID id);

    @Query("""
            SELECT a
            FROM Appointment a
            WHERE a.doctor.id = :doctorId AND a.patient.id = :patientId
            """)
    List<Appointment> findByDoctorIdAndPatientId(
            UUID doctorId,
            UUID patientId);

    @Query("""
        SELECT COUNT(a)
        FROM Appointment a
        WHERE a.doctor.id = :doctorId
          AND a.appointmentDate = :today
          AND a.status <> 'COMPLETED'
          AND a.status <> 'CANCELLED'
    """)
    long countRemainingAppointments(UUID doctorId, LocalDate today);
}
