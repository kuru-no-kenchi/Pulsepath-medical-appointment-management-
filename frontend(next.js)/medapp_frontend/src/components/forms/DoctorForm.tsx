import { useEffect } from "react";
import { Doctor } from "@/types/doctor";
import { toast } from "sonner";
import { useDoctorByAdminMutations } from "@/mutations/useAdminMutations";
import { doctorSchema } from "@/schemas/doctor.schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

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
    formState: { errors },
  } = useForm<DoctorForm>({
    resolver: zodResolver(doctorSchema),
    defaultValues: emptyForm,
  });
  const isSaving = createDoctor.isPending || updateDoctor.isPending;
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
        toast.promise(
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
        toast.promise(createDoctor.mutateAsync(data), {
          loading: "Creating doctor...",
          success: "Doctor created successfully.",
          error: "Unable to create doctor.",
        });
        reset(emptyForm);
      }
      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 h-screen w-full bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-2xl p-6 shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">
            {doctor ? "Edit Doctor" : "Create Doctor"}
          </h2>

          <button
            onClick={onClose}
            className="text-gray-500"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {/* First Name */}
          <div>
            <label htmlFor="first name" className="block text-sm mb-1">First Name</label>
            <input
              {...register("firstName")}
              id="first name"
              className="w-full border rounded-lg px-3 py-2"
            />
            {errors.firstName && (
              <p className="mt-1 text-sm text-red-500">
                {errors.firstName.message}
              </p>
            )}
          </div>

          {/* Last Name */}
          <div>
            <label htmlFor="last name" className="block text-sm mb-1">Last Name</label>

            <input
              {...register("lastName")}
              id="last name"
              className="w-full border rounded-lg px-3 py-2"
            />

            {errors.lastName && (
              <p className="mt-1 text-sm text-red-500">
                {errors.lastName.message}
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm mb-1">Email</label>
            <input
              type="email"
              id="email"
              {...register("email")}
              className="w-full border rounded-lg px-3 py-2"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-500">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label htmlFor="phone" className="block text-sm mb-1">Phone</label>

            <input
            id="phone"
              {...register("phone")}
              className="w-full border rounded-lg px-3 py-2"
            />
            {errors.phone && (
              <p className="mt-1 text-sm text-red-500">
                {errors.phone.message}
              </p>
            )}
          </div>

          {/* Specialty */}
          <div>
            <label htmlFor="specialty" className="block text-sm mb-1">Specialty</label>
            <input
              {...register("specialty")}
              id="specialty"
              className="w-full border rounded-lg px-3 py-2"
            />
            {errors.specialty && (
              <p className="mt-1 text-sm text-red-500">
                {errors.specialty.message}
              </p>
            )}
          </div>

          {/* Experience */}
          <div>
            <label htmlFor="experience" className="block text-sm mb-1">Experience (Years)</label>
            <input
              type="number"
              id="experience"
              className="w-full border rounded-lg px-3 py-2"
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
            <label htmlFor="consultation" className="block text-sm mb-1">
              Consultation Duration (minutes)
            </label>
            <input
              type="number"
              id="consultation"
              className="w-full border rounded-lg px-3 py-2"
              {...register("consultationDuration", {
                valueAsNumber: true,
              })}
            />
            {errors.consultationDuration && (
              <p className="mt-1 text-sm text-red-500">
                {errors.consultationDuration.message}
              </p>
            )}
          </div>

          {/* Bio */}
          <div className="md:col-span-2">
            <label htmlFor="bio" className="block text-sm mb-1">Biography</label>
            <textarea
              rows={4}
              id="bio"
              {...register("bio")}
              className="w-full border rounded-lg px-3 py-2 resize-none"
            />
            {errors.bio && (
              <p className="mt-1 text-sm text-red-500">{errors.bio.message}</p>
            )}
          </div>

          {/* Actions */}
          <div className="md:col-span-2 flex justify-end gap-3 mt-4">
            <button
              type="button"
              aria-label="Cancel"
              onClick={onClose}
              className="px-4 py-2 border rounded-lg"
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
              className="cursor-pointer bg-gradient-to-r from-indigo-900 to-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
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
  );
}
