import { toast } from "sonner";
import { useAssistantMutations } from "@/mutations/useAssistantMutations";
import { assistantFields } from "@/types/assistant";
import AreaContentSkeleton from "../ui/AreaContentSkeleton";
import ProfilePage from "../ui/ProfilePage";
import ErrorBoundary from "../ui/Error.Boundary";
import { useAssistant } from "@/hooks/useAssistant";

export default function AssistantProfile() {
  const { data: currentAssistant } = useAssistant();
  const { updateProfile } = useAssistantMutations();
  if (!currentAssistant) return <AreaContentSkeleton />;
  return (
    <ErrorBoundary>
      <ProfilePage
        title="Profile"
        entity={currentAssistant}
        fields={assistantFields}
        onSave={async (updatedProfile) => {
          toast.promise(updateProfile.mutateAsync(updatedProfile), {
            loading: "Updating profile...",
            success: "Profile updated successfully.",
            error: "Unable to update profile.",
          });
        }}
      />
    </ErrorBoundary>
  );
}
