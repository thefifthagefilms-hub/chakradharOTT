"use client";

import { useState } from "react";
import { db } from "../../../../firebase";
import { collection, addDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function CreateMovie() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    title: "",
    tagline: "",
    description: "",
    embedLink: "",
    posterImage: "",
    bannerImage: "",
    genre: "",
    releaseDate: "",
    director: "",
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
    setLoading(true);

    const finalEmbed = convertToEmbed(form.embedLink);

    await addDoc(collection(db, "movies"), {
      ...form,
      embedLink: finalEmbed,
      createdAt: Date.now(),
    });

    setLoading(false);
    alert("Movie uploaded successfully");
    router.push("/admin/movies");
  };

  return (
    <div className="space-y-10 max-w-4xl mx-auto">

      {/* HEADER */}
      <div>
        <h1 className="text-2xl md:text-4xl font-bold tracking-tight">
          Upload New Movie
        </h1>
        <p className="text-gray-400 mt-2 text-sm md:text-base">
          Add new movie details to your platform
        </p>
      </div>

      {/* FORM */}
      <form
        onSubmit={handleSubmit}
        className="bg-zinc-900/80 backdrop-blur-lg border border-white/10 rounded-2xl p-6 md:p-10 shadow-xl space-y-6"
      >

        {/* BASIC INFO */}
        <div className="space-y-5">

          <input
            type="text"
            placeholder="Title"
            required
            className="w-full p-3 bg-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
            onChange={(e) => handleChange("title", e.target.value)}
          />

          <input
            type="text"
            placeholder="Tagline"
            className="w-full p-3 bg-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
            onChange={(e) => handleChange("tagline", e.target.value)}
          />

          <input
            type="text"
            placeholder="Director Name"
            className="w-full p-3 bg-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
            onChange={(e) => handleChange("director", e.target.value)}
          />

          <textarea
            placeholder="Description"
            rows="4"
            className="w-full p-3 bg-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
            onChange={(e) => handleChange("description", e.target.value)}
          />

        </div>

        {/* MEDIA LINKS */}
        <div className="space-y-5">

          <input
            type="text"
            placeholder="Paste ANY YouTube Link"
            required
            className="w-full p-3 bg-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
            onChange={(e) => handleChange("embedLink", e.target.value)}
          />

          <input
            type="text"
            placeholder="Poster Image URL"
            required
            className="w-full p-3 bg-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
            onChange={(e) => handleChange("posterImage", e.target.value)}
          />

          <input
            type="text"
            placeholder="Banner Image URL"
            required
            className="w-full p-3 bg-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
            onChange={(e) => handleChange("bannerImage", e.target.value)}
          />

        </div>

        {/* META INFO */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

          <input
            type="text"
            placeholder="Genre"
            className="w-full p-3 bg-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
            onChange={(e) => handleChange("genre", e.target.value)}
          />

          <input
            type="date"
            className="w-full p-3 bg-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
            onChange={(e) => handleChange("releaseDate", e.target.value)}
          />

        </div>

        {/* FLAGS */}
        <div className="flex flex-wrap gap-6 text-sm">

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

        {/* SUBMIT */}
        <button
          type="submit"
          disabled={loading}
          className="w-full md:w-auto bg-green-600 hover:bg-green-700 px-8 py-3 rounded-lg transition disabled:opacity-60"
        >
          {loading ? "Uploading..." : "Upload Movie"}
        </button>

      </form>

    </div>
  );
}