"use client";

import { useEffect, useState } from "react";
import { db } from "../firebase";
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
  if (!movie) return null;

  return (
    <section className="relative h-[70vh] md:h-[90vh] w-full overflow-hidden">
      <Image
        src={movie.bannerImage || movie.posterImage}
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
          <Link
            key={p.id}
            href={`/premiere/${p.id}/join`}
            className="min-w-[240px] group"
          >
            <div className="relative h-[160px] rounded-2xl overflow-hidden border border-white/10 bg-black group-hover:scale-[1.03] transition">

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
              <Image src={movie.posterImage} alt={movie.title} fill />
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [trendingSnap, featuredSnap, newSnap, premiereSnap] =
          await Promise.all([
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
            const start = data.startTime ? new Date(data.startTime) : null;
            const end = data.endTime ? new Date(data.endTime) : null;

            let status = "scheduled";
            if (start && now >= start) status = "live";
            if (end && now >= end) status = "ended";

            return { id: doc.id, ...data, status };
          })
          .filter((p) => p.status === "live");

        setPremieres(premiereData);

        const trendingMovies = trendingSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        const featuredMovies = featuredSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        const newMovies = newSnap.docs.map(d => ({ id: d.id, ...d.data() }));

        setTrending(trendingMovies);
        setFeatured(featuredMovies);
        setNewReleases(newMovies);

        setHero(featuredMovies[0] || trendingMovies[0] || newMovies[0]);

      } catch (err) {
        console.error("Homepage error:", err);
      }
    };

    fetchData();
  }, []);

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