"use client";

import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import Link from "next/link";
import Image from "next/image";

function MovieRow({ title, movies }) {
  return (
    <section className="px-16 py-14">

      <h2 className="text-2xl font-semibold mb-8 tracking-tight">
        {title}
      </h2>

      <div className="flex gap-8 overflow-x-auto pb-6 scroll-smooth">
        {movies.map((movie) => (
          <Link
            key={movie.id}
            href={`/movie/${movie.id}`}
            className="min-w-[240px] group"
          >
            <div className="relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-lg transition duration-500 group-hover:-translate-y-2 group-hover:shadow-2xl">

              <Image
                src={movie.posterImage}
                alt={movie.title}
                width={300}
                height={450}
                className="object-cover rounded-2xl transition duration-700 group-hover:scale-105"
              />

              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition duration-500 flex items-center justify-center rounded-2xl">

                <div className="bg-white/10 backdrop-blur-lg border border-white/20 px-6 py-2 rounded-full text-white text-sm font-medium shadow-xl">
                  ▶ Watch Now
                </div>

              </div>

            </div>

            <h3 className="mt-3 text-sm text-gray-300 group-hover:text-white transition">
              {movie.title}
            </h3>

          </Link>
        ))}
      </div>

      {/* Elegant Divider */}
      <div className="mt-12 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

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

  return (
    <div className="bg-black text-white min-h-screen">

      {/* Navbar Spacer */}
      <div className="h-[80px]" />

      {/* HERO BANNER */}
      <section className="relative h-[55vh] overflow-hidden">

        <Image
          src="/homepage-banner.jpg"
          alt="Chakradhar OTT Banner"
          fill
          priority
          className="object-cover"
        />

        {/* Cinematic overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

      </section>

      {/* MOVIE SECTIONS */}
      <MovieRow title="Trending Now" movies={movies} />
      <MovieRow title="Top Picks" movies={movies} />
      <MovieRow title="New Releases" movies={movies} />

    </div>
  );
}