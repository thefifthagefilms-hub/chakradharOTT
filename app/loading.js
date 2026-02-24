export default function Loading() {
  return (
    <div className="bg-black text-white min-h-screen animate-pulse">

      {/* Navbar Spacer */}
      <div className="h-[80px]" />

      {/* Hero Skeleton */}
      <div className="h-[55vh] bg-zinc-900" />

      {/* Rows */}
      <div className="px-6 md:px-16 py-14 space-y-20">

        {[1, 2, 3].map((row) => (
          <div key={row}>
            <div className="h-6 w-40 bg-zinc-800 mb-8 rounded" />

            <div className="flex gap-6 overflow-hidden">
              {[1, 2, 3, 4, 5].map((item) => (
                <div
                  key={item}
                  className="w-[200px] h-[300px] bg-zinc-800 rounded-2xl"
                />
              ))}
            </div>
          </div>
        ))}

      </div>

    </div>
  );
}