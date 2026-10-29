import {
  FiUser,
  FiUsers,
  FiCalendar,
  FiClock,
  FiX,
} from "react-icons/fi";
import { CalendarPlus as FiCalendarPlus } from "lucide-react";
import { IconType } from "react-icons";
import { getImageUrl } from "@/services/upload.service";
import Image from "next/image";
import { useState, FormEvent } from "react";

export interface RelatedPerson {
  id: string;
  fullName: string;
  subtitle?: string;
  description?: string;
  photoUrl?: string;
  icon?: IconType;
}
type SchedulePayload = {
  doctorId: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
};
const daysOfWeek = [
  { value: "MONDAY", label: "Monday" },
  { value: "TUESDAY", label: "Tuesday" },
  { value: "WEDNESDAY", label: "Wednesday" },
  { value: "THURSDAY", label: "Thursday" },
  { value: "FRIDAY", label: "Friday" },
  { value: "SATURDAY", label: "Saturday" },
  { value: "SUNDAY", label: "Sunday" },
];
interface Props {
  title: string;
  icon?: IconType;
  people: RelatedPerson | RelatedPerson[];
  emptyMessage?: string;
  onSelect?: (person: RelatedPerson) => void;
  canManageSchedules?: boolean;
  onCreateSchedule?: (payload: SchedulePayload) => Promise<void> | void;
}

