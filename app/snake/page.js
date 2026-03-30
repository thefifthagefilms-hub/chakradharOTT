import SnakeGame from "@/components/SnakeGame";

export const metadata = {
  title: "Snake | Chakradhar OTT Platform",
  description: "A classic Snake mini-game built inside the OTT platform.",
};

export default function SnakePage() {
  return (
    <div className="min-h-screen bg-[#0B0B0F] px-4 py-10 text-white sm:px-6 lg:px-10">
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        <div className="max-w-2xl">
          <p className="text-sm uppercase tracking-[0.3em] text-red-500">
            Mini Game
          </p>
          <h2 className="mt-3 text-4xl font-bold sm:text-5xl">
            Classic Snake
          </h2>
          <p className="mt-3 text-sm text-gray-300 sm:text-base">
            A simple grid-based Snake loop with score tracking, restart, and
            keyboard plus touch-friendly controls.
          </p>
        </div>

        <SnakeGame />
      </div>
    </div>
  );
}
