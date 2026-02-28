"use client";

import { useEffect, useState, useMemo } from "react";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import Link from "next/link";
import Image from "next/image";

function CinematicHero({ movie }) {
  if (!movie) return null;

  return (
    <section className="relative h-[70vh] md:h-[85vh] w-full overflow-hidden">

      {/* Background */}
      <Image
        src={movie.bannerImage || movie.posterImage}
        alt={movie.title}
        fill
        priority
        className="object-cover"
      />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-black/30" />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

      {/* Content */}
      <div className="absolute bottom-16 md:bottom-24 left-6 md:left-16 max-w-2xl space-y-6">

        <h1 className="text-3xl md:text-6xl font-bold leading-tight">
          {movie.title}
        </h1>

        <p className="text-gray-300 text-sm md:text-lg line-clamp-3">
          {movie.tagline || movie.description}
        </p>

        <div className="flex gap-4 flex-wrap">

          <Link
            href={`/movie/${movie.id}`}
            className="bg-red-600 hover:bg-red-700 transition px-6 py-3 rounded-full text-sm md:text-base font-medium"
          >
            ▶ Watch Now
          </Link>

          <span className="bg-white/10 backdrop-blur-lg border border-white/20 px-5 py-3 rounded-full text-sm md:text-base text-gray-200">
            {movie.genre || "Feature Film"}
          </span>

        </div>

      </div>

    </section>
  );
}

function MovieRow({ title, movies }) {
  if (!movies.length) return null;

  return (
    <section className="px-6 md:px-16 py-16">

      <h2 className="text-2xl md:text-3xl font-semibold mb-10 tracking-tight">
        {title}
      </h2>

      <div className="flex gap-6 overflow-x-auto pb-6">

        {movies.map((movie) => (
          <Link
            key={movie.id}
            href={`/movie/${movie.id}`}
            className="group min-w-[180px] md:min-w-[220px]"
          >
            <div className="relative aspect-[2/3] w-[180px] md:w-[220px] overflow-hidden rounded-2xl shadow-lg transition duration-500 group-hover:-translate-y-3">

              <Image
                src={movie.posterImage}
                alt={movie.title}
                fill
                sizes="220px"
                className="object-cover transition duration-700 group-hover:scale-110"
              />

              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                <span className="bg-white/10 backdrop-blur-lg border border-white/20 px-4 py-2 rounded-full text-xs md:text-sm">
                  View Details
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

export default function Home() {
  const [movies, setMovies] = useState([]);

  useEffect(() => {
    const fetchMovies = async () => {
      const snapshot = await getDocs(collection(db, "movies"));
      const movieList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMovies(movieList);
    };

    fetchMovies();
  }, []);

  const featured = movies.filter((m) => m.featured);
  const trending = movies.filter((m) => m.trending);

  const newReleases = useMemo(() => {
    return [...movies]
      .sort((a, b) => new Date(b.releaseDate) - new Date(a.releaseDate))
      .slice(0, 10);
  }, [movies]);

  const heroMovie = featured[0] || movies[0];

  return (
    <div className="bg-black text-white min-h-screen">

      <div className="h-[80px]" />

      <CinematicHero movie={heroMovie} />

      <MovieRow title="Trending Now" movies={trending} />
      <MovieRow title="Top Picks" movies={featured} />
      <MovieRow title="New Releases" movies={newReleases} />

    </div>
  );
}