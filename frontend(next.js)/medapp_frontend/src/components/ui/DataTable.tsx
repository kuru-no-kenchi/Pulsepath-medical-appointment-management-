import React from "react";

export type DataTableColumn<T> = {
  key?: keyof T;
  header: string;
  sortable?: boolean;
  render: (item: T) => React.ReactNode;
  className?: string;
};

type DataTableProps<T> = {
  data: T[];
  columns: DataTableColumn<T>[];

  keyExtractor: (item: T) => string;

  // Sorting
  sortKey?: keyof T | null;
  sortDirection?: "asc" | "desc";
  onSort?: (key: keyof T) => void;
  onClear?: () => void;

  // Selection
  selectable?: boolean;
  selectedIds?: string[];
  onSelectionChange?: (ids: string[]) => void;
};

export default function DataTable<T>({
  data,
  columns,
  keyExtractor,

  sortKey = null,
  sortDirection = "asc",
  onSort,
  onClear,

  selectable = false,
  selectedIds = [],
  onSelectionChange,
}: DataTableProps<T>) {
  const hasActiveSort = sortKey !== null && sortKey !== undefined;

  const allSelected =
    selectable &&
    data.length > 0 &&
    data.every((item) => selectedIds.includes(keyExtractor(item)));

  const someSelected =
    selectable &&
    data.some((item) => selectedIds.includes(keyExtractor(item))) &&
    !allSelected;

  const handleSelectAll = () => {
    if (!onSelectionChange) return;

    const currentPageIds = data.map(keyExtractor);

    if (allSelected) {
      // Remove only the current page's rows
      onSelectionChange(
        selectedIds.filter((id) => !currentPageIds.includes(id))
      );
    } else {
      // Add current page's rows without duplicates
      onSelectionChange([
        ...selectedIds,
        ...currentPageIds.filter((id) => !selectedIds.includes(id)),
      ]);
    }
  };

  const handleSelectRow = (item: T) => {
    if (!onSelectionChange) return;

    const id = keyExtractor(item);

    if (selectedIds.includes(id)) {
      onSelectionChange(
        selectedIds.filter((selectedId) => selectedId !== id)
      );
    } else {
      onSelectionChange([...selectedIds, id]);
    }
  };

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-100 bg-white shadow-sm">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 bg-gradient-to-r from-indigo-900 to-blue-600">
            {selectable && (
              <th
                scope="col"
                className="w-12 p-4 text-center"
              >
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={(element) => {
                    if (element) {
                      element.indeterminate = someSelected;
                    }
                  }}
                  onChange={handleSelectAll}
                  aria-label="Select all rows"
                  className="h-4 w-4 rounded border-gray-300"
                />
              </th>
            )}

            {columns.map((column) => {
              const columnKey =
                column.key?.toString() ?? column.header;

              return (
                <th
                  key={columnKey}
                  scope="col"
                  className={`p-4 text-left font-semibold text-white ${
                    column.className ?? ""
                  }`}
                >
                  {column.sortable && column.key ? (
                    <button
                      type="button"
                      onClick={() => onSort?.(column.key!)}
                      aria-label={`Sort by ${column.header}`}
                      className="flex items-center gap-2 transition hover:text-gray-200"
                    >
                      <span>{column.header}</span>

                      <span
                        aria-hidden="true"
                        className="text-xs text-gray-300"
                      >
                        {sortKey === column.key
                          ? sortDirection === "asc"
                            ? "▲"
                            : "▼"
                          : "↕"}
                      </span>
                    </button>
                  ) : (
                    column.header
                  )}
                </th>
              );
            })}
          </tr>
        </thead>

        <tbody>
          {data.length > 0 ? (
            data.map((item) => {
              const id = keyExtractor(item);
              const isSelected = selectedIds.includes(id);

              return (
                <tr
                  key={id}
                  className={`border-t border-gray-200 transition ${
                    isSelected
                      ? "bg-indigo-50"
                      : "hover:bg-gray-50"
                  }`}
                >
                  {selectable && (
                    <td className="w-12 p-4 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleSelectRow(item)}
                        aria-label={`Select row ${id}`}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                    </td>
                  )}

                  {columns.map((column) => {
                    const columnKey =
                      column.key?.toString() ?? column.header;

                    return (
                      <td
                        key={columnKey}
                        className={`p-4 ${
                          column.className ?? ""
                        }`}
                      >
                        {column.render(item)}
                      </td>
                    );
                  })}
                </tr>
              );
            })
          ) : (
            <tr>
              <td
                colSpan={
                  columns.length + (selectable ? 1 : 0)
                }
                className="p-8 text-center text-gray-500"
              >
                No data found.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {hasActiveSort && onClear && (
        <div className="flex items-center justify-end border-t border-gray-100 px-4 py-3">
          <button
            type="button"
            aria-label="Reset"
            onClick={onClear}
            className="text-sm font-medium text-gray-500 transition hover:text-indigo-600"
          >
            Reset sorting
          </button>
        </div>
      )}
    </div>
  );
}