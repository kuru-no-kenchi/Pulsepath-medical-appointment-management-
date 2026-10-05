export default function StatsPageSkeleton() {

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-4">

        {[1,2,3,4].map((item) => (
          <div
            key={item}
            className="h-28 rounded-xl bg-gray-200 animate-pulse shimmer-skeleton"
          />
        ))}

      </div>

      <div className="h-64 rounded-xl bg-gray-200 animate-pulse" />

      <div className="grid grid-cols-2 gap-4">

        <div className="h-48 rounded-xl bg-gray-200 animate-pulse" />

        <div className="h-48 rounded-xl bg-gray-200 animate-pulse" />

      </div>

    </div>
  );
}