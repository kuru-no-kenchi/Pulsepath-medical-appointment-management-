import { useState } from "react";
import {
  FiArrowLeft,
  FiCalendar,
  FiClock,
  FiUser,
  FiUsers,
  FiEdit2,
  FiTrash2,
  FiSave,
} from "react-icons/fi";
import { Appointment } from "@/types/appointment";
import {
  useAppoinmentsByAdmin,
  useAssistantsByAdmin,
  useDoctorsByAdmin,
  usePatientsByAdmin,
} from "@/hooks/useAdmin";
import { useAppointmentsByAdminMutations } from "@/mutations/useAdminMutations";
import { toast } from "sonner";
import { capitalizeName } from "@/lib/capitalizeName";
import RoundedSelect from "./RoundedSelect";

interface Props {
  appointment: Appointment;
  onBack: () => void;
  onDelete: () => Promise<void>;
  onUpdated: (appointment: Appointment) => void;
}

function getAppointmentFormData(appointment: Appointment) {
  return {
    doctorId: appointment.doctor.id,
    assistantId: appointment.assistant?.id ?? "",
    patientId: appointment.patient.id,
    appointmentDate: appointment.appointmentDate,
    startTime: appointment.startTime,
    reason: appointment.reason ?? "",
    status: appointment.status,
  };
}

