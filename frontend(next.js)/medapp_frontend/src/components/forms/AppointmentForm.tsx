import { useEffect } from "react";
import {
  Appointment,
  AppointmentFormMode,
  AppointmentRequest,
  AppointmentRescheduleRequest,
} from "@/types/appointment";
import { toast } from "sonner";
import {
  useAssistant,
  useDoctorsByAssistant,
  usePatientsByAssistant,
} from "@/hooks/useAssistant";
import { Doctor } from "@/types/doctor";
import { Patient } from "@/types/patients";
import { Assistant } from "@/types/assistant";
import {
  useDoctorsByAdmin,
  useAssistantsByAdmin,
  usePatientsByAdmin,
} from "@/hooks/useAdmin";
import { useAppointmentsByAdminMutations } from "@/mutations/useAdminMutations";
import { useAppointmentsByAssistantMutations } from "@/mutations/useAssistantMutations";
import z from "zod";
import { appointmentSchema } from "@/schemas/appointment.schema";
import { useWatch, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { capitalizeName } from "@/lib/capitalizeName";
import DoctorAvailability from "../ui/DoctorAvailability";
import RoundedSelect from "../ui/RoundedSelect";
import { usePatientMutations } from "@/mutations/usePatientMutations";

type AppointmentForm = z.infer<typeof appointmentSchema>;

interface Props {
  open: boolean;
  mode: AppointmentFormMode;
  appointment?: Appointment;
  onClose: () => void;
  onSuccess: () => void;
}
function getLocalDateString() {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

const emptyForm = () => ({
  appointmentDate: getLocalDateString(),
  startTime: "",
  reason: "",
  doctorId: "",
  assistantId: "",
  patientId: "",
});

export default function AppointmentForm({
  open,
  mode,
  onClose,
  onSuccess,
  appointment,
}: Props) {
  const assistantMode = mode === "assistant_create" || mode === "reschedule";
  const { data: assistantDoctors = [] } = useDoctorsByAssistant();
  const { data: adminDoctors = [] } = useDoctorsByAdmin();
  const { data: assistantProfile } = useAssistant();
  const { data: adminAssistants = [] } = useAssistantsByAdmin();
  const { data: assistantPatients = [] } = usePatientsByAssistant();
  const { data: adminPatients = [] } = usePatientsByAdmin();
  const doctors = assistantMode ? assistantDoctors : adminDoctors;
  const assistants = assistantMode
    ? assistantProfile
      ? [assistantProfile]
      : []
    : adminAssistants;
  const patients = assistantMode ? assistantPatients : adminPatients;
  const { createAppointment, updateAppointment, cancelAppointment } =
    useAppointmentsByAdminMutations();
  const {
    createAppointmentByAssistant,
    cancelAppointmentByAssistant,
    rescheduleAppointment,
    markNoShow,
    markComplete,
  } = useAppointmentsByAssistantMutations();
  const { bookAppointment } = usePatientMutations();
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors },
  } = useForm<AppointmentForm>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: emptyForm(),
  });
  const selectedPatientId = useWatch({ control, name: "patientId" });
  const selectedDoctorId = useWatch({ control, name: "doctorId" });
  const selectedAppointmentDate = useWatch({
    control,
    name: "appointmentDate",
  });
  const selectedAssistantId = useWatch({ control, name: "assistantId" });
  const selectedStartTime = useWatch({ control, name: "startTime" });
  const isSaving =
    createAppointment.isPending ||
    updateAppointment.isPending ||
    cancelAppointment.isPending ||
    createAppointmentByAssistant.isPending ||
    cancelAppointmentByAssistant.isPending ||
    rescheduleAppointment.isPending ||
    markComplete.isPending ||
    markNoShow.isPending;
  useEffect(() => {
    if (!open) return;
    if (appointment) {
      reset({
        appointmentDate: appointment.appointmentDate,
        startTime: appointment.startTime,
        reason: appointment.reason,
        doctorId: appointment.doctor.id,
        assistantId: appointment.assistant?.id ?? "",
        patientId: appointment.patient.id,
      });
    } else {
      reset(emptyForm());
    }
  }, [appointment, open, reset]);
  if (!open) return null;

  const onSubmit = async (data: AppointmentForm) => {
    const selectedDoctor = doctors.find(
      (doctor: Doctor) => doctor.id === data.doctorId,
    );
    const selectedPatient = patients.find(
      (patient: Patient) => patient.id === data.patientId,
    );
    const selectedAssistant = assistants.find(
      (assistant: Assistant) => assistant.id === data.assistantId,
    );
    if (!selectedDoctor || !selectedPatient) {
      toast.warning("Please select both a doctor and a patient.");
      return;
    }
    const payload: AppointmentRequest = {
      appointmentDate: data.appointmentDate,
      startTime: data.startTime,
      reason: data.reason,
      doctor: selectedDoctor,
      patient: selectedPatient,
      assistant: selectedAssistant,
      status: "CONFIRMED",
    };
    const reschedulePayload: AppointmentRescheduleRequest = {
      appointmentDate: data.appointmentDate,
      startTime: data.startTime,
    };
    try {
      switch (mode) {
        case "create":
          toast.promise(createAppointment.mutateAsync(payload), {
            loading: "Creating appointment...",
            success: "Appointment created successfully.",
            error: "Unable to create appointment.",
          });
          break;
        case "assistant_create":
          toast.promise(createAppointmentByAssistant.mutateAsync(payload), {
            loading: "Creating appointment...",
            success: "Appointment created successfully.",
            error: "Unable to create appointment.",
          });
          break;
        case "book":
          toast.promise(bookAppointment.mutateAsync(payload), {
            loading: "Booking appointment...",
            success: "Appointment booked successfully.",
            error: "Unable to book the appointment.",
          });
          break;
        case "edit":
          toast.promise(
            updateAppointment.mutateAsync({
              id: appointment?.id,
              appointment: payload,
            }),
            {
              loading: "Updating appointment...",
              success: "Appointment updated successfully.",
              error: "Unable to update appointment.",
            },
          );
          break;
        case "reschedule":
          toast.promise(
            rescheduleAppointment.mutateAsync({
              id: appointment?.id,
              appointment: reschedulePayload,
            }),
            {
              loading: "Rescheduling appointment...",
              success: "Appointment rescheduled successfully.",
              error: "Unable to reschedule appointment.",
            },
          );
          break;
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex h-screen w-full items-center justify-center bg-slate-950/45 p-4 backdrop-blur-[2px]">
      <div className="max-h-[95vh] w-full max-w-4xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <div className="appointment-modal-scroll max-h-[95vh] overflow-y-auto p-6 sm:p-8">
          <div className="mb-7 border-b border-slate-100 pb-5">
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
              {mode === "create" && "Create Appointment"}

              {mode === "assistant_create" && "Create Appointment"}

              {mode === "book" && "Book an appointment"}

              {mode === "edit" && "Edit Appointment"}

              {mode === "reschedule" && "Reschedule Appointment"}
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Choose a doctor and reserve an available consultation time.
            </p>
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="grid gap-5 md:grid-cols-2"
          >
            {/* Patient */}
            <div>
              {mode !== "book" && (
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Patient
                  </label>
                  <RoundedSelect
                    value={selectedPatientId}
                    placeholder="Select Patient"
                    disabled={mode === "reschedule"}
                    options={patients.map((p: Patient) => ({
                      value: p.id,
                      label: `${capitalizeName(p.firstName)} ${capitalizeName(p.lastName)}`,
                    }))}
                    onChange={(value) =>
                      setValue("patientId", value, { shouldValidate: true })
                    }
                  />
                  {errors.patientId && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.patientId.message}
                    </p>
                  )}
                </div>
              )}
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Doctor
              </label>
              <RoundedSelect
                value={selectedDoctorId}
                placeholder="Select doctor"
                disabled={mode === "reschedule"}
                options={doctors.map((d: Doctor) => ({
                  value: d.id,
                  label: `Dr. ${capitalizeName(d.firstName)} ${capitalizeName(d.lastName)}`,
                }))}
                onChange={(value) => {
                  setValue("doctorId", value, { shouldValidate: true });
                  setValue("startTime", "", { shouldValidate: true });
                }}
              />
              {errors.doctorId && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.doctorId.message}
                </p>
              )}
            </div>
            {mode !== "assistant_create" && (
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Assistant
                </label>
                <RoundedSelect
                  value={String(selectedAssistantId ?? "")}
                  placeholder="Select Assistant"
                  disabled={mode === "reschedule"}
                  options={assistants.map((a: Assistant) => ({
                    value: a.id,
                    label: `${capitalizeName(a.firstName)} ${capitalizeName(a.lastName)}`,
                  }))}
                  onChange={(value) =>
                    setValue("assistantId", value, { shouldValidate: true })
                  }
                />
                {errors.assistantId && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.assistantId.message}
                  </p>
                )}
              </div>
            )}
            {
              <div className="md:col-span-2">
                <DoctorAvailability
                  doctorId={selectedDoctorId}
                  date={selectedAppointmentDate}
                  selectedSlot={selectedStartTime || null}
                  onDateChange={(date) => {
                    setValue("appointmentDate", date, { shouldValidate: true });
                    setValue("startTime", "", { shouldValidate: true });
                  }}
                  onSlotSelect={(slot) => {
                    setValue("startTime", slot.slice(0, 5), {
                      shouldValidate: true,
                    });
                  }}
                />
              </div>
            }
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Time
              </label>
              <input
                type="time"
                {...register("startTime")}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
              />
              {errors.startTime && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.startTime.message}
                </p>
              )}
            </div>
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Reason
              </label>
              <textarea
                rows={3}
                {...register("reason")}
                disabled={mode === "reschedule"}
                className="w-full resize-none rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:bg-slate-50"
              />
              {errors.reason && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.reason.message}
                </p>
              )}
            </div>
            <div className="mt-2 flex justify-end gap-3 border-t border-slate-100 pt-5 md:col-span-2">
              <button
                type="button"
                aria-label="Cancel"
                onClick={onClose}
                className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                disabled={isSaving}
                aria-label={`${isSaving ? "Saving..." : "Save"}`}
                className="bg-gradient-to-r from-indigo-900 to-blue-500 cursor-pointer rounded-lg bg-slate-900 px-7 py-2.5 text-sm font-medium text-white shadow-sm transition disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSaving ? "Saving..." : "Save"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
