import { useEffect } from "react";
import { Assistant } from "@/types/assistant";
import { toast } from "sonner";
import { useAssistantByAdminMutations } from "@/mutations/useAdminMutations";
import { assistantSchema } from "@/schemas/assistant.schema";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

interface AssistantFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  assistant?: Assistant;
}

type AssistantForm = z.infer<typeof assistantSchema>;
const emptyForm = {
  firstName: "",
  lastName: "",
  email: "",
  photoUrl: "",
  phone: "",
};

export default function AssistantForm({
  open,
  onClose,
  onSuccess,
  assistant,
}: AssistantFormProps) {
  const { createAssistant, updateAssistant } = useAssistantByAdminMutations();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AssistantForm>({
    resolver: zodResolver(assistantSchema),
    defaultValues: emptyForm,
  });
  const isSaving = createAssistant.isPending || updateAssistant.isPending;
  useEffect(() => {
    if (!open) return;
    if (assistant) {
      reset({
        firstName: assistant.firstName,
        lastName: assistant.lastName,
        email: assistant.email,
        phone: assistant.phone,
        photoUrl: assistant.photoUrl,
      });
    } else {
      reset(emptyForm);
    }
  }, [assistant, open, reset]);
  if (!open) return null;

  const onSubmit = async (data: AssistantForm) => {
    try {
      if (assistant) {
        await updateAssistant.mutateAsync({
          id: assistant.id,
          assistant: data,
        });
        toast.success("Assistant updated successfully.");
      } else {
        await createAssistant.mutateAsync(data);
        toast.success("Assistant created successfully.");
        reset(emptyForm);
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="fixed inset-0 h-screen w-full bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-2xl p-6 shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">
            {assistant ? "Edit Assistant" : "Create Assistant"}
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
            <label htmlFor="first Name" className="block text-sm mb-1">First Name</label>
            <input
              {...register("firstName")}
              id="first Name"
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
              {...register("phone")}
              id="phone"
              className="w-full border rounded-lg px-3 py-2"
            />
            {errors.phone && (
              <p className="mt-1 text-sm text-red-500">
                {errors.phone.message}
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
                  : assistant
                    ? "Update Assistant"
                    : "Create Assistant"
              }`}
              disabled={isSaving}
              className="cursor-pointer bg-gradient-to-r from-indigo-900 to-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isSaving
                ? "Saving..."
                : assistant
                  ? "Update Assistant"
                  : "Create Assistant"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
