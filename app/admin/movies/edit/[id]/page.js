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

  useEffect(() => {
    const resolveParams = async () => {
      const resolved = await params;
      setMovieId(resolved.id);
    };
    resolveParams();
  }, [params]);

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
    const finalEmbed = convertToEmbed(movie.embedLink);

    await updateDoc(doc(db, "movies", movieId), {
      ...movie,
      embedLink: finalEmbed,
      director: movie.director || "",
    });

    alert("Movie updated successfully");
    router.push("/admin/movies");
  };

  if (!movie) return null;

  return (
    <div>
      <h1 className="text-4xl font-bold mb-10">
        Edit Movie
      </h1>

      <div className="space-y-6 max-w-2xl">

        <input
          type="text"
          value={movie.title || ""}
          onChange={(e) => handleChange("title", e.target.value)}
          className="w-full p-3 bg-zinc-800 rounded"
        />

        <input
          type="text"
          value={movie.tagline || ""}
          onChange={(e) => handleChange("tagline", e.target.value)}
          className="w-full p-3 bg-zinc-800 rounded"
        />

        {/* NEW DIRECTOR FIELD */}
        <input
          type="text"
          placeholder="Director Name"
          value={movie.director || ""}
          onChange={(e) => handleChange("director", e.target.value)}
          className="w-full p-3 bg-zinc-800 rounded"
        />

        <textarea
          rows="4"
          value={movie.description || ""}
          onChange={(e) => handleChange("description", e.target.value)}
          className="w-full p-3 bg-zinc-800 rounded"
        />

        <input
          type="text"
          value={movie.embedLink || ""}
          onChange={(e) => handleChange("embedLink", e.target.value)}
          className="w-full p-3 bg-zinc-800 rounded"
        />

        <input
          type="text"
          value={movie.posterImage || ""}
          onChange={(e) => handleChange("posterImage", e.target.value)}
          className="w-full p-3 bg-zinc-800 rounded"
        />

        <input
          type="text"
          value={movie.bannerImage || ""}
          onChange={(e) => handleChange("bannerImage", e.target.value)}
          className="w-full p-3 bg-zinc-800 rounded"
        />

        <input
          type="text"
          value={movie.genre || ""}
          onChange={(e) => handleChange("genre", e.target.value)}
          className="w-full p-3 bg-zinc-800 rounded"
        />

        <input
          type="date"
          value={movie.releaseDate || ""}
          onChange={(e) => handleChange("releaseDate", e.target.value)}
          className="w-full p-3 bg-zinc-800 rounded"
        />

        <div className="flex gap-6">
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

        <button
          onClick={handleSave}
          className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded transition"
        >
          Save Changes
        </button>

      </div>
    </div>
  );
}