"use client";

export default function Error({ error, reset }) {
  return (
    <div className="bg-black text-white min-h-screen flex flex-col items-center justify-center gap-6">
      <h2 className="text-2xl font-semibold">Something went wrong.</h2>
      <button
        onClick={() => reset()}
        className="px-6 py-2 bg-red-600 rounded-lg"
      >
        Try Again
      </button>
    </div>
  );
}