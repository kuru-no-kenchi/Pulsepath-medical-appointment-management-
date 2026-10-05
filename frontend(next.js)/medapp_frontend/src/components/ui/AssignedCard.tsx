import { FiUser, FiChevronRight, FiUsers } from "react-icons/fi";
import { IconType } from "react-icons";
import { getImageUrl } from "@/services/upload.service";

export interface RelatedPerson {
  id: string;
  fullName: string;
  subtitle?: string;
  description?: string;
  photoUrl?: string;
  icon?: IconType;
}

interface Props {
  title: string;
  icon?: IconType;
  people: RelatedPerson | RelatedPerson[];
  emptyMessage?: string;
  onSelect?: (person: RelatedPerson) => void;
}

export default function AssignedCard({
  title,
  people,
  icon: Icon = FiUsers,
  emptyMessage = "Nothing to display.",
  onSelect,
}: Props) {
  const peopleList = Array.isArray(people) ? people : people ? [people] : [];
  return (
    <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-900 to-blue-400 flex items-center justify-between px-4 py-2 border-b">
        <div className="flex items-center gap-1">
          {Icon && (
            <div className="w-10 h-10 rounded-xl font-bold text-white flex items-center justify-center">
              <Icon size={20} />
            </div>
          )}
          <div>
            <h2 className="font-semibold text-white text-gray-800">{title}</h2>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="divide-y divide-gray-100">
        {peopleList.length === 0 ? (
          <div className="p-8 text-center text-gray-500">{emptyMessage}</div>
        ) : (
          peopleList.map((person) => (
            <button
              key={person.id}
              aria-label="Next"
              onClick={() => onSelect?.(person)}
              className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition"
            >
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-full overflow-hidden bg-blue-100 flex items-center justify-center">
                  {person.photoUrl ? (
                    <img
                      src={getImageUrl(person.photoUrl)}
                      alt={person.fullName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <FiUser className="text-blue-600 text-lg" />
                  )}
                </div>

                <div className="text-left">
                  <p className="font-semibold text-gray-800">
                    {person.fullName}
                  </p>

                  {person.subtitle && (
                    <p className="text-sm text-gray-500">{person.subtitle}</p>
                  )}

                  {person.description && (
                    <p className="text-sm text-gray-500">
                      {person.description}
                    </p>
                  )}
                </div>
              </div>
              <FiChevronRight className="text-gray-400" aria-hidden="true"/>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
