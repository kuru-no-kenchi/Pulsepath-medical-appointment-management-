"use client";

import { FiX } from "react-icons/fi";
import RoundedSelect from "./RoundedSelect";

interface FilterOption {
  label: string;
  value: string;
}

interface TableFiltersProps {
  filters: {
    label: string;
    value: string;
    options: FilterOption[];
    onChange: (value: string) => void;
  }[];

  onClear: () => void;
}

export default function TableFilters({ filters, onClear }: TableFiltersProps) {
  const hasActiveFilters = filters.some((filter) => filter.value !== "all");

  return (
    <div className="flex flex-wrap items-center gap-3">
      {filters.map((filter) => (
        <div key={filter.label} className="relative">
          <RoundedSelect
            value={filter.value}
            options={filter.options}
            placeholder={`${filter.label}: All`}
            onChange={(value) => filter.onChange(value)}
          />
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
            ▼
          </span>
        </div>
      ))}

      {hasActiveFilters && (
        <button
          type="button"
          onClick={onClear}
          aria-label="Clear"
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-500 transition hover:bg-gray-100 hover:text-gray-700"
        >
          <FiX size={15} aria-hidden="true" />
          Clear filters
        </button>
      )}
    </div>
  );
}
