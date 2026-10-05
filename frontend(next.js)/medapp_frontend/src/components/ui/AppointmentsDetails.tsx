"use client";

import { capitalizeName } from "@/lib/capitalizeName";
import { Appointment } from "@/types/appointment";
import {
  FiArrowLeft,
  FiCalendar,
  FiClock,
  FiMail,
  FiMapPin,
  FiPhone,
  FiUser,
  FiFileText,
  FiCheckCircle,
  FiXCircle,
  FiRotateCw,
} from "react-icons/fi";

interface Props {
  appointment: Appointment;

  onBack: () => void;
  onReschedule: () => void;
  onComplete: () => void;
  onNoShow: () => void;
  onCancel: () => void;
}

export default function AssistantAppointmentDetails({
  appointment,
  onBack,
  onReschedule,
  onComplete,
  onNoShow,
  onCancel,
}: Props) {
  const badgeColor = {
    CONFIRMED: "bg-blue-100 text-blue-700",
    COMPLETED: "bg-green-100 text-green-700",
    CANCELLED: "bg-red-100 text-red-700",
    NO_SHOW: "bg-yellow-100 text-yellow-700",
  };

  const start = appointment.startTime.substring(0, 5);

  const end = (() => {
    const [h, m] = appointment.startTime.split(":").map(Number);

    const total = h * 60 + m + appointment.doctor.consultationDuration;

    const hour = Math.floor(total / 60)
      .toString()
      .padStart(2, "0");

    const minute = (total % 60).toString().padStart(2, "0");

    return `${hour}:${minute}`;
  })();

  const canManage = appointment.status === "CONFIRMED";

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* HEADER */}

      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={onBack}
            aria-label="Back"
            className="flex items-center gap-2 bg-gradient-to-r from-indigo-900 to-blue-500 hover:bg-gradient-to-r from-indigo-900 to-blue-700 text-white px-4 py-2 rounded-lg mb-4"
          >
            <FiArrowLeft aria-hidden="true" />
            Back
          </button>

          <h1 className="text-3xl font-bold">Appointment Details</h1>

          <p className="text-gray-500 mt-1">#{appointment.id}</p>
        </div>

        <span
          className={`px-4 py-2 rounded-full font-semibold ${
            badgeColor[appointment.status as keyof typeof badgeColor] ??
            "bg-gray-100 text-gray-700"
          }`}
        >
          {appointment.status}
        </span>
      </div>

      {/* ACTIONS */}

      {canManage && (
        <div className="bg-white border rounded-xl p-4 flex flex-wrap gap-3">
          <button
            onClick={onReschedule}
            aria-label="Reschedule"
            className="flex items-center gap-2 px-4 py-2 rounded-lg border hover:bg-gray-50"
          >
            <FiRotateCw aria-hidden="true" />
            Reschedule
          </button>

          <button
            onClick={onComplete}
            aria-label="Mark Completed"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-900 to-green-500 text-white"
          >
            <FiCheckCircle aria-hidden="true" />
            Mark Completed
          </button>

          <button
            onClick={onNoShow}
            aria-label="Mark No Show"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-amber-900 to-orange-500 text-white"
          >
            <FiUser aria-hidden="true" />
            No Show
          </button>

          <button
            onClick={onCancel}
            aria-label="Cancel"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-red-900 to-red-500 text-white"
          >
            <FiXCircle aria-hidden="true" />
            Cancel
          </button>
        </div>
      )}

      {/* INFO */}

      <div className="grid md:grid-cols-3 gap-5">
        <div className="bg-white rounded-xl border p-5">
          <div className="flex items-center gap-2 mb-2">
            <FiCalendar />
            <span className="font-semibold">Date</span>
          </div>

          <p>{appointment.appointmentDate}</p>
        </div>

        <div className="bg-white rounded-xl border p-5">
          <div className="flex items-center gap-2 mb-2">
            <FiClock />
            <span className="font-semibold">Time</span>
          </div>

          <p>
            {start} - {end}
          </p>
        </div>

        <div className="bg-white rounded-xl border p-5">
          <div className="flex items-center gap-2 mb-2">
            <FiClock />
            <span className="font-semibold">Duration</span>
          </div>

          <p>{appointment.doctor.consultationDuration} min</p>
        </div>
      </div>

      {/* PATIENT */}

      <div className="bg-white rounded-xl border p-6">
        <h2 className="text-xl font-semibold mb-5 flex items-center gap-2">
          <FiUser />
          Patient
        </h2>

        <div className="grid md:grid-cols-2 gap-5">
          <div>
            <p className="text-gray-500 text-sm">Full Name</p>

            <p className="font-medium">
              {capitalizeName(appointment.patient.firstName)}{" "}
              {capitalizeName(appointment.patient.lastName)}
            </p>
          </div>

          <div>
            <p className="text-gray-500 text-sm">Email</p>

            <p className="flex items-center gap-2">
              <FiMail />
              {appointment.patient.email}
            </p>
          </div>

          <div>
            <p className="text-gray-500 text-sm">Phone</p>

            <p className="flex items-center gap-2">
              <FiPhone />
              {appointment.patient.phone}
            </p>
          </div>

          <div>
            <p className="text-gray-500 text-sm">Address</p>

            <p className="flex items-center gap-2">
              <FiMapPin />
              {appointment.patient.address}
            </p>
          </div>
        </div>
      </div>

      {/* DOCTOR */}

      <div className="bg-white rounded-xl border p-6">
        <h2 className="text-xl font-semibold mb-5">Doctor</h2>

        <div className="grid md:grid-cols-2 gap-5">
          <div>
            <p className="text-gray-500 text-sm">Doctor</p>

            <p className="font-medium">
              Dr. {capitalizeName(appointment.doctor.firstName)}{" "}
              {capitalizeName(appointment.doctor.lastName)}
            </p>
          </div>

          <div>
            <p className="text-gray-500 text-sm">Specialty</p>

            <p>{appointment.doctor.specialty}</p>
          </div>
        </div>
      </div>

      {/* REASON */}

      <div className="bg-white rounded-xl border p-6">
        <h2 className="text-xl font-semibold mb-5 flex items-center gap-2">
          <FiFileText />
          Reason
        </h2>

        <p className="text-gray-700 whitespace-pre-wrap">
          {appointment.reason || "No reason provided."}
        </p>
      </div>
    </div>
  );
}
