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
import CardWishlistIcon from "@/components/CardWishlistIcon";

/* =========================================
   CINEMATIC HERO
========================================= */

function CinematicHero({ movie }) {
  if (!movie) return null;

  return (
    <section className="relative h-[70vh] sm:h-[80vh] md:h-[90vh] w-full overflow-hidden">
      <Image
        src={movie.bannerImage || movie.posterImage}
        alt={movie.title}
        fill
        priority
        sizes="100vw"
        className="object-cover scale-105 transition-transform duration-[4000ms]"
      />

      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-black/30" />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

      <div className="absolute bottom-16 sm:bottom-20 md:bottom-28 left-4 sm:left-6 md:left-16 right-4 max-w-3xl space-y-5 md:space-y-6">
        <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-tight">
          {movie.title}
        </h1>

        <p className="text-gray-300 text-sm sm:text-base md:text-lg line-clamp-3">
          {movie.tagline || movie.description}
        </p>

        <div className="flex flex-wrap gap-3 sm:gap-4">
          <Link
            href={`/movie/${movie.id}`}
            className="bg-red-600 hover:bg-red-700 transition-all duration-300 px-6 sm:px-8 py-3 rounded-full text-sm sm:text-base font-medium shadow-lg hover:scale-105"
          >
            ▶ Watch Now
          </Link>

          <span className="bg-white/10 backdrop-blur-md border border-white/20 px-5 sm:px-6 py-3 rounded-full text-sm sm:text-base text-gray-200">
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
    <section className="px-4 sm:px-6 md:px-16 py-10 sm:py-12 md:py-16">
      <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold mb-6 md:mb-10 tracking-tight">
        {title}
      </h2>

      {/* ✅ FIXED HERE */}
      <div className="flex gap-4 sm:gap-6 overflow-x-auto pb-4 scroll-smooth">
        {movies.map((movie) => (
          <Link
            key={movie.id}
            href={`/movie/${movie.id}`}
            className="group min-w-[150px] sm:min-w-[180px] md:min-w-[240px]"
          >
            <div className="relative aspect-[2/3] w-[150px] sm:w-[180px] md:w-[240px] overflow-hidden rounded-2xl shadow-lg transition-all duration-500 group-hover:scale-105">
              <CardWishlistIcon movieId={movie.id} />

              <Image
                src={movie.posterImage}
                alt={movie.title}
                fill
                sizes="(max-width: 768px) 150px, (max-width: 1024px) 180px, 240px"
                className="object-cover transition duration-700 group-hover:scale-110"
              />

              <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                <span className="bg-red-600 px-4 py-2 rounded-full text-xs sm:text-sm font-medium shadow-md">
                  ▶ View
                </span>
              </div>
            </div>

            <h3 className="mt-3 text-xs sm:text-sm md:text-base text-gray-300 group-hover:text-white transition line-clamp-1">
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
      try {
        const trendingQuery = query(
          collection(db, "movies"),
          where("trending", "==", true),
          limit(12)
        );

        const featuredQuery = query(
          collection(db, "movies"),
          where("featured", "==", true),
          limit(12)
        );

        const newQuery = query(
          collection(db, "movies"),
          orderBy("releaseDate", "desc"),
          limit(12)
        );

        const [trendingSnap, featuredSnap, newSnap] = await Promise.all([
          getDocs(trendingQuery),
          getDocs(featuredQuery),
          getDocs(newQuery),
        ]);

        const trendingMovies = trendingSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        const featuredMovies = featuredSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        const newMovies = newSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setTrending(trendingMovies);
        setFeatured(featuredMovies);
        setNewReleases(newMovies);

        setHero(
          featuredMovies[0] ||
          trendingMovies[0] ||
          newMovies[0] ||
          null
        );
      } catch (error) {
        console.error("Homepage fetch error:", error);
      }
    };

    fetchHomepage();
  }, []);

  return (
    <div className="bg-[#0B0B0F] text-white min-h-screen">
      <div className="h-[70px] md:h-[80px]" />

      <CinematicHero movie={hero} />

      <MovieRow title="Trending Now" movies={trending} />
      <MovieRow title="Top Picks" movies={featured} />
      <MovieRow title="New Releases" movies={newReleases} />
    </div>
  );
}