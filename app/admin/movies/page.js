"use client";

import { useEffect, useState } from "react";
import { db } from "../../firebase";
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
    <div>
      <h1 className="text-4xl font-bold mb-10">
        Movies Management
      </h1>

      <Link
        href="/admin/movies/create"
        className="bg-green-600 hover:bg-green-700 px-6 py-2 rounded transition mb-8 inline-block"
      >
        + Upload New Movie
      </Link>

      <div className="space-y-6 mt-8">

        {movies.map((movie) => (
          <div
            key={movie.id}
            className="bg-zinc-900 p-6 rounded-xl shadow-lg"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                {movie.title}
              </h2>

              <div className="flex gap-3">

                <Link
                  href={`/admin/movies/edit/${movie.id}`}
                  className="bg-blue-600 hover:bg-blue-700 px-4 py-1 rounded text-sm"
                >
                  Edit
                </Link>

                <Link
                  href={`/admin/analytics/${movie.id}`}
                  className="bg-purple-600 hover:bg-purple-700 px-4 py-1 rounded text-sm"
                >
                  Analytics
                </Link>

                <Link
                  href={`/admin/comments/${movie.id}`}
                  className="bg-yellow-600 hover:bg-yellow-700 px-4 py-1 rounded text-sm"
                >
                  Comments
                </Link>

                <button
                  onClick={() => handleDelete(movie.id)}
                  className="bg-red-600 hover:bg-red-700 px-4 py-1 rounded text-sm"
                >
                  Delete
                </button>

              </div>
            </div>

            <div className="flex gap-6 text-sm">

              <button
                onClick={() =>
                  toggleField(
                    movie.id,
                    "featured",
                    movie.featured
                  )
                }
                className={`px-3 py-1 rounded ${
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
                className={`px-3 py-1 rounded ${
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