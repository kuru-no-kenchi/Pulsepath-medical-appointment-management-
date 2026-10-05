"use client";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center p-6">
      <div className="max-w-md text-center">
        <h2 className="text-2xl font-semibold text-gray-900">
          Something went wrong
        </h2>

        <p className="mt-2 text-gray-500">
          We couldn't load this page.
          Please try again.
        </p>

        <button
          type="button"
          aria-label="Try Again"
          onClick={() => reset()}
          className="mt-6 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-700"
        >
          Try again
        </button>
      </div>
    </div>
  );
}