export default function AssignedCard({
  title,
  people,
  icon: Icon = FiUsers,
  emptyMessage = "Nothing to display.",
  onSelect,
  onCreateSchedule,
  canManageSchedules = false,
}: Props) {
  const peopleList = Array.isArray(people) ? people : people ? [people] : [];
  const [scheduleDoctor, setScheduleDoctor] = useState<RelatedPerson | null>(
    null,
  );

  const [dayOfWeek, setDayOfWeek] = useState("MONDAY");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  function openScheduleModal(person: RelatedPerson) {
    setScheduleDoctor(person);
    setDayOfWeek("MONDAY");
    setStartTime("09:00");
    setEndTime("17:00");
    setError("");
    setNotice("");
  }

  function closeScheduleModal() {
    if (submitting) return;
    setScheduleDoctor(null);
    setError("");
    setNotice("");
  }

  async function handleScheduleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setNotice("");

    if (!scheduleDoctor) return;

    if (startTime >= endTime) {
      setError("Start time must be earlier than end time.");
      return;
    }

    if (!onCreateSchedule) {
      setNotice(
        "The form is ready. Connect onCreateSchedule to your schedule API before saving.",
      );
      return;
    }

    const payload: SchedulePayload = {
      doctorId: scheduleDoctor.id,
      dayOfWeek,
      startTime,
      endTime,
    };

    try {
      setSubmitting(true);
      await onCreateSchedule(payload);
      setScheduleDoctor(null);
      setNotice("");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to create the schedule. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <div className="overflow-hidden rounded-2xl bg-white shadow-sm transition-all duration-200 hover:shadow-md">
        {/* Header */}
        <div className="flex items-center justify-between border-b bg-gradient-to-r from-indigo-900 to-blue-400 px-4 py-2">
          <div className="flex items-center gap-1">
            {Icon && (
              <div className="flex h-10 w-10 items-center justify-center rounded-xl font-bold text-white">
                <Icon size={20} />
              </div>
            )}
            <h2 className="font-semibold text-white">{title}</h2>
          </div>
        </div>

        {/* Body */}
        <div className="divide-y divide-gray-100">
          {peopleList.length === 0 ? (
            <div className="p-8 text-center text-gray-500">{emptyMessage}</div>
          ) : (
            peopleList.map((person) => (
              <div
                key={person.id}
                className="flex items-center justify-between gap-3 px-4 py-4 transition hover:bg-gray-50 sm:px-6"
              >
                <button
                  type="button"
                  aria-label={`View ${person.fullName}`}
                  onClick={() => onSelect?.(person)}
                  className="flex min-w-0 flex-1 items-center gap-4 text-left"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-blue-100">
                    {person.photoUrl ? (
                      <Image
                        src={getImageUrl(person.photoUrl)}
                        alt={person.fullName}
                        width={44}
                        height={44}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <FiUser className="text-lg text-blue-600" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <p className="truncate font-semibold text-gray-800">
                      {person.fullName}
                    </p>

                    {person.subtitle && (
                      <p className="truncate text-sm text-gray-500">
                        {person.subtitle}
                      </p>
                    )}

                    {person.description && (
                      <p className="truncate text-sm text-gray-500">
                        {person.description}
                      </p>
                    )}
                  </div>

                </button>

                {canManageSchedules && (
                  <button
                    type="button"
                    title={`Manage schedule for ${person.fullName}`}
                    aria-label={`Create schedule for ${person.fullName}`}
                    onClick={() => openScheduleModal(person)}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-indigo-100 text-indigo-700 transition hover:border-indigo-300 hover:bg-indigo-50"
                  >
                    <FiCalendarPlus size={19} />
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Create Schedule Modal */}
      {scheduleDoctor && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeScheduleModal();
            }
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-schedule-title"
            className="my-auto w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl"
          >
            {/* Modal header */}
            <div className="flex items-start justify-between bg-gradient-to-r from-indigo-950 to-blue-500 px-6 py-5 text-white">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15">
                  <FiCalendar size={22} />
                </div>

                <div>
                  <h2
                    id="create-schedule-title"
                    className="text-lg font-semibold"
                  >
                    Create Schedule
                  </h2>
                  <p className="mt-1 text-sm text-blue-100">
                    Configure the doctor&apos;s availability
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={closeScheduleModal}
                disabled={submitting}
                aria-label="Close modal"
                className="rounded-lg p-2 text-white/80 transition hover:bg-white/15 hover:text-white"
              >
                <FiX size={20} />
              </button>
            </div>

            <form onSubmit={handleScheduleSubmit} className="space-y-5 p-6">
              {/* Selected doctor */}
              <div className="rounded-xl border border-indigo-100 bg-indigo-50/70 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-indigo-500">
                  Selected doctor
                </p>
                <p className="mt-1 font-semibold text-gray-900">
                  {scheduleDoctor.fullName}
                </p>
                {scheduleDoctor.subtitle && (
                  <p className="mt-0.5 text-sm text-gray-500">
                    {scheduleDoctor.subtitle}
                  </p>
                )}
              </div>

              {/* Day */}
              <div className="space-y-2">
                <label
                  htmlFor="schedule-day"
                  className="block text-sm font-medium text-gray-700"
                >
                  Day of week
                </label>
                <select
                  id="schedule-day"
                  value={dayOfWeek}
                  onChange={(event) => setDayOfWeek(event.target.value)}
                  required
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                >
                  {daysOfWeek.map((day) => (
                    <option key={day.value} value={day.value}>
                      {day.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Time range */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label
                    htmlFor="schedule-start"
                    className="flex items-center gap-2 text-sm font-medium text-gray-700"
                  >
                    <FiClock className="text-indigo-600" />
                    Start time
                  </label>
                  <input
                    id="schedule-start"
                    type="time"
                    value={startTime}
                    onChange={(event) => setStartTime(event.target.value)}
                    required
                    className="w-full rounded-xl border border-gray-200 px-3 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="schedule-end"
                    className="flex items-center gap-2 text-sm font-medium text-gray-700"
                  >
                    <FiClock className="text-indigo-600" />
                    End time
                  </label>
                  <input
                    id="schedule-end"
                    type="time"
                    value={endTime}
                    onChange={(event) => setEndTime(event.target.value)}
                    required
                    className="w-full rounded-xl border border-gray-200 px-3 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                  />
                </div>
              </div>

              <p className="text-xs leading-5 text-gray-500">
                Overlapping periods are checked by the backend when the schedule
                is saved.
              </p>

              {error && (
                <div
                  role="alert"
                  className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                >
                  {error}
                </div>
              )}

              {notice && (
                <div
                  role="status"
                  className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"
                >
                  {notice}
                </div>
              )}

              {/* Footer */}
              <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeScheduleModal}
                  disabled={submitting}
                  className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-900 to-blue-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <FiCalendarPlus size={16} />
                  {submitting ? "Saving..." : "Create Schedule"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </>
  );
}
