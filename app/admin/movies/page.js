"use client";

import { useEffect, useState } from "react";
import { db } from "../../../firebase";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import Link from "next/link";

export default function MoviesManagement() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMovies = async () => {
      const snapshot = await getDocs(collection(db, "movies"));
      const movieList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMovies(movieList);
      setLoading(false);
    };

    fetchMovies();
  }, []);

  const handleDelete = async (id) => {
    const confirmDelete = confirm(
      "Are you sure you want to delete this movie?"
    );
    if (!confirmDelete) return;

    await deleteDoc(doc(db, "movies", id));

    setMovies((prev) =>
      prev.filter((movie) => movie.id !== id)
    );
  };

  const toggleField = async (id, field, currentValue) => {
    await updateDoc(doc(db, "movies", id), {
      [field]: !currentValue,
    });

    setMovies((prev) =>
      prev.map((movie) =>
        movie.id === id
          ? { ...movie, [field]: !currentValue }
          : movie
      )
    );
  };

  return (
    <div className="space-y-10">

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <h1 className="text-2xl md:text-4xl font-bold tracking-tight">
          Movies Management
        </h1>

        <Link
          href="/admin/movies/create"
          className="bg-green-600 hover:bg-green-700 px-6 py-2 rounded-lg transition text-sm font-medium"
        >
          + Upload New Movie
        </Link>
      </div>

      {/* MOVIE LIST */}
      <div className="space-y-6">

        {loading && (
          <div className="text-gray-400 text-sm">
            Loading movies...
          </div>
        )}

        {!loading && movies.length === 0 && (
          <div className="text-gray-500 text-sm">
            No movies uploaded yet.
          </div>
        )}

        {movies.map((movie) => (
          <div
            key={movie.id}
            className="bg-zinc-900/80 backdrop-blur-md border border-white/10 p-6 rounded-2xl shadow-lg space-y-5"
          >

            {/* TITLE + ACTIONS */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

              <h2 className="text-lg md:text-xl font-semibold">
                {movie.title}
              </h2>

              <div className="flex flex-wrap gap-2">

                <Link
                  href={`/admin/movies/edit/${movie.id}`}
                  className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-xs md:text-sm"
                >
                  Edit
                </Link>

                <Link
                  href={`/admin/analytics/${movie.id}`}
                  className="bg-purple-600 hover:bg-purple-700 px-3 py-1 rounded text-xs md:text-sm"
                >
                  Analytics
                </Link>

                <Link
                  href={`/admin/comments/${movie.id}`}
                  className="bg-yellow-600 hover:bg-yellow-700 px-3 py-1 rounded text-xs md:text-sm"
                >
                  Comments
                </Link>

                <button
                  onClick={() => handleDelete(movie.id)}
                  className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-xs md:text-sm"
                >
                  Delete
                </button>

              </div>

            </div>

            {/* STATUS TOGGLES */}
            <div className="flex flex-wrap gap-4 text-sm">

              <button
                onClick={() =>
                  toggleField(
                    movie.id,
                    "featured",
                    movie.featured
                  )
                }
                className={`px-4 py-1 rounded-full text-xs font-medium ${
                  movie.featured
                    ? "bg-green-700"
                    : "bg-zinc-700"
                }`}
              >
                Featured
              </button>

              <button
                onClick={() =>
                  toggleField(
                    movie.id,
                    "trending",
                    movie.trending
                  )
                }
                className={`px-4 py-1 rounded-full text-xs font-medium ${
                  movie.trending
                    ? "bg-green-700"
                    : "bg-zinc-700"
                }`}
              >
                Trending
              </button>

            </div>

          </div>
        ))}

      </div>

    </div>
  );
}