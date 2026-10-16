"use client";

import { useAvailableSlots } from "@/hooks/useAvailableSlots";

interface DoctorAvailabilityProps {
  doctorId: string;
  date: string;
  selectedSlot: string | null;
  onDateChange: (date: string) => void;
  onSlotSelect: (slot: string) => void;
}

export default function DoctorAvailability({
  doctorId,
  date,
  selectedSlot,
  onDateChange,
  onSlotSelect,
}: DoctorAvailabilityProps) {
  const {
    data: availableSlots = [],
    isLoading,
    isFetching,
    isError
  } = useAvailableSlots(doctorId, date);

  const handleSlotSelect = (slot: string) => {
    onSlotSelect(slot);
  };

  return (
    <div className="space-y-4 rounded-xl border border-blue-100 bg-blue-50/45 p-4 sm:p-5">
      {/* Date */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <label
          htmlFor="appointment-date"
          className="mb-2 block text-sm font-semibold text-slate-800"
        >
          Select date
        </label>

        <input
          id="appointment-date"
          type="date"
          value={date}
          onChange={(e) => {
            onDateChange(e.target.value);
          }}
          className="rounded-lg border border-blue-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
        />
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="h-11 animate-pulse rounded-lg bg-blue-100"
            />
          ))}
        </div>
      )}

      {/* Error */}
      {isError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Unable to load available appointment slots.
        </div>
      )}

      {/* Empty */}
      {!isLoading && !isError && availableSlots.length === 0 && (
        <div className="rounded-lg border border-dashed border-slate-300 bg-white/70 p-5 text-center text-sm text-slate-500">
          No available times for this date.
        </div>
      )}

      {/* Slots */}
      {!isLoading && !isError && availableSlots.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-800">Available times</h3>

            {isFetching && (
              <span className="text-xs text-slate-500">Updating...</span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {availableSlots.map((slot) => {
              const isSelected = selectedSlot === slot;

              return (
                <button
                  key={slot}
                  type="button"
                  onClick={() => handleSlotSelect(slot)}
                  className={`rounded-lg border px-4 py-3 text-sm font-medium transition ${
                    isSelected
                      ? "border-blue-600 bg-blue-600 text-white shadow-sm shadow-blue-600/20"
                      : "border-slate-200 bg-white text-slate-700 hover:border-blue-400 hover:bg-blue-50"
                  }`}
                >
                  {formatTime(slot)}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function formatTime(time: string) {
  const [hours, minutes] = time.split(":");

  return `${hours}:${minutes}`;
}
