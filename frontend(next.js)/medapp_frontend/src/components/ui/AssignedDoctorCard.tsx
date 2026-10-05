import { useMemo, useState } from "react";
import { FiSearch } from "react-icons/fi";
import { FaUserDoctor } from "react-icons/fa6";
import { toast } from "sonner";
import { useDoctorsByAdmin } from "@/hooks/useAdmin";
import { useAssistantByAdminMutations } from "@/mutations/useAdminMutations";
import { capitalizeName } from "@/lib/capitalizeName";

interface Props {
  assistantId: string;
  editing: boolean;
}

export default function AssignedDoctorsCard({ assistantId, editing }: Props) {
  const { data: doctors = [], isLoading } = useDoctorsByAdmin();
  const { updateAssignedDoctor } = useAssistantByAdminMutations();
  const [assignedDoctorIds, setAssignedDoctorIds] = useState<string[]>([]);
  const [search, setSearch] = useState("");

  const filteredDoctors = useMemo(() => {
    return doctors.filter((doctor) => {
      const fullName = `${(doctor.firstName)} ${doctor.lastName}`.toLowerCase();

      return (
        fullName.includes(search.toLowerCase()) ||
        doctor.specialty?.toLowerCase().includes(search.toLowerCase())
      );
    });
  }, [search, doctors]);

  const toggleDoctor = (doctorId: string) => {
    if (!editing) return;

    setAssignedDoctorIds((prev) =>
      prev.includes(doctorId)
        ? prev.filter((id) => id !== doctorId)
        : [...prev, doctorId],
    );
  };

  const saveAssignments = async () => {
    try {
      await updateAssignedDoctor.mutateAsync({
        assistant_id: assistantId,
        doctor_ids: assignedDoctorIds,
      });

      toast.success("Doctors assigned successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to assign doctors");
    }
  };

  return (
    <div className="mt-5 bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 p-6">
      <div className="flex items-center gap-2 mb-6">
        <FaUserDoctor className="text-blue-600" />
        <h2 className="text-lg font-semibold">Assigned Doctors</h2>
      </div>
      <div className="flex items-center border rounded-lg px-3 py-2 mb-5">
        <FiSearch className="text-gray-400" />
        <input
          placeholder="Search doctors..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="ml-2 flex-1 outline-none"
        />
      </div>
      <div className="space-y-3 max-h-80 overflow-y-auto">
        {filteredDoctors.map((doctor) => (
          <label
            key={doctor.id}
            className={`flex items-center justify-between rounded-lg border p-3 ${
              editing ? "cursor-pointer hover:bg-gray-50" : "bg-gray-50"
            }`}
          >
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                aria-label="Select this row"
                checked={assignedDoctorIds.includes(doctor.id)}
                disabled={!editing}
                onChange={() => toggleDoctor(doctor.id)}
              />
              <div>
                <p className="font-medium">
                  Dr. {capitalizeName(doctor.firstName)} {capitalizeName(doctor.lastName)}
                </p>

                <p className="text-sm text-gray-500">{doctor.specialty}</p>
              </div>
            </div>
          </label>
        ))}
      </div>
      {editing && (
        <div className="flex justify-end mt-6">
          <button
            onClick={saveAssignments}
            aria-label="Save Assignements"
            className="bg-gradient-to-r from-indigo-900 to-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Save Assignments
          </button>
        </div>
      )}
    </div>
  );
}
