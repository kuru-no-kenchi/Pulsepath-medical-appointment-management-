"use client";

import { Appointment } from "@/types/appointment";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { EventClickArg } from "@fullcalendar/core";
import { useState } from "react";
import { capitalizeName } from "@/lib/capitalizeName";

interface Props {
  appointments: Appointment[];
  onSelected: (appointment: Appointment) => void;
}

export default function ScheduleCalendar({ appointments, onSelected }: Props) {
  const events = appointments.map((appointment) => {
    const start = new Date(
      `${appointment.appointmentDate}T${appointment.startTime}`,
    );

    const end = new Date(start);

    end.setMinutes(end.getMinutes() + appointment.doctor.consultationDuration);

    const color =
      appointment.status === "CONFIRMED"
        ? "#2563eb"
        : appointment.status === "NO_SHOW"
          ? "#ff6600"
          : appointment.status === "COMPLETED"
            ? "#16a34a"
            : "#dc2626";

    return {
      id: appointment.id,

      title: `${capitalizeName(appointment.patient.firstName)} ${capitalizeName(appointment.patient.lastName)}`,

      start,

      end,

      backgroundColor: color,

      borderColor: color,

      extendedProps: {
        appointment,
      },
    };
  });

  const handleEventClick = (info: EventClickArg) => {
    const appointment = info.event.extendedProps.appointment;
    onSelected(appointment);
  };
  return (
    <div className="bg-white rounded-xl shadow-lg p-4">
      <FullCalendar
        plugins={[timeGridPlugin, dayGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        weekends={false}
        editable={false}
        selectable={true}
        allDaySlot={false}
        slotMinTime="09:00:00"
        slotMaxTime="18:00:00"
        nowIndicator={true}
        height="auto"
        events={events}
        eventClick={handleEventClick}
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "timeGridDay,timeGridWeek,dayGridMonth",
        }}
        dayHeaderFormat={{
          weekday: "short",
          month: "numeric",
          day: "numeric",
        }}
        slotLabelFormat={{
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }}
      />
    </div>
  );
}
