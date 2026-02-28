"use client";

import { useEffect, useState } from "react";
import { db } from "../../firebase";
import { collection, getDocs } from "firebase/firestore";
import Link from "next/link";
import Image from "next/image";

export default function MoviesPage() {
  const [movies, setMovies] = useState([]);
  const [search, setSearch] = useState("");

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

  const filtered = movies.filter((movie) =>
    movie.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-black text-white min-h-screen px-6 md:px-16 py-24">

      <div className="mb-12 space-y-6">
        <h1 className="text-3xl md:text-5xl font-bold">
          Explore Movies
        </h1>

        <input
          type="text"
          placeholder="Search movies..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full md:w-96 p-3 bg-zinc-900 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
        />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-8">

        {filtered.map((movie) => (
          <Link key={movie.id} href={`/movie/${movie.id}`} className="group">
            <div className="relative aspect-[2/3] overflow-hidden rounded-2xl shadow-lg transition duration-500 group-hover:-translate-y-2">

              <Image
                src={movie.posterImage}
                alt={movie.title}
                fill
                className="object-cover transition duration-700 group-hover:scale-110"
              />

              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                <span className="bg-white/10 backdrop-blur-lg border border-white/20 px-4 py-2 rounded-full text-sm">
                  View
                </span>
              </div>

            </div>

            <h3 className="mt-4 text-sm md:text-base text-gray-300 group-hover:text-white transition line-clamp-1">
              {movie.title}
            </h3>
          </Link>
        ))}

      </div>

    </div>
  );
}