export default function AppointmentDetailsPage({
  appointment,
  onBack,
  onDelete,
  onUpdated,
}: Props) {
  const { data: patients = [] } = usePatientsByAdmin();
  const { data: doctors = [] } = useDoctorsByAdmin();
  const { data: assistants = [] } = useAssistantsByAdmin();
  const { data: appointments = [] } = useAppoinmentsByAdmin();
  const { updateAppointment } = useAppointmentsByAdminMutations();
  const [editing, setEditing] = useState(false);
  const [formOverride, setFormOverride] = useState<{
    appointment: Appointment;
    values: ReturnType<typeof getAppointmentFormData>;
  } | null>(null);

  const formData =
    formOverride?.appointment === appointment
      ? formOverride.values
      : getAppointmentFormData(appointment);
  const saving = updateAppointment.isPending;

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;

    setFormOverride({
      appointment,
      values: {
        ...formData,
        [name]: value,
      },
    });
  };

  const save = async () => {
    try {
      toast.promise(
        updateAppointment.mutateAsync({
          id: appointment.id,
          appointment: formData,
        }),
        {
          loading: "Updating appointment...",
          success: "Appointment updated successfully.",
          error: "Unable to update appointment.",
        },
      );
      const updated = appointments.find((a) => a.id === appointment.id);
      if (updated) {
        onUpdated(updated);
      }
      setEditing(false);
    } finally {
    }
  };

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
            <FiArrowLeft aria-hidden="true" />
            Back
          </button>

          <h1 className="text-3xl font-bold">Appointment Details</h1>

          <p className="text-gray-500 mt-1">#{appointment.id}</p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setEditing(!editing)}
            aria-label={`${editing ? "Cancel" : "Edit"}`}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg transition text-right
              ${
                editing
                  ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  : "bg-gradient-to-r from-indigo-900 to-blue-500 text-white hover:bg-blue-700"
              }`}
          >
            <FiEdit2 aria-hidden="true" />

            {editing ? "Cancel" : "Edit"}
          </button>

          {editing && (
            <button
              onClick={save}
              aria-label={`${saving ? "Saving..." : "Save"}`}
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 transition"
            >
              <FiSave aria-hidden="true" />

              {saving ? "Saving..." : "Save"}
            </button>
          )}
        </div>
      </div>
      {/* Doctor */}

      <div className="bg-white rounded-xl shadow border p-6">
        <div className="flex items-center gap-2 mb-4">
          <FiUser className="text-blue-600" />
          <h2 className="font-semibold text-lg">Doctor</h2>
        </div>

        {editing ? (
          <RoundedSelect
            value={formData.doctorId}
            placeholder="Select Doctor"
            options={doctors.map((doctor) => ({
              value: doctor.id,
              label: `Dr. ${capitalizeName(doctor.firstName)} ${capitalizeName(doctor.lastName)} - ${doctor.specialty}`,
            }))}
            onChange={(value) =>
              setFormOverride({
                appointment,
                values: { ...formData, doctorId: value },
              })
            }
          />
        ) : (
          <div className="space-y-1">
            <p className="font-medium text-lg">
              Dr. {capitalizeName(appointment.doctor.firstName)}{" "}
              {capitalizeName(appointment.doctor.lastName)}
            </p>

            <p className="text-gray-500">{appointment.doctor.specialty}</p>

            <p>{appointment.doctor.email}</p>

            <p>{appointment.doctor.phone}</p>
          </div>
        )}
      </div>

      {/* Patient */}

      <div className="bg-white rounded-xl shadow border p-6">
        <div className="flex items-center gap-2 mb-4">
          <FiUsers className="text-green-600" />
          <h2 className="font-semibold text-lg">Patient</h2>
        </div>

        {editing ? (
          <RoundedSelect
            value={formData.patientId}
            placeholder="Select Patient"
            options={patients.map((patient) => ({
              value: patient.id,
              label: `${capitalizeName(patient.firstName)} ${capitalizeName(patient.lastName)}`,
            }))}
            onChange={(value) =>
              setFormOverride({
                appointment,
                values: { ...formData, patientId: value },
              })
            }
          />
        ) : (
          <div className="space-y-1">
            <p className="font-medium text-lg">
              {capitalizeName(appointment.patient.firstName)}{" "}
              {capitalizeName(appointment.patient.lastName)}
            </p>

            <p>{appointment.patient.email}</p>

            <p>{appointment.patient.phone}</p>

            <p>{appointment.patient.address}</p>
          </div>
        )}
      </div>

      {/* Assistant */}

      <div className="bg-white rounded-xl shadow border p-6">
        <div className="flex items-center gap-2 mb-4">
          <FiUsers className="text-purple-600" />
          <h2 className="font-semibold text-lg">Assistant</h2>
        </div>

        {editing ? (
          <RoundedSelect
            value={formData.assistantId}
            placeholder="No Assistant"
            options={assistants.map((assistant) => ({
              value: assistant.id,
              label: `${capitalizeName(assistant.firstName)} ${capitalizeName(assistant.lastName)}`,
            }))}
            onChange={(value) =>
              setFormOverride({
                appointment,
                values: { ...formData, assistantId: value },
              })
            }
          />
        ) : appointment.assistant ? (
          <div className="space-y-1">
            <p className="font-medium text-lg">
              {capitalizeName(appointment.assistant.firstName)}{" "}
              {capitalizeName(appointment.assistant.lastName)}
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

        {editing ? (
          <RoundedSelect
            value={formData.status}
            placeholder="Select Status"
            options={[
              { value: "CONFIRMED", label: "CONFIRMED" },
              { value: "COMPLETED", label: "COMPLETED" },
              { value: "CANCELLED", label: "CANCELLED" },
            ]}
            onChange={(value) => {
              if (
                value === "CONFIRMED" ||
                value === "NO_SHOW" ||
                value === "COMPLETED" ||
                value === "CANCELLED"
              ) {
                setFormOverride({
                  appointment,
                  values: { ...formData, status: value },
                });
              }
            }}
          />
        ) : (
          <span
            className={`px-4 py-2 rounded-full font-medium ${
              badgeColor[appointment.status as keyof typeof badgeColor]
            }`}
          >
            {appointment.status}
          </span>
        )}
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

            {editing ? (
              <input
                type="date"
                name="appointmentDate"
                value={formData.appointmentDate}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2"
              />
            ) : (
              <p className="font-medium">{appointment.appointmentDate}</p>
            )}
          </div>

          <div>
            <label className="block text-sm text-gray-500 mb-2">
              Start Time
            </label>

            {editing ? (
              <input
                type="time"
                name="startTime"
                value={formData.startTime}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2"
              />
            ) : (
              <div className="flex items-center gap-2">
                <FiClock />

                <span className="font-medium">{appointment.startTime}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reason */}

      <div className="bg-white rounded-xl shadow border p-6">
        <h2 className="font-semibold text-lg mb-4">Reason</h2>

        {editing ? (
          <textarea
            rows={5}
            name="reason"
            value={formData.reason}
            onChange={handleChange}
            className="w-full border rounded-lg p-3 resize-none"
          />
        ) : (
          <p className="whitespace-pre-wrap text-gray-700">
            {appointment.reason || "No reason provided"}
          </p>
        )}
      </div>

      {/* Footer */}

      <div className="flex justify-end gap-4">
        <button
          onClick={onDelete}
          className="flex items-center gap-2 border border-red-500 text-red-600 hover:bg-red-50 px-5 py-2 rounded-lg"
        >
          <FiTrash2 />
          Delete
        </button>
      </div>
    </div>
  );
}
