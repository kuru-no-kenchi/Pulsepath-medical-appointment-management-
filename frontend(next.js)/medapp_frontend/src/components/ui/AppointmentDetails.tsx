"use client";

import { capitalizeName } from "@/lib/capitalizeName";
import { Appointment } from "@/types/appointment";
import {
  FiCalendar,
  FiClock,
  FiMail,
  FiPhone,
  FiMapPin,
  FiUser,
  FiFileText,
  FiX,
} from "react-icons/fi";

interface Props {
  appointment: Appointment;
  onClose: () => void;
}

export default function AppointmentDetails({ appointment, onClose }: Props) {
  const badgeColor = {
    CONFIRMED: "bg-blue-100 text-blue-700",
    COMPLETED: "bg-green-100 text-green-700",
    CANCELLED: "bg-red-100 text-red-700",
    NO_SHOW: "bg-orange-100 text-orange-700",
  };

  const start = appointment.startTime.substring(0, 5);

  const end = (() => {
    const [hour, minute] = appointment.startTime.split(":").map(Number);

    const total = hour * 60 + minute + appointment.doctor.consultationDuration;

    const h = Math.floor(total / 60)
      .toString()
      .padStart(2, "0");

    const m = (total % 60).toString().padStart(2, "0");

    return `${h}:${m}`;
  })();

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Overlay */}

      <div className="flex-1 bg-black/30" onClick={onClose} />

      {/* Drawer */}

      <div
        className="
            w-[440px]
            h-full
            bg-white
            shadow-2xl
            flex
            flex-col
            animate-slide-in
        "
      >
        {/* HEADER */}

        <div className="sticky top-0 z-20 bg-white border-b px-6 py-5 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Appointment Details</h2>
            <p className="text-gray-500 mt-1">#{appointment.id}</p>
          </div>

          <div className="flex items-center gap-4">
            <span
              className={`px-4 py-2 rounded-full text-sm font-semibold ${
                badgeColor[appointment.status as keyof typeof badgeColor] ??
                "bg-gray-100 text-gray-700"
              }`}
            >
              {appointment.status}
            </span>
            <button
              onClick={onClose}
              aria-label="Close"
              className="text-gray-500 hover:text-red-500 transition"
            >
              <FiX size={26} aria-hidden="true" />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          <div
            className={`rounded-xl p-4 space-y-3 ${
              badgeColor[appointment.status as keyof typeof badgeColor] ??
              "bg-gray-100 text-gray-700"
            }`}
          >
            <div className="flex items-center gap-2">
              <FiCalendar />
              <span>{appointment.appointmentDate}</span>
            </div>

            <div className="flex items-center gap-2">
              <FiClock />

              <span>
                {start} - {end}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <FiClock />

              <span>{appointment.doctor.consultationDuration} min</span>
            </div>
          </div>
          <div className="border rounded-xl p-6">
            <h3 className="text-xl font-semibold flex items-center gap-2 mb-5">
              <FiUser />
              Patient Info
            </h3>

            <div className="grid md:grid-cols-1 gap-5">
              <div>
                <p className="text-sm text-gray-500">Full Name</p>

                <p className="font-medium">
                  {capitalizeName(appointment.patient.firstName)}{" "}
                  {capitalizeName(appointment.patient.lastName)}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Email</p>

                <p className="flex items-center gap-2">
                  <FiMail />
                  {appointment.patient.email}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Phone</p>

                <p className="flex items-center gap-2">
                  <FiPhone />
                  {appointment.patient.phone}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Address</p>

                <p className="flex items-center gap-2">
                  <FiMapPin />
                  {appointment.patient.address}
                </p>
              </div>
            </div>
          </div>

          <div className="border rounded-xl p-6">
            <h3 className="text-xl font-semibold mb-5">Assistant Info</h3>

            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <p className="text-sm text-gray-500">Assistant</p>

                <p className="font-medium">
                  Dr. {capitalizeName(appointment.assistant?.firstName)}{" "}
                  {capitalizeName(appointment.assistant?.lastName)}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Phone</p>

                <p>{appointment.assistant?.phone}</p>
              </div>
            </div>
          </div>

          <div className="border rounded-xl p-6">
            <h3 className="text-xl font-semibold flex items-center gap-2 mb-5">
              <FiFileText />
              Reason
            </h3>

            <p className="text-gray-700 whitespace-pre-wrap">
              {appointment.reason || "No reason provided."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
