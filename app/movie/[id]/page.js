export const runtime = "nodejs";

import { adminDb } from "@/lib/firebaseAdmin";
import CommentSection from "@/components/CommentSection";
import RatingSection from "@/components/RatingSection";
import ViewTracker from "@/components/ViewTracker";

export default async function MovieDetail({ params }) {
  const { id } = params;

  if (!id) {
    return NotFound("Invalid movie.");
  }

  let snapshot;

  try {
    snapshot = await adminDb.collection("movies").doc(id).get();
  } catch (error) {
    console.error("Firestore error:", error);
    return NotFound("Server error.");
  }

  if (!snapshot || !snapshot.exists) {
    return NotFound("Movie not found.");
  }

  const movie = snapshot.data() || {};

  const viewsReal = movie.viewsReal || 0;
  const viewsBoost = movie.viewsBoost || 0;
  const totalViews = viewsReal + viewsBoost;

  return (
    <div className="bg-black text-white min-h-screen relative overflow-hidden">

      <ViewTracker movieId={id} />

      <section className="relative h-[60vh] md:h-[75vh] flex items-end">
        <div
          className="absolute inset-0 bg-cover bg-center scale-105"
          style={{
            backgroundImage: `url(${movie.bannerImage || "/homepage-banner.jpg"})`,
          }}
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent" />

        <div className="relative z-10 w-full px-6 md:px-16 pb-10 md:pb-20">
          <div className="max-w-5xl bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 md:p-10 shadow-[0_0_80px_rgba(0,0,0,0.6)]">
            <h1 className="text-3xl md:text-6xl font-bold mb-4 tracking-tight">
              {movie.title || "Untitled"}
            </h1>

            <p className="text-gray-300 text-sm md:text-lg mb-4">
              {movie.tagline || ""}
            </p>

            <div className="flex flex-wrap gap-4 text-xs md:text-sm text-gray-400">
              <span>{movie.genre || "—"}</span>
              <span>{movie.releaseDate || "—"}</span>
              <span>{totalViews.toLocaleString()} views</span>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 md:px-16 py-12 md:py-20 space-y-14">

        <div className="relative rounded-3xl overflow-hidden border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.03] backdrop-blur-2xl shadow-[0_0_80px_rgba(0,0,0,0.7)]">
          <div className="aspect-video">
            {movie.embedLink ? (
              <iframe
                src={movie.embedLink}
                className="w-full h-full rounded-3xl"
                allowFullScreen
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                Video not available
              </div>
            )}
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 md:p-8 shadow-xl">
          <RatingSection movieId={id} />
        </div>

        <div className="grid lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 md:p-10 shadow-xl">
            <h2 className="text-xl md:text-2xl font-semibold mb-6">
              About the Movie
            </h2>

            <div className="text-gray-300 text-sm md:text-base leading-relaxed max-h-[250px] overflow-y-auto pr-2">
              {movie.description
                ? movie.description.split("\n").map((line, index) => (
                    <p key={index} className="mb-4">
                      {line}
                    </p>
                  ))
                : "No description available."}
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 md:p-8 shadow-xl space-y-6">
            <Info label="Genre" value={movie.genre} />
            <Info label="Release Date" value={movie.releaseDate} />
            <Info label="Director" value={movie.director} />
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 md:p-10 shadow-xl">
          <CommentSection movieId={id} />
        </div>

      </section>
    </div>
  );
}

function NotFound(message) {
  return (
    <div className="bg-black text-white min-h-screen flex items-center justify-center">
      {message}
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">
        {label}
      </p>
      <p className="font-medium text-lg">
        {value || "Not Available"}
      </p>
    </div>
  );
}