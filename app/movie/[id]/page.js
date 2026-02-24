import { db } from "../../../firebase";
import { doc, getDoc } from "firebase/firestore";
import CommentSection from "../../../components/CommentSection";
import RatingSection from "../../../components/RatingSection";
import ViewTracker from "../../../components/ViewTracker";
import MovieAnimatedWrapper from "../../../components/MovieAnimatedWrapper";

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

      {/* Track Real View */}
      <ViewTracker movieId={id} />

      {/* HERO SECTION */}
      <section className="relative h-[70vh] md:h-[80vh] flex items-end">

        <div
          className="absolute inset-0 bg-cover bg-center scale-105"
          style={{ backgroundImage: `url(${movie.bannerImage})` }}
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-black/30" />

        <div className="relative z-10 w-full px-6 md:px-16 pb-16 md:pb-24">
          <div className="max-w-5xl bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-12 shadow-[0_0_80px_rgba(0,0,0,0.6)]">

            <h1 className="text-3xl md:text-6xl font-bold mb-4 tracking-tight leading-tight">
              {movie.title}
            </h1>

            <p className="text-gray-300 text-base md:text-lg mb-6">
              {movie.tagline}
            </p>

            <div className="flex flex-wrap gap-4 md:gap-6 text-sm text-gray-400">
              <span>{movie.genre || "—"}</span>
              <span>{movie.releaseDate || "—"}</span>
              <span>{totalViews.toLocaleString()} views</span>
            </div>

          </div>
        </div>
      </section>

      {/* MAIN CONTENT */}
      <section className="px-6 md:px-16 py-16 md:py-24 space-y-16">

        {/* Video Player */}
        <MovieAnimatedWrapper>
          <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-[0_0_60px_rgba(0,0,0,0.7)]">
            <div className="aspect-video">
              <iframe
                src={movie.embedLink}
                className="w-full h-full rounded-3xl"
                allowFullScreen
              />
            </div>
          </div>
        </MovieAnimatedWrapper>

        {/* Rating Section */}
        <MovieAnimatedWrapper delay={0.1}>
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-10 shadow-xl">
            <RatingSection movieId={id} />
          </div>
        </MovieAnimatedWrapper>

        {/* Info Grid */}
        <MovieAnimatedWrapper delay={0.2}>
          <div className="grid md:grid-cols-3 gap-12">

            {/* Description */}
            <div className="md:col-span-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-12 shadow-xl">

              <h2 className="text-2xl font-semibold mb-8">
                About the Movie
              </h2>

              <div className="text-gray-300 leading-relaxed text-base md:text-lg space-y-5">
                {movie.description?.split("\n").map((line, index) => (
                  <p key={index}>{line}</p>
                ))}
              </div>

            </div>

            {/* Side Panel */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-xl space-y-6">

              <div>
                <p className="text-sm text-gray-400 mb-1">Genre</p>
                <p className="font-medium text-lg">
                  {movie.genre || "Not Available"}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-400 mb-1">Release Date</p>
                <p className="font-medium text-lg">
                  {movie.releaseDate || "Not Available"}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-400 mb-1">Director</p>
                <p className="font-medium text-lg">
                  {movie.director || movie.directorBio || "Not Available"}
                </p>
              </div>

            </div>

          </div>
        </MovieAnimatedWrapper>

        {/* Comments */}
        <MovieAnimatedWrapper delay={0.3}>
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-12 shadow-xl">
            <CommentSection movieId={id} />
          </div>
        </MovieAnimatedWrapper>

      </section>

    </div>
  );
}