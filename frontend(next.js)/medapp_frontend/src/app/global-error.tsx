"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div className="flex min-h-screen items-center justify-center p-6">
          <div className="max-w-md text-center">
            <h2 className="text-2xl font-semibold">
              Something went wrong
            </h2>

            <p className="mt-2 text-gray-500">
              Please try again.
            </p>

            <button
            aria-label="Try Again"
              onClick={() => reset()}
              className="mt-6 rounded-lg bg-indigo-600 px-5 py-2.5 text-white"
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}