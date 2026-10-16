import { useEffect } from "react";
import { Doctor } from "@/types/doctor";
import { toast } from "sonner";
import { useDoctorByAdminMutations } from "@/mutations/useAdminMutations";
import { doctorSchema } from "@/schemas/doctor.schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useWatch } from "react-hook-form";
import RoundedSelect from "@/components/ui/RoundedSelect";

type DoctorForm = z.infer<typeof doctorSchema>;
interface DoctorFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  doctor?: Doctor;
}
const emptyForm = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  photoUrl: "",
  specialty: "",
  experienceYears: 0,
  bio: "",
  consultationDuration: 30,
};
export default function DoctorForm({
  open,
  onClose,
  onSuccess,
  doctor,
}: DoctorFormProps) {
  const { updateDoctor, createDoctor } = useDoctorByAdminMutations();
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    getValues,
    formState: { errors },
  } = useForm<DoctorForm>({
    resolver: zodResolver(doctorSchema),
    defaultValues: emptyForm,
  });
  const consultationDuration = useWatch({
    control,
    name: "consultationDuration",
  });

  const onInvalid = (formErrors: unknown) => {
    const values = getValues();
    console.error("Doctor form validation failed", {
      values,
      result: doctorSchema.safeParse(values),
      errors: formErrors,
    });
  };
  const isSaving = createDoctor.isPending || updateDoctor.isPending;
  const durationOptions = Array.from(
    new Set([15, 30, 45, 60, 90, 120, doctor?.consultationDuration].filter(
      (duration): duration is number => typeof duration === "number",
    )),
  )
    .sort((a, b) => a - b)
    .map((duration) => ({
      value: String(duration),
      label: `${duration} minutes`,
    }));
  useEffect(() => {
    if (!open) return;
    if (doctor) {
      reset({
        firstName: doctor.firstName,
        lastName: doctor.lastName,
        email: doctor.email,
        phone: doctor.phone,
        photoUrl: doctor.photoUrl,
        specialty: doctor.specialty,
        experienceYears: doctor.experienceYears,
        bio: doctor.bio,
        consultationDuration: doctor.consultationDuration,
      });
    } else {
      reset(emptyForm);
    }
  }, [doctor, open, reset]);

  if (!open) return null;

  const onSubmit = async (data: DoctorForm) => {
    try {
      if (doctor) {
        await toast.promise(
          updateDoctor.mutateAsync({
            id: doctor.id,
            doctor: data,
          }),
          {
            loading: "Updating doctor...",
            success: "Doctor updated successfully.",
            error: "Unable to update doctor.",
          },
        );
      } else {
        await toast.promise(
          createDoctor.mutateAsync(data),
          {
            loading: "Creating doctor...",
            success: "Doctor created successfully.",
            error: "Unable to create doctor.",
          },
        );
      }
      reset(emptyForm);
      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex h-dvh w-full items-center justify-center bg-slate-950/45 p-3 backdrop-blur-[2px] sm:p-4">
      <div className="max-h-[95dvh] w-full max-w-4xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <div className="max-h-[95dvh] overflow-y-auto p-4 sm:p-6 md:p-8">
          <div className="mb-6 flex items-start justify-between gap-4 border-b border-slate-100 pb-5 sm:mb-7">
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
            {doctor ? "Edit Doctor" : "Create Doctor"}
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                Enter the doctor&apos;s details and consultation settings.
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="shrink-0 rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          <form
            onSubmit={handleSubmit(onSubmit, onInvalid)}
            className="grid gap-4 sm:grid-cols-2 sm:gap-5"
          >
          {/* First Name */}
          <div>
            <label htmlFor="first-name" className="mb-2 block text-sm font-medium text-slate-700">
              First Name
            </label>
            <input
              {...register("firstName")}
              id="first-name"
              autoComplete="given-name"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
            />
            {errors.firstName && (
              <p className="mt-1 text-sm text-red-500">
                {errors.firstName.message}
              </p>
            )}
          </div>

          {/* Last Name */}
          <div>
            <label htmlFor="last-name" className="mb-2 block text-sm font-medium text-slate-700">
              Last Name
            </label>

            <input
              {...register("lastName")}
              id="last-name"
              autoComplete="family-name"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
            />

            {errors.lastName && (
              <p className="mt-1 text-sm text-red-500">
                {errors.lastName.message}
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <label htmlFor="doctor-email" className="mb-2 block text-sm font-medium text-slate-700">
              Email
            </label>
            <input
              type="email"
              id="doctor-email"
              {...register("email")}
              autoComplete="email"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-500">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label htmlFor="doctor-phone" className="mb-2 block text-sm font-medium text-slate-700">
              Phone
            </label>

            <input
              id="doctor-phone"
              {...register("phone")}
              autoComplete="tel"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
            />
            {errors.phone && (
              <p className="mt-1 text-sm text-red-500">
                {errors.phone.message}
              </p>
            )}
          </div>

          {/* Specialty */}
          <div>
            <label htmlFor="specialty" className="mb-2 block text-sm font-medium text-slate-700">
              Specialty
            </label>
            <input
              {...register("specialty")}
              id="specialty"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
            />
            {errors.specialty && (
              <p className="mt-1 text-sm text-red-500">
                {errors.specialty.message}
              </p>
            )}
          </div>

          {/* Experience */}
          <div>
            <label htmlFor="experience" className="mb-2 block text-sm font-medium text-slate-700">
              Experience (Years)
            </label>
            <input
              type="number"
              id="experience"
              min={0}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
              {...register("experienceYears", {
                valueAsNumber: true,
              })}
            />
            {errors.experienceYears && (
              <p className="mt-1 text-sm text-red-500">
                {errors.experienceYears.message}
              </p>
            )}
          </div>

          {/* Consultation Duration */}
          <div>
            <label htmlFor="consultation-duration" className="mb-2 block text-sm font-medium text-slate-700">
              Consultation Duration (minutes)
            </label>
            <RoundedSelect
              value={String(consultationDuration ?? "")}
              placeholder="Select duration"
              options={durationOptions}
              onChange={(value) =>
                setValue("consultationDuration", Number(value), {
                  shouldDirty: true,
                  shouldValidate: true,
                })
              }
            />
            {errors.consultationDuration && (
              <p className="mt-1 text-sm text-red-500">
                {errors.consultationDuration.message}
              </p>
            )}
          </div>

          {/* Bio */}
          <div className="sm:col-span-2">
            <label htmlFor="bio" className="mb-2 block text-sm font-medium text-slate-700">
              Biography
            </label>
            <textarea
              rows={3}
              id="bio"
              {...register("bio")}
              className="w-full resize-y rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
            />
            {errors.bio && (
              <p className="mt-1 text-sm text-red-500">{errors.bio.message}</p>
            )}
          </div>

          {/* Actions */}
          <div className="mt-2 flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:col-span-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              aria-label="Cancel"
              onClick={onClose}
              className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              aria-label={`${
                isSaving
                  ? "Saving..."
                  : doctor
                    ? "Update Doctor"
                    : "Create Doctor"
              }`}
              disabled={isSaving}
              className="cursor-pointer rounded-lg bg-gradient-to-r from-indigo-900 to-blue-500 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:from-indigo-800 hover:to-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving
                ? "Saving..."
                : doctor
                  ? "Update Doctor"
                  : "Create Doctor"}
            </button>
          </div>
          </form>
        </div>
      </div>
    </div>
  );
}
