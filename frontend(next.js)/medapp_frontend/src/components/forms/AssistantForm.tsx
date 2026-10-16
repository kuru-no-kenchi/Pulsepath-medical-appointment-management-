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

  const inputClassName =
    "w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10";

  return (
    <div className="fixed inset-0 z-50 flex h-dvh w-full items-center justify-center bg-slate-950/45 p-3 backdrop-blur-[2px] sm:p-4">
      <div className="max-h-[95dvh] w-full max-w-3xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <div className="max-h-[95dvh] overflow-y-auto p-4 sm:p-6 md:p-8">
          <div className="mb-6 flex items-start justify-between gap-4 border-b border-slate-100 pb-5 sm:mb-7">
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
                {assistant ? "Edit Assistant" : "Create Assistant"}
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                Enter the assistant&apos;s contact details.
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
            onSubmit={handleSubmit(onSubmit)}
            className="grid gap-4 sm:grid-cols-2 sm:gap-5"
          >
            <div>
              <label
                htmlFor="assistant-first-name"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                First Name
              </label>
              <input
                {...register("firstName")}
                id="assistant-first-name"
                autoComplete="given-name"
                className={inputClassName}
              />
              {errors.firstName && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.firstName.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="assistant-last-name"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Last Name
              </label>
              <input
                {...register("lastName")}
                id="assistant-last-name"
                autoComplete="family-name"
                className={inputClassName}
              />
              {errors.lastName && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.lastName.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="assistant-email"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Email
              </label>
              <input
                type="email"
                id="assistant-email"
                autoComplete="email"
                {...register("email")}
                className={inputClassName}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="assistant-phone"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Phone
              </label>
              <input
                id="assistant-phone"
                autoComplete="tel"
                {...register("phone")}
                className={inputClassName}
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.phone.message}
                </p>
              )}
            </div>

            <div className="sm:col-span-2">
              <label
                htmlFor="assistant-photo-url"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Photo URL
              </label>
              <input
                type="url"
                id="assistant-photo-url"
                {...register("photoUrl")}
                className={inputClassName}
              />
              {errors.photoUrl && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.photoUrl.message}
                </p>
              )}
            </div>

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
                aria-label={
                  isSaving
                    ? "Saving..."
                    : assistant
                      ? "Update Assistant"
                      : "Create Assistant"
                }
                disabled={isSaving}
                className="cursor-pointer rounded-lg bg-gradient-to-r from-indigo-900 to-blue-500 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:from-indigo-800 hover:to-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
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
    </div>
  );
}