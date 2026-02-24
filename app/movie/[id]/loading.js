export default function MovieLoading() {
  return (
    <div className="bg-black text-white min-h-screen animate-pulse">

      {/* Hero */}
      <div className="h-[70vh] bg-zinc-900" />

      <div className="px-6 md:px-16 py-20 space-y-16">

        {/* Video */}
        <div className="aspect-video bg-zinc-800 rounded-3xl" />

        {/* Rating */}
        <div className="h-32 bg-zinc-800 rounded-3xl" />

        {/* Info Grid */}
        <div className="grid md:grid-cols-3 gap-12">
          <div className="md:col-span-2 h-64 bg-zinc-800 rounded-3xl" />
          <div className="h-64 bg-zinc-800 rounded-3xl" />
        </div>

        {/* Comments */}
        <div className="h-40 bg-zinc-800 rounded-3xl" />

      </div>

    </div>
  );
}