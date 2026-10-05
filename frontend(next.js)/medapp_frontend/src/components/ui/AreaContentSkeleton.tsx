export default function AreaContentSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="h-8 w-64 bg-gray-200 rounded animate-pulse skeleton-shimmer" />
          <div className="h-4 w-40 bg-gray-200 rounded animate-pulse mt-2 skeleton-shimmer" />
        </div>

        <div className="h-10 w-36 bg-gray-200 rounded-lg animate-pulse skeleton-shimmer" />
      </div>

      {/* Search */}
      <div className="h-10 w-96 bg-gray-200 rounded-lg animate-pulse skeleton-shimmer" />

      {/* Table */}
      <div
        className="rounded-2xl
shadow-sm
overflow-hidden
bg-white skeleton-shimmer"
      >
        {/* Table Header */}
        <div className="grid grid-cols-5 bg-gray-50 border-b p-4 skeleton-shimmer">
          {[1, 2, 3, 4, 5].map((item) => (
            <div
              key={item}
              className="h-4 w-20 bg-gray-200 rounded animate-pulse skeleton-shimmer"
            />
          ))}
        </div>

        {/* Rows */}
        {[1, 2, 3, 4, 5].map((row) => (
          <div key={row} className="grid grid-cols-5 items-center p-4 border-b">
            <div className="h-4 w-32 bg-gray-200 rounded animate-pulse skeleton-shimmer" />
            <div className="h-4 w-40 bg-gray-200 rounded animate-pulse skeleton-shimmer" />
            <div className="h-4 w-24 bg-gray-200 rounded animate-pulse skeleton-shimmer" />
            <div className="h-4 w-28 bg-gray-200 rounded animate-pulse skeleton-shimmer" />

            <div className="flex justify-end gap-2">
              <div className="h-8 w-8 bg-gray-200 rounded animate-pulse skeleton-shimmer" />
              <div className="h-8 w-8 bg-gray-200 rounded animate-pulse skeleton-shimmer" />
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex justify-between">
        <div className="h-4 w-28 bg-gray-200 rounded animate-pulse skeleton-shimmer" />

        <div className="flex gap-2">
          <div className="h-8 w-20 bg-gray-200 rounded animate-pulse skeleton-shimmer" />
          <div className="h-8 w-20 bg-gray-200 rounded animate-pulse skeleton-shimmer" />
        </div>
      </div>
    </div>
  );
}
