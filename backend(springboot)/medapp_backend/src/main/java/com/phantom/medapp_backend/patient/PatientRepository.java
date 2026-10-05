package com.phantom.medapp_backend.patient;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.phantom.medapp_backend.doctor.Doctor;
import com.phantom.medapp_backend.user.User;

public interface PatientRepository extends JpaRepository<Patient, UUID> {

    Optional<Patient> findByUser(User user);

    Optional<Patient> findByUserEmail(String email);

    @Query("""
SELECT DISTINCT a.doctor
FROM Appointment a
WHERE a.patient = :patient
AND a.status = 'COMPLETED'
""")
List<Doctor> findVisitedDoctors(Patient patient);
}
