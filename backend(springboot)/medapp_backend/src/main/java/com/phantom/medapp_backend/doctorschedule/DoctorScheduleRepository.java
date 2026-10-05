package com.phantom.medapp_backend.doctorschedule;

import org.springframework.data.jpa.repository.JpaRepository;

import com.phantom.medapp_backend.doctor.Doctor;

import java.util.UUID;
import java.time.DayOfWeek;
import java.util.List;

public interface DoctorScheduleRepository extends JpaRepository<DoctorSchedule, UUID>{

    List<DoctorSchedule> findByDoctor(Doctor doctor);
    List<DoctorSchedule> findByDoctorAndDayOfWeek(Doctor doctor, DayOfWeek dayOfWeek);
}
