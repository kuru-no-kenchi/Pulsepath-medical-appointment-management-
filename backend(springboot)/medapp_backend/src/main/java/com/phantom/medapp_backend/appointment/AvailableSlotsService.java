package com.phantom.medapp_backend.appointment;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.phantom.medapp_backend.doctor.Doctor;
import com.phantom.medapp_backend.doctor.DoctorRepository;
import com.phantom.medapp_backend.doctorschedule.DoctorSchedule;
import com.phantom.medapp_backend.doctorschedule.DoctorScheduleRepository;
import com.phantom.medapp_backend.exception.DoctorNotFoundException;
import com.phantom.medapp_backend.exception.ScheduleNotFoundException;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AvailableSlotsService {

    private final DoctorScheduleRepository doctorScheduleRepository;
    private final AppointmentRepository appointmentRepository;
    private final DoctorRepository doctorRepository;

    public List<LocalTime> generateAvailableSlots(
            Doctor doctor,
            LocalDate date,
            int durationMinutes,
            UUID excludeAppointmentId
    ) {

        DayOfWeek day = date.getDayOfWeek();

        List<DoctorSchedule> schedules
                = doctorScheduleRepository
                        .findByDoctorAndDayOfWeek(doctor, day);

        List<Appointment> appointments
                = appointmentRepository
                        .findByDoctorAndAppointmentDateAndStatusNot(
                                doctor,
                                date,
                                AppointmentStatus.CANCELLED
                        );

        List<LocalTime> availableSlots = new ArrayList<>();

        for (DoctorSchedule schedule : schedules) {

            LocalTime slotStart = schedule.getStartTime();
            LocalTime scheduleEnd = schedule.getEndTime();

            while (!slotStart
                    .plusMinutes(durationMinutes)
                    .isAfter(scheduleEnd)) {

                LocalTime slotEnd
                        = slotStart.plusMinutes(durationMinutes);

                final LocalTime currentStart = slotStart;
                final LocalTime currentEnd = slotEnd;

                boolean overlapping = appointments.stream()
                        .filter(appointment
                                -> excludeAppointmentId == null
                        || !appointment.getId()
                                .equals(excludeAppointmentId)
                        )
                        .anyMatch(appointment -> {

                            LocalTime appointmentStart
                                    = appointment.getStartTime();

                            LocalTime appointmentEnd
                                    = appointment.getEndTime();
                            return currentStart.isBefore(appointmentEnd)
                                    && currentEnd.isAfter(appointmentStart);
                        });

                if (!overlapping) {
                    availableSlots.add(slotStart);
                }

                slotStart
                        = slotStart.plusMinutes(durationMinutes);
            }
        }

        return availableSlots;
    }

    public boolean isSlotAvailable(
            Doctor doctor,
            LocalDate date,
            LocalTime startTime,
            int durationMinutes,
            UUID excludeAppointmentId
    ) {
        List<DoctorSchedule> schedules
                = doctorScheduleRepository.findByDoctorAndDayOfWeek(doctor, date.getDayOfWeek());

        if (schedules == null || schedules.isEmpty()) {
            throw new ScheduleNotFoundException(
                    "No schedule found for Dr. " + doctor.getUser().getFullName()
                    + " on " + date
            );
        }

        List<LocalTime> availableSlots
                = generateAvailableSlots(doctor, date, durationMinutes, excludeAppointmentId);

        return availableSlots.contains(startTime);
    }

    public List<LocalTime> getAvailableSlots(
            UUID doctorId,
            LocalDate date
    ) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new DoctorNotFoundException("Doctor not found"));

        return generateAvailableSlots(
                doctor,
                date,
                doctor.getConsultationDuration(),
                null
        );
    }
}
