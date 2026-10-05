import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({
  page,
  totalPages,
  onPageChange,
}: PaginationProps) {
  return (
    <div className="flex items-center justify-between mt-6">
      <p className="text-sm text-gray-500">
        Page {page} of {totalPages}
      </p>

      <div className="flex gap-2">
        <button
          disabled={page === 1}
          aria-label="Previous"
          onClick={() => onPageChange(page - 1)}
          className="flex items-center cursor-pointer gap-2 border rounded-lg px-3 py-2 hover:bg-gradient-to-r from-indigo-900 to-blue-500 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <FiChevronLeft aria-hidden="true"/>
          Previous
        </button>

        <button
          disabled={page === totalPages}
          aria-label="Next"
          onClick={() => onPageChange(page + 1)}
          className="flex items-center cursor-pointer gap-2 border rounded-lg px-3 py-2 hover:bg-gradient-to-r from-indigo-900 to-blue-500 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Next
          <FiChevronRight aria-hidden="true"/>
        </button>
      </div>
    </div>
  );
}
