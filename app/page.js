"use client";

import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import Link from "next/link";
import Image from "next/image";
import FadeIn from "../components/FadeIn";

function MovieRow({ title, movies }) {
  if (!movies.length) return null;

  return (
    <section className="px-6 md:px-16 py-14">
      <h2 className="text-2xl font-semibold mb-8 tracking-tight">
        {title}
      </h2>

      <div className="flex gap-6 overflow-x-auto pb-6 scroll-smooth">

        {movies.map((movie) => (
          <Link
            key={movie.id}
            href={`/movie/${movie.id}`}
            className="min-w-[220px] group"
          >
            <div className="relative aspect-[2/3] w-[220px] overflow-hidden rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-lg transition duration-500 group-hover:-translate-y-2 group-hover:shadow-2xl">

              <Image
                src={movie.posterImage}
                alt={movie.title}
                fill
                sizes="220px"
                className="object-cover transition duration-700 group-hover:scale-105"
              />

              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition duration-500 flex items-center justify-center">
                <div className="bg-white/10 backdrop-blur-lg border border-white/20 px-6 py-2 rounded-full text-white text-sm font-medium shadow-xl">
                  ▶ Watch Now
                </div>
              </div>
            </div>

            <h3 className="mt-3 text-sm text-gray-300 group-hover:text-white transition line-clamp-1">
              {movie.title}
            </h3>
          </Link>
        ))}

      </div>

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

  const trending = movies.filter((m) => m.trending === true);
  const featured = movies.filter((m) => m.featured === true);
  const newReleases = [...movies]
    .sort((a, b) => new Date(b.releaseDate) - new Date(a.releaseDate))
    .slice(0, 10);

  return (
    <div className="bg-black text-white min-h-screen">

      <div className="h-[80px]" />

      <FadeIn>
        <section className="relative h-[55vh] overflow-hidden">
          <Image
            src="/homepage-banner.jpg"
            alt="Chakradhar OTT Banner"
            fill
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
        </section>
      </FadeIn>

      <FadeIn delay={0.1}>
        <MovieRow title="Trending Now" movies={trending} />
      </FadeIn>

      <FadeIn delay={0.2}>
        <MovieRow title="Top Picks" movies={featured} />
      </FadeIn>

      <FadeIn delay={0.3}>
        <MovieRow title="New Releases" movies={newReleases} />
      </FadeIn>

    </div>
  );
}