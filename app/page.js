"use client";

import { useEffect, useState } from "react";
import { db } from "@/firebase";
import {
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  where,
} from "firebase/firestore";
import Link from "next/link";
import Image from "next/image";
import CardWishlistIcon from "@/components/CardWishlistIcon";

/* HERO */
function CinematicHero({ movie }) {
  const fallback =
    "https://images.unsplash.com/photo-1524985069026-dd778a71c7b4";

  if (!movie) return null; // ✅ FIXED (no flicker)

  const image = movie.bannerImage || movie.posterImage || fallback;

  return (
    <section className="relative h-[70vh] md:h-[90vh] w-full overflow-hidden">
      <Image
        src={image}
        alt={movie.title}
        fill
        priority
        className="object-cover"
      />

      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-black/30" />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

      <div className="absolute bottom-16 md:bottom-28 left-4 md:left-16 max-w-3xl space-y-5">
        <h1 className="text-3xl md:text-6xl font-bold">
          {movie.title}
        </h1>

        <p className="text-gray-300 text-sm md:text-lg line-clamp-3">
          {movie.tagline || movie.description}
        </p>

        <Link
          href={`/movie/${movie.id}`}
          className="bg-red-600 px-6 py-3 rounded-full"
        >
          ▶ Watch Now
        </Link>
      </div>
    </section>
  );
}

/* PREMIERE ROW */
function PremiereRow({ premieres }) {
  if (!premieres?.length) return null;

  return (
    <section className="px-4 md:px-16 py-10">
      <h2 className="text-xl md:text-3xl font-semibold mb-6">
        🔴 Live Premieres
      </h2>

      <div className="flex gap-5 overflow-x-auto pb-4">
        {premieres.map((p) => (
          <Link key={p.id} href={`/premiere/${p.id}/join`}>
            <div className="min-w-[240px] relative h-[160px] rounded-2xl overflow-hidden bg-black border border-white/10">
              <div className="absolute inset-0 bg-gradient-to-br from-red-600/40 to-black" />

              <div className="absolute inset-0 p-4 flex flex-col justify-between">
                <span className="text-xs bg-red-600 px-2 py-1 rounded-full animate-pulse">
                  LIVE
                </span>

                <h3 className="text-sm font-semibold">
                  {p.title}
                </h3>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

/* MOVIE ROW */
function MovieRow({ title, movies }) {
  if (!movies?.length) return null;

  return (
    <section className="px-4 md:px-16 py-10">
      <h2 className="text-xl md:text-3xl font-semibold mb-6">
        {title}
      </h2>

      <div className="flex gap-4 overflow-x-auto pb-4">
        {movies.map((movie) => (
          <Link key={movie.id} href={`/movie/${movie.id}`}>
            <div className="relative w-[150px] md:w-[240px] aspect-[2/3] rounded-2xl overflow-hidden">

              <CardWishlistIcon movieId={movie.id} />

              <Image
                src={
                  movie.posterImage ||
                  "https://images.unsplash.com/photo-1524985069026-dd778a71c7b4"
                }
                alt={movie.title}
                fill
                className="object-cover"
              />

            </div>

            <h3 className="mt-2 text-sm text-gray-300">
              {movie.title}
            </h3>
          </Link>
        ))}
      </div>
    </section>
  );
}

/* MAIN */
export default function Home() {
  const [hero, setHero] = useState(null);
  const [featured, setFeatured] = useState([]);
  const [trending, setTrending] = useState([]);
  const [newReleases, setNewReleases] = useState([]);
  const [premieres, setPremieres] = useState([]);
  const [loading, setLoading] = useState(true); // ✅ NEW

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          heroSnap,
          trendingSnap,
          featuredSnap,
          newSnap,
          premiereSnap,
        ] = await Promise.all([
          getDocs(
            query(
              collection(db, "movies"),
              where("isHero", "==", true),
              limit(1)
            )
          ),
          getDocs(
            query(
              collection(db, "movies"),
              where("isTrending", "==", true),
              limit(12)
            )
          ),
          getDocs(
            query(
              collection(db, "movies"),
              where("isFeatured", "==", true),
              limit(12)
            )
          ),
          getDocs(
            query(
              collection(db, "movies"),
              orderBy("releaseDate", "desc"),
              limit(12)
            )
          ),
          getDocs(
            query(
              collection(db, "premieres"),
              orderBy("startTime", "desc"),
              limit(10)
            )
          ),
        ]);

        const now = new Date();

        const premiereData = premiereSnap.docs
          .map((doc) => {
            const data = doc.data();
            const start = data.startTime?.toDate?.();
            const end = data.endTime?.toDate?.();

            let status = "scheduled";
            if (start && now >= start) status = "live";
            if (end && now >= end) status = "ended";

            return { id: doc.id, ...data, status };
          })
          .filter((p) => p.status === "live");

        setPremieres(premiereData);

        const heroMovie =
          heroSnap.docs.map(d => ({ id: d.id, ...d.data() }))[0];

        const trendingMovies = trendingSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        const featuredMovies = featuredSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        const newMovies = newSnap.docs.map(d => ({ id: d.id, ...d.data() }));

        setHero(
          heroMovie ||
          featuredMovies[0] ||
          trendingMovies[0] ||
          newMovies[0] ||
          null
        );

        setTrending(trendingMovies);
        setFeatured(featuredMovies);
        setNewReleases(newMovies);

      } catch (err) {
        console.error("Homepage error:", err);
      } finally {
        setLoading(false); // ✅ FIXED
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="bg-[#0B0B0F] text-white min-h-screen flex items-center justify-center">
        <p className="text-gray-400 text-sm">
          Loading cinematic experience...
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[#0B0B0F] text-white min-h-screen">
      <div className="h-[70px]" />

      <CinematicHero movie={hero} />
      <PremiereRow premieres={premieres} />

      <MovieRow title="Trending Now" movies={trending} />
      <MovieRow title="Top Picks" movies={featured} />
      <MovieRow title="New Releases" movies={newReleases} />
    </div>
  );
}