import { toast } from "sonner";
import { useDoctorMutations } from "@/mutations/useDoctorMutations";
import { doctorFields } from "@/types/doctor";
import AreaContentSkeleton from "../ui/AreaContentSkeleton";
import ProfilePage from "../ui/ProfilePage";
import ErrorBoundary from "../ui/Error.Boundary";
import { useDoctor } from "@/hooks/useDoctor";

export default function DoctorProfile() {
  const { updateProfile } = useDoctorMutations();
  const { data: currentDoctor } = useDoctor();
  if (!currentDoctor) return <AreaContentSkeleton />;
  return (
    <ErrorBoundary>
      <ProfilePage
        title="Profile"
        entity={currentDoctor}
        fields={doctorFields}
        onSave={async (updatedProfile) => {
          await toast.promise(updateProfile.mutateAsync(updatedProfile), {
            loading: "Updating profile...",
            success: "Profile updated successfully.",
            error: "Unable to update profile.",
          });
        }}
      />
    </ErrorBoundary>
  );
}
