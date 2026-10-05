import { useEffect } from "react";
import { Patient } from "@/types/patients";
import { toast } from "sonner";
import { usePatientByAdminMutations } from "@/mutations/useAdminMutations";
import z from "zod";
import { patientSchema } from "@/schemas/patient.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import RoundedSelect from "../ui/RoundedSelect";


interface PatientFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  patient?: Patient;
}
type PatientForm = z.infer<typeof patientSchema>;

const emptyForm = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  photoUrl: "",
  address: "",
  dateOfBirth: "",
  gender: "",
  emergencyContact: "",
};
export default function PatientForm({
  open,
  onClose,
  onSuccess,
  patient,
}: PatientFormProps) {
  const { updatePatient } = usePatientByAdminMutations();
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<PatientForm>({
    resolver: zodResolver(patientSchema),
    defaultValues: emptyForm,
  });
  const isSaving = updatePatient.isPending;
  const selectedGender = watch("gender");
  useEffect(() => {
    if (!open) return;
    if (patient) {
      reset({
        firstName: patient.firstName,
        lastName: patient.lastName,
        email: patient.email,
        phone: patient.phone,
        photoUrl: patient.photoUrl,
        address: patient.address,
        dateOfBirth: patient.dateOfBirth,
        emergencyContact: patient.emergencyContact,
        gender: patient.gender,
      });
    } else {
      reset(emptyForm);
    }
  }, [patient, open, reset]);
  if (!open) return null;

  const onSubmit = async (data: PatientForm) => {
    try {
      if (patient) {
        toast.promise(
          updatePatient.mutateAsync({
            id: patient.id,
            patient: data,
          }),
          {
            loading: "Updating patient...",
            success: "Patient updated successfully.",
            error: "Unable to update patient.",
          },
        );
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="fixed inset-0 h-screen w-full bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-2xl p-6 shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">
            {patient ? "Edit Patient" : "Create Patient"}
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
            <label className="block text-sm mb-1">First Name</label>
            <input
              {...register("firstName")}
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
            <label className="block text-sm mb-1">Last Name</label>
            <input
              {...register("lastName")}
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
            <label className="block text-sm mb-1">Email</label>
            <input
              type="email"
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
            <label className="block text-sm mb-1">Phone</label>
            <input
              {...register("phone")}
              className="w-full border rounded-lg px-3 py-2"
            />
            {errors.phone && (
              <p className="mt-1 text-sm text-red-500">
                {errors.phone.message}
              </p>
            )}
          </div>
          {/* Date Of Birth */}
          <div>
            <label className="block text-sm mb-1">Date of Birth</label>
            <input
              {...register("dateOfBirth")}
              className="w-full border rounded-lg px-3 py-2"
            />
            {errors.dateOfBirth && (
              <p className="mt-1 text-sm text-red-500">
                {errors.dateOfBirth.message}
              </p>
            )}
          </div>

          {/*Gender */}
          <div>
            <label className="block text-sm mb-1">Gender</label>
              <RoundedSelect
                value={selectedGender}
                options={[
                  { label: "Male", value: "Male" },
                  { label: "Female", value: "Female" },
                ]}
              placeholder={"Select gender"}
              onChange={(value) =>
                  setValue("gender", value, { shouldValidate: true })
                }
            />
            {errors.gender && <p>{errors.gender.message}</p>}
          </div>
          {/* Address */}
          <div className="md:col-span-2">
            <label className="block text-sm mb-1">Address</label>
            <textarea
              rows={2}
              {...register("address")}
              className="w-full border rounded-lg px-3 py-2 resize-none"
            />

            {errors.address && (
              <p className="mt-1 text-sm text-red-500">
                {errors.address.message}
              </p>
            )}
          </div>
          {/* Emergency Contact */}
          <div>
            <label className="block text-sm mb-1">Emergency Contact</label>
            <input
              {...register("emergencyContact")}
              className="w-full border rounded-lg px-3 py-2"
            />
            {errors.emergencyContact && (
              <p className="mt-1 text-sm text-red-500">
                {errors.emergencyContact.message}
              </p>
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
                  : patient
                    ? "Update Patient"
                    : "Create Patient"
              }`}
              disabled={isSaving}
              className="bg-gradient-to-r from-indigo-900 to-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isSaving
                ? "Saving..."
                : patient
                  ? "Update Patient"
                  : "Create Patient"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
