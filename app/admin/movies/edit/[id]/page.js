"use client";

import { useEffect, useState } from "react";
import { db } from "../../../../../firebase";
import {
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function EditMovie({ params }) {
  const router = useRouter();
  const [movie, setMovie] = useState(null);
  const [movieId, setMovieId] = useState(null);
  const [loading, setLoading] = useState(false);

  /* ---------- Resolve Params ---------- */
  useEffect(() => {
    const resolveParams = async () => {
      const resolved = await params;
      setMovieId(resolved.id);
    };
    resolveParams();
  }, [params]);

  /* ---------- Fetch Movie ---------- */
  useEffect(() => {
    if (!movieId) return;

    const fetchMovie = async () => {
      const movieRef = doc(db, "movies", movieId);
      const snapshot = await getDoc(movieRef);

      if (snapshot.exists()) {
        setMovie(snapshot.data());
      }
    };

    fetchMovie();
  }, [movieId]);

  const convertToEmbed = (url) => {
    if (!url) return "";

    try {
      if (url.includes("/embed/")) return url;

      if (url.includes("watch?v=")) {
        const videoId = url.split("watch?v=")[1].split("&")[0];
        return `https://www.youtube.com/embed/${videoId}`;
      }

      if (url.includes("youtu.be/")) {
        const videoId = url.split("youtu.be/")[1].split("?")[0];
        return `https://www.youtube.com/embed/${videoId}`;
      }

      if (url.includes("/shorts/")) {
        const videoId = url.split("/shorts/")[1].split("?")[0];
        return `https://www.youtube.com/embed/${videoId}`;
      }

      return url;
    } catch {
      return url;
    }
  };

  const handleChange = (field, value) => {
    setMovie((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    setLoading(true);

    const finalEmbed = convertToEmbed(movie.embedLink);

    await updateDoc(doc(db, "movies", movieId), {
      ...movie,
      embedLink: finalEmbed,
      director: movie.director || "",
    });

    setLoading(false);
    alert("Movie updated successfully");
    router.push("/admin/movies");
  };

  if (!movie) {
    return (
      <div className="text-gray-400 text-sm">
        Loading movie data...
      </div>
    );
  }

  return (
    <div className="space-y-10 max-w-4xl mx-auto">

      {/* HEADER */}
      <div>
        <h1 className="text-2xl md:text-4xl font-bold tracking-tight">
          Edit Movie
        </h1>
        <p className="text-gray-400 mt-2 text-sm md:text-base">
          Update movie details
        </p>
      </div>

      {/* FORM CONTAINER */}
      <div className="bg-zinc-900/80 backdrop-blur-lg border border-white/10 rounded-2xl p-6 md:p-10 shadow-xl space-y-6">

        {/* BASIC INFO */}
        <div className="space-y-5">

          <input
            type="text"
            value={movie.title || ""}
            onChange={(e) => handleChange("title", e.target.value)}
            className="w-full p-3 bg-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
            placeholder="Title"
          />

          <input
            type="text"
            value={movie.tagline || ""}
            onChange={(e) => handleChange("tagline", e.target.value)}
            className="w-full p-3 bg-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
            placeholder="Tagline"
          />

          <input
            type="text"
            value={movie.director || ""}
            onChange={(e) => handleChange("director", e.target.value)}
            className="w-full p-3 bg-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
            placeholder="Director Name"
          />

          <textarea
            rows="4"
            value={movie.description || ""}
            onChange={(e) => handleChange("description", e.target.value)}
            className="w-full p-3 bg-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
            placeholder="Description"
          />

        </div>

        {/* MEDIA LINKS */}
        <div className="space-y-5">

          <input
            type="text"
            value={movie.embedLink || ""}
            onChange={(e) => handleChange("embedLink", e.target.value)}
            className="w-full p-3 bg-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
            placeholder="YouTube Link"
          />

          <input
            type="text"
            value={movie.posterImage || ""}
            onChange={(e) => handleChange("posterImage", e.target.value)}
            className="w-full p-3 bg-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
            placeholder="Poster Image URL"
          />

          <input
            type="text"
            value={movie.bannerImage || ""}
            onChange={(e) => handleChange("bannerImage", e.target.value)}
            className="w-full p-3 bg-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
            placeholder="Banner Image URL"
          />

        </div>

        {/* META GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

          <input
            type="text"
            value={movie.genre || ""}
            onChange={(e) => handleChange("genre", e.target.value)}
            className="w-full p-3 bg-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
            placeholder="Genre"
          />

          <input
            type="date"
            value={movie.releaseDate || ""}
            onChange={(e) => handleChange("releaseDate", e.target.value)}
            className="w-full p-3 bg-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
          />

        </div>

        {/* FLAGS */}
        <div className="flex flex-wrap gap-6 text-sm">

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={movie.featured || false}
              onChange={(e) =>
                handleChange("featured", e.target.checked)
              }
            />
            Featured
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={movie.trending || false}
              onChange={(e) =>
                handleChange("trending", e.target.checked)
              }
            />
            Trending
          </label>

        </div>

        {/* SAVE BUTTON */}
        <button
          onClick={handleSave}
          disabled={loading}
          className="w-full md:w-auto bg-green-600 hover:bg-green-700 px-8 py-3 rounded-lg transition disabled:opacity-60"
        >
          {loading ? "Saving..." : "Save Changes"}
        </button>

      </div>

    </div>
  );
}