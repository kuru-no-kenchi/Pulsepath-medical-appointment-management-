"use client";

export default function SchedulePageSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="h-8 w-64 bg-gray-200 rounded mb-3" />
          <div className="h-4 w-48 bg-gray-100 rounded" />
        </div>

        <div className="flex gap-2">
          <div className="h-10 w-28 bg-gray-200 rounded-lg" />
          <div className="h-10 w-28 bg-gray-200 rounded-lg" />
        </div>
      </div>

      {/* Calendar */}
      <div className=" bg-white rounded-xl shadow overflow-hidden">

        {/* Calendar toolbar */}
        <div className="flex justify-between items-center p-4 border-b">
          <div className="flex gap-2">
            <div className="h-9 w-24 bg-gray-200 rounded" />
            <div className="h-9 w-20 bg-gray-200 rounded" />
          </div>

          <div className="h-7 w-52 bg-gray-200 rounded" />

          <div className="flex gap-2">
            <div className="h-9 w-24 bg-gray-200 rounded" />
            <div className="h-9 w-24 bg-gray-200 rounded" />
            <div className="h-9 w-24 bg-gray-200 rounded" />
          </div>
        </div>

        {/* Week header */}
        <div className="grid grid-cols-6 border-b">
          <div className="h-12 border-r bg-gray-50" />

          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-12 border-r flex items-center justify-center"
            >
              <div className="h-4 w-16 bg-gray-200 rounded" />
            </div>
          ))}
        </div>

        {/* Time grid */}
        {[...Array(18)].map((_, row) => (
          <div key={row} className="grid grid-cols-6">
            <div className="h-14 border-r border-b flex items-center justify-center">
              <div className="h-3 w-10 bg-gray-200 rounded" />
            </div>

            {[...Array(5)].map((_, col) => (
              <div
                key={col}
                className="h-14 border-r border-b bg-white"
              />
            ))}
          </div>
        ))}
        </div>
      </div>    
  );
}