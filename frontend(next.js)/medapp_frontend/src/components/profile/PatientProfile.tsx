import { patientFields } from "@/types/patients";
import { toast } from "sonner";
import { usePatientMutations } from "@/mutations/usePatientMutations";
import AreaContentSkeleton from "../ui/AreaContentSkeleton";
import ProfilePage from "../ui/ProfilePage";
import ErrorBoundary from "../ui/Error.Boundary";
import { usePatient } from "@/hooks/usePatients";

export default function PatientProfile() {
  const { data: currentPatient } = usePatient();
  const { updateProfile } = usePatientMutations();

  if (!currentPatient) return <AreaContentSkeleton />;
  return (
    <ErrorBoundary>
      <ProfilePage
        title="Profile"
        entity={currentPatient}
        fields={patientFields}
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
