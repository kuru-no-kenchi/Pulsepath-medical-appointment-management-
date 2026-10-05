import {
  FiArrowLeft,
  FiCalendar,
  FiClock,
  FiUser,
  FiUsers,
} from "react-icons/fi";
import { Appointment } from "@/types/appointment";
import { capitalizeName } from "@/lib/capitalizeName";


interface Props {
  appointment: Appointment;
  onBack: () => void;
}

export default function AppointmentDetailsView({ appointment, onBack }: Props) {

  const badgeColor = {
    CONFIRMED: "bg-blue-100 text-blue-700",
    COMPLETED: "bg-green-100 text-green-700",
    CANCELLED: "bg-red-100 text-red-700",
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}

      <div className="flex items-start justify-between">
        <div>
          <button
            onClick={onBack}
            aria-label="Back"
            className="flex items-center gap-2 bg-gradient-to-r from-indigo-900 to-blue-500 hover:bg-blue-700 text-white px-4 py-2 rounded-lg mb-4"
          >
            <FiArrowLeft aria-hidden="true"/>
            Back
          </button>

          <h1 className="text-3xl font-bold">Appointment Details</h1>
          <p className="text-gray-500 mt-1">#{appointment.id}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow border p-6">
        <div className="flex items-center gap-2 mb-4">
          <FiUser className="text-blue-600" />
          <h2 className="font-semibold text-lg">Doctor</h2>
        </div>
        <div className="space-y-1">
          <p className="font-medium text-lg">
            Dr. {capitalizeName(appointment.doctor.firstName)} {capitalizeName(appointment.doctor.lastName)}
          </p>
          <p className="text-gray-500">{appointment.doctor.specialty}</p>
          <p>{appointment.doctor.email}</p>
          <p>{appointment.doctor.phone}</p>
        </div>
      </div>


      <div className="bg-white rounded-xl shadow border p-6">
        <div className="flex items-center gap-2 mb-4">
          <FiUsers className="text-green-600" />
          <h2 className="font-semibold text-lg">Patient</h2>
        </div>
        <div className="space-y-1">
          <p className="font-medium text-lg">
            {capitalizeName(appointment.patient.firstName)} {capitalizeName(appointment.patient.lastName)}
          </p>
          <p>{appointment.patient.email}</p>
          <p>{appointment.patient.phone}</p>
          <p>{appointment.patient.address}</p>
        </div>
      </div>

      {/* Assistant */}

      <div className="bg-white rounded-xl shadow border p-6">
        <div className="flex items-center gap-2 mb-4">
          <FiUsers className="text-purple-600" />
          <h2 className="font-semibold text-lg">Assistant</h2>
        </div>
        {appointment.assistant ? (
          <div className="space-y-1">
            <p className="font-medium text-lg">
              {capitalizeName(appointment.assistant.firstName)} {capitalizeName(appointment.assistant.lastName)}
            </p>
            <p>{appointment.assistant.email}</p>
            <p>{appointment.assistant.phone}</p>
          </div>
        ) : (
          <p className="italic text-gray-500">No assistant assigned</p>
        )}
      </div>

      {/* Status */}

      <div className="bg-white rounded-xl shadow border p-6">
        <h2 className="font-semibold text-lg mb-4">Appointment Status</h2>
        <span
          className={`px-4 py-2 rounded-full font-medium ${
            badgeColor[appointment.status as keyof typeof badgeColor]
          }`}
        >
          {appointment.status}
        </span>
      </div>
      {/* Schedule */}

      <div className="bg-white rounded-xl shadow border p-6">
        <div className="flex items-center gap-2 mb-4">
          <FiCalendar className="text-orange-600" />
          <h2 className="font-semibold text-lg">Schedule</h2>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm text-gray-500 mb-2">
              Appointment Date
            </label>
            <p className="font-medium">{appointment.appointmentDate}</p>
          </div>

          <div>
            <label className="block text-sm text-gray-500 mb-2">
              Start Time
            </label>
            <div className="flex items-center gap-2">
              <FiClock />
              <span className="font-medium">{appointment.startTime}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Reason */}

      <div className="bg-white rounded-xl shadow border p-6">
        <h2 className="font-semibold text-lg mb-4">Reason</h2>
        <p className="whitespace-pre-wrap text-gray-700">
          {appointment.reason || "No reason provided"}
        </p>
      </div>
    </div>
  );
}