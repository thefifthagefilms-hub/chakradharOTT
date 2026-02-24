"use client";

import { useState } from "react";
import { db } from "../../../../firebase";
import { collection, addDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function CreateMovie() {
  const router = useRouter();

  const [form, setForm] = useState({
    title: "",
    tagline: "",
    description: "",
    embedLink: "",
    posterImage: "",
    bannerImage: "",
    genre: "",
    releaseDate: "",
    director: "",   // NEW FIELD
    featured: false,
    trending: false,
  });

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
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const finalEmbed = convertToEmbed(form.embedLink);

    await addDoc(collection(db, "movies"), {
      ...form,
      embedLink: finalEmbed,
      createdAt: Date.now(),
    });

    alert("Movie uploaded successfully");
    router.push("/admin/movies");
  };

  return (
    <div>
      <h1 className="text-4xl font-bold mb-10">
        Upload New Movie
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">

        <input
          type="text"
          placeholder="Title"
          className="w-full p-3 bg-zinc-800 rounded"
          required
          onChange={(e) => handleChange("title", e.target.value)}
        />

        <input
          type="text"
          placeholder="Tagline"
          className="w-full p-3 bg-zinc-800 rounded"
          onChange={(e) => handleChange("tagline", e.target.value)}
        />

        {/* NEW DIRECTOR FIELD */}
        <input
          type="text"
          placeholder="Director Name"
          className="w-full p-3 bg-zinc-800 rounded"
          onChange={(e) => handleChange("director", e.target.value)}
        />

        <textarea
          placeholder="Description"
          className="w-full p-3 bg-zinc-800 rounded"
          rows="4"
          onChange={(e) => handleChange("description", e.target.value)}
        />

        <input
          type="text"
          placeholder="Paste ANY YouTube Link"
          className="w-full p-3 bg-zinc-800 rounded"
          required
          onChange={(e) => handleChange("embedLink", e.target.value)}
        />

        <input
          type="text"
          placeholder="Poster Image URL"
          className="w-full p-3 bg-zinc-800 rounded"
          required
          onChange={(e) => handleChange("posterImage", e.target.value)}
        />

        <input
          type="text"
          placeholder="Banner Image URL"
          className="w-full p-3 bg-zinc-800 rounded"
          required
          onChange={(e) => handleChange("bannerImage", e.target.value)}
        />

        <input
          type="text"
          placeholder="Genre"
          className="w-full p-3 bg-zinc-800 rounded"
          onChange={(e) => handleChange("genre", e.target.value)}
        />

        <input
          type="date"
          className="w-full p-3 bg-zinc-800 rounded"
          onChange={(e) => handleChange("releaseDate", e.target.value)}
        />

        <div className="flex gap-6">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              onChange={(e) =>
                handleChange("featured", e.target.checked)
              }
            />
            Featured
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              onChange={(e) =>
                handleChange("trending", e.target.checked)
              }
            />
            Trending
          </label>
        </div>

        <button
          type="submit"
          className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded transition"
        >
          Upload Movie
        </button>

      </form>
    </div>
  );
}