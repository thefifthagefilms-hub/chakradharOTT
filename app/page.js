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
        className="object-cover scale-105"
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

        <div className="flex gap-3">
          <Link
            href={`/movie/${movie.id}`}
            className="bg-red-600 px-6 py-3 rounded-full text-sm md:text-base"
          >
            ▶ Watch Now
          </Link>

          <span className="bg-white/10 px-5 py-3 rounded-full text-sm">
            {movie.genre || "Feature Film"}
          </span>
        </div>
      </div>
    </section>
  );
}

/* =========================================
   PREMIERE ROW (NEW)
========================================= */

function PremiereRow({ premieres }) {
  if (!premieres?.length) return null;

  return (
    <section className="px-4 md:px-16 py-10">

      <h2 className="text-xl md:text-3xl font-semibold mb-6">
        🔴 Live Premieres
      </h2>

      <div className="flex gap-4 overflow-x-auto pb-4">

        {premieres.map((p) => (
          <Link
            key={p.id}
            href={`/premiere/${p.id}/join`}
            className="min-w-[220px] md:min-w-[260px]"
          >
            <div className="relative h-[140px] rounded-2xl overflow-hidden border border-white/10 bg-black">

              <div className="absolute inset-0 bg-gradient-to-br from-red-600/30 to-black" />

              <div className="absolute inset-0 p-4 flex flex-col justify-between">

                <span className="text-xs bg-red-600 px-2 py-1 rounded-full w-fit">
                  LIVE
                </span>

                <div>
                  <h3 className="text-sm font-semibold line-clamp-2">
                    {p.title}
                  </h3>

                  <p className="text-xs text-gray-300">
                    {p.startTime
                      ? new Date(p.startTime).toLocaleString()
                      : "Now Streaming"}
                  </p>
                </div>

              </div>

            </div>
          </Link>
        ))}

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
    <section className="px-4 md:px-16 py-10">
      <h2 className="text-xl md:text-3xl font-semibold mb-6">
        {title}
      </h2>

      <div className="flex gap-4 overflow-x-auto pb-4">
        {movies.map((movie) => (
          <Link
            key={movie.id}
            href={`/movie/${movie.id}`}
            className="group min-w-[150px] md:min-w-[240px]"
          >
            <div className="relative aspect-[2/3] w-[150px] md:w-[240px] rounded-2xl overflow-hidden">
              <CardWishlistIcon movieId={movie.id} />

              <Image
                src={movie.posterImage}
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

/* =========================================
   HOMEPAGE
========================================= */

export default function Home() {
  const [hero, setHero] = useState(null);
  const [featured, setFeatured] = useState([]);
  const [trending, setTrending] = useState([]);
  const [newReleases, setNewReleases] = useState([]);
  const [premieres, setPremieres] = useState([]); // ✅ NEW

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

        // ✅ LIVE PREMIERES ONLY
        const premiereQuery = query(
          collection(db, "premieres"),
          where("status", "==", "live"),
          orderBy("startTime", "desc"),
          limit(10)
        );

        const [trendingSnap, featuredSnap, newSnap, premiereSnap] =
          await Promise.all([
            getDocs(trendingQuery),
            getDocs(featuredQuery),
            getDocs(newQuery),
            getDocs(premiereQuery),
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

        const premiereData = premiereSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setTrending(trendingMovies);
        setFeatured(featuredMovies);
        setNewReleases(newMovies);
        setPremieres(premiereData); // ✅ SET

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

      {/* ✅ NEW SECTION */}
      <PremiereRow premieres={premieres} />

      <MovieRow title="Trending Now" movies={trending} />
      <MovieRow title="Top Picks" movies={featured} />
      <MovieRow title="New Releases" movies={newReleases} />
    </div>
  );
}