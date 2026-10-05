import { userFields } from "@/types/user";
import { toast } from "sonner";
import { useAdminMutations } from "@/mutations/useAdminMutations";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import AreaContentSkeleton from "../ui/AreaContentSkeleton";
import ProfilePage from "../ui/ProfilePage";
import ErrorBoundary from "../ui/Error.Boundary";

export default function AdminProfile() {
  const { updateProfile } = useAdminMutations();
  const { data: currentUser } = useCurrentUser();

  if (!currentUser) return <AreaContentSkeleton />;
  return (
    <ErrorBoundary>
    <ProfilePage
      title="Profile"
      entity={currentUser}
      fields={userFields}
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
