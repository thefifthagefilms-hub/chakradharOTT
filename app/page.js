"use client";

import { useEffect, useState } from "react";
import { db } from "../firebase";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
} from "firebase/firestore";
import Link from "next/link";
import Image from "next/image";

/* =========================================
   CINEMATIC HERO
========================================= */

function CinematicHero({ movie }) {
  if (!movie) return null;

  return (
    <section className="relative h-[75vh] md:h-[90vh] w-full overflow-hidden">

      <Image
        src={movie.bannerImage || movie.posterImage}
        alt={movie.title}
        fill
        priority
        className="object-cover scale-105"
      />

      {/* Layered Gradients */}
      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-black/30" />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

      <div className="absolute bottom-20 md:bottom-28 left-6 md:left-16 max-w-3xl space-y-6">

        <h1 className="text-4xl md:text-7xl font-bold leading-tight tracking-tight">
          {movie.title}
        </h1>

        <p className="text-gray-300 text-sm md:text-lg line-clamp-3">
          {movie.tagline || movie.description}
        </p>

        <div className="flex gap-4 flex-wrap">

          <Link
            href={`/movie/${movie.id}`}
            className="bg-red-600 hover:bg-red-700 transition px-8 py-3 rounded-full text-sm md:text-base font-medium shadow-lg"
          >
            ▶ Watch Now
          </Link>

          <span className="bg-white/10 backdrop-blur-xl border border-white/20 px-6 py-3 rounded-full text-sm md:text-base text-gray-200">
            {movie.genre || "Feature Film"}
          </span>

        </div>
      </div>

    </section>
  );
}

/* =========================================
   MOVIE ROW
========================================= */

function MovieRow({ title, movies }) {
  if (!movies?.length) return null;

  return (
    <section className="px-6 md:px-16 py-16">

      <h2 className="text-2xl md:text-3xl font-semibold mb-10 tracking-tight">
        {title}
      </h2>

      <div className="flex gap-6 overflow-x-auto pb-6 scroll-smooth">

        {movies.map((movie) => (
          <Link
            key={movie.id}
            href={`/movie/${movie.id}`}
            className="group min-w-[190px] md:min-w-[240px]"
          >
            <div className="relative aspect-[2/3] w-[190px] md:w-[240px] overflow-hidden rounded-2xl shadow-xl transition-all duration-500 group-hover:scale-[1.08]">

              <Image
                src={movie.posterImage}
                alt={movie.title}
                fill
                sizes="240px"
                className="object-cover transition duration-700 group-hover:scale-110"
              />

              <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                <span className="bg-red-600 px-5 py-2 rounded-full text-xs md:text-sm font-medium shadow-lg">
                  ▶ View
                </span>
              </div>

            </div>

            <h3 className="mt-4 text-sm md:text-base text-gray-300 group-hover:text-white transition line-clamp-1">
              {movie.title}
            </h3>
          </Link>
        ))}

      </div>

    </section>
  );
}

/* =========================================
   HOMEPAGE
========================================= */

export default function Home() {
  const [hero, setHero] = useState(null);
  const [featured, setFeatured] = useState([]);
  const [trending, setTrending] = useState([]);
  const [newReleases, setNewReleases] = useState([]);

  useEffect(() => {
    const fetchHomepage = async () => {

      /* ===== TRENDING (ADMIN CONTROLLED) ===== */
      const trendingQuery = query(
        collection(db, "movies"),
        where("trending", "==", true),
        limit(12)
      );

      const trendingSnap = await getDocs(trendingQuery);
      const trendingMovies = trendingSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setTrending(trendingMovies);

      /* ===== FEATURED (ADMIN CONTROLLED) ===== */
      const featuredQuery = query(
        collection(db, "movies"),
        where("featured", "==", true),
        limit(12)
      );

      const featuredSnap = await getDocs(featuredQuery);
      const featuredMovies = featuredSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setFeatured(featuredMovies);

      /* ===== NEW RELEASES ===== */
      const newQuery = query(
        collection(db, "movies"),
        orderBy("releaseDate", "desc"),
        limit(12)
      );

      const newSnap = await getDocs(newQuery);
      const newMovies = newSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setNewReleases(newMovies);

      /* ===== HERO PRIORITY ===== */
      setHero(
        featuredMovies[0] ||
        trendingMovies[0] ||
        newMovies[0] ||
        null
      );
    };

    fetchHomepage();
  }, []);

  return (
    <div className="bg-black text-white min-h-screen">

      <div className="h-[80px]" />

      <CinematicHero movie={hero} />

      <MovieRow title="Trending Now" movies={trending} />
      <MovieRow title="Top Picks" movies={featured} />
      <MovieRow title="New Releases" movies={newReleases} />

    </div>
  );
}