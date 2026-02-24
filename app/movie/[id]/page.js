import { db } from "../../../firebase";
import { doc, getDoc } from "firebase/firestore";
import CommentSection from "../../../components/CommentSection";
import RatingSection from "../../../components/RatingSection";
import ViewTracker from "../../../components/ViewTracker";

export default async function MovieDetail({ params }) {
  const resolvedParams = await params;
  const id = resolvedParams.id;

  const docRef = doc(db, "movies", id);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    return (
      <div className="bg-black text-white min-h-screen flex items-center justify-center">
        Movie not found.
      </div>
    );
  }

  const movie = docSnap.data();

  const viewsReal = movie.viewsReal || 0;
  const viewsBoost = movie.viewsBoost || 0;
  const totalViews = viewsReal + viewsBoost;

  return (
    <div className="bg-black text-white min-h-screen relative overflow-hidden">

      <ViewTracker movieId={id} />

      {/* HERO SECTION */}
      <section className="relative h-[60vh] md:h-[75vh] flex items-end">

        <div
          className="absolute inset-0 bg-cover bg-center scale-105"
          style={{ backgroundImage: `url(${movie.bannerImage})` }}
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent" />

        <div className="relative z-10 w-full px-6 md:px-16 pb-10 md:pb-20">
          <div className="max-w-5xl bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 md:p-10 shadow-[0_0_80px_rgba(0,0,0,0.6)]">

            <h1 className="text-3xl md:text-6xl font-bold mb-4 tracking-tight">
              {movie.title}
            </h1>

            <p className="text-gray-300 text-sm md:text-lg mb-4">
              {movie.tagline}
            </p>

            <div className="flex flex-wrap gap-4 text-xs md:text-sm text-gray-400">
              <span>{movie.genre || "—"}</span>
              <span>{movie.releaseDate || "—"}</span>
              <span>{totalViews.toLocaleString()} views</span>
            </div>

          </div>
        </div>
      </section>

      {/* MAIN CONTENT */}
      <section className="px-4 md:px-16 py-12 md:py-20 space-y-14">

        {/* PREMIUM VIDEO CONTAINER */}
        <div className="relative rounded-3xl overflow-hidden border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.03] backdrop-blur-2xl shadow-[0_0_80px_rgba(0,0,0,0.7)]">

          <div className="absolute inset-0 rounded-3xl border border-white/10 pointer-events-none" />

          <div className="aspect-video">
            <iframe
              src={movie.embedLink}
              className="w-full h-full rounded-3xl"
              allowFullScreen
            />
          </div>

        </div>

        {/* RATING */}
        <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 md:p-8 shadow-xl">
          <RatingSection movieId={id} />
        </div>

        {/* INFO GRID */}
        <div className="grid lg:grid-cols-3 gap-10">

          {/* DESCRIPTION (COLLAPSIBLE STYLE) */}
          <div className="lg:col-span-2 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 md:p-10 shadow-xl">

            <h2 className="text-xl md:text-2xl font-semibold mb-6">
              About the Movie
            </h2>

            <div className="text-gray-300 text-sm md:text-base leading-relaxed max-h-[250px] overflow-y-auto pr-2">
              {movie.description?.split("\n").map((line, index) => (
                <p key={index} className="mb-4">
                  {line}
                </p>
              ))}
            </div>

          </div>

          {/* SIDE INFO */}
          <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 md:p-8 shadow-xl space-y-6">

            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">
                Genre
              </p>
              <p className="font-medium text-lg">
                {movie.genre || "Not Available"}
              </p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">
                Release Date
              </p>
              <p className="font-medium text-lg">
                {movie.releaseDate || "Not Available"}
              </p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">
                Director
              </p>
              <p className="font-medium text-lg">
                {movie.director || movie.directorBio || "Not Available"}
              </p>
            </div>

          </div>

        </div>

        {/* COMMENTS */}
        <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 md:p-10 shadow-xl">
          <CommentSection movieId={id} />
        </div>

      </section>

    </div>
  );
}