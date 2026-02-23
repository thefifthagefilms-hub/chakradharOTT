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
      <div className="bg-black text-white min-h-screen px-12 py-12">
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
      <section className="relative h-[75vh] flex items-end">

        <div
          className="absolute inset-0 bg-cover bg-center scale-105"
          style={{ backgroundImage: `url(${movie.bannerImage})` }}
        />

        {/* Dark cinematic overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-black/40 backdrop-blur-sm" />

        {/* Glass info panel */}
        <div className="relative z-10 w-full px-16 pb-20">
          <div className="max-w-5xl bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-10 shadow-2xl">

            <h1 className="text-5xl md:text-6xl font-bold mb-4 tracking-tight">
              {movie.title}
            </h1>

            <p className="text-gray-300 text-lg mb-6">
              {movie.tagline}
            </p>

            {/* Metadata Row */}
            <div className="flex flex-wrap gap-6 text-sm text-gray-400">
              <span>{movie.genre}</span>
              <span>{movie.releaseDate}</span>
              <span>{totalViews.toLocaleString()} views</span>
            </div>

          </div>
        </div>

      </section>

      {/* MAIN CONTENT */}
      <section className="px-16 py-20 space-y-16">

        {/* Video Player */}
        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
          <div className="aspect-video">
            <iframe
              src={movie.embedLink}
              className="w-full h-full"
              allowFullScreen
            />
          </div>
        </div>

        {/* Rating Section */}
        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-8 shadow-xl">
          <RatingSection movieId={id} />
        </div>

        {/* Two Column Info */}
        <div className="grid md:grid-cols-3 gap-12">

          <div className="md:col-span-2 bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-10 shadow-xl">
            <h2 className="text-2xl font-semibold mb-6">
              About the Movie
            </h2>
            <p className="text-gray-300 leading-relaxed text-lg">
              {movie.description}
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-8 shadow-xl space-y-4">
            <div>
              <p className="text-sm text-gray-400">Genre</p>
              <p className="font-medium">{movie.genre}</p>
            </div>

            <div>
              <p className="text-sm text-gray-400">Release Date</p>
              <p className="font-medium">{movie.releaseDate}</p>
            </div>

            <div>
              <p className="text-sm text-gray-400">Director</p>
              <p className="font-medium">{movie.directorBio}</p>
            </div>
          </div>

        </div>

        {/* Comments */}
        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-10 shadow-xl">
          <CommentSection movieId={id} />
        </div>

      </section>

    </div>
  );
}