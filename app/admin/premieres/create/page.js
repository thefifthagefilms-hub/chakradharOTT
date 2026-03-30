"use client";

import { useState } from "react";
import { db } from "@/firebase";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function CreatePremierePage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [embedLink, setEmbedLink] = useState("");
  const [startTime, setStartTime] = useState("");

  const handleCreate = async () => {
    if (!title || !embedLink || !startTime) {
      alert("Fill all required fields");
      return;
    }

    try {
      const docRef = await addDoc(collection(db, "premieres"), {
        title,
        description,
        embedLink,
        startTime: new Date(startTime).toISOString(),
        status: "scheduled",
        createdAt: Timestamp.now(),
      });

      router.push(`/admin/premieres/${docRef.id}`);
    } catch (err) {
      console.error("Create error:", err);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0B0F] text-white px-4 md:px-16 py-10">

      <div className="max-w-2xl mx-auto space-y-6">

        <h1 className="text-2xl font-semibold">
          Create Premiere
        </h1>

        {/* TITLE */}
        <input
          type="text"
          placeholder="Premiere Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full bg-white/10 border border-white/10 p-3 rounded-lg"
        />

        {/* DESCRIPTION */}
        <textarea
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full bg-white/10 border border-white/10 p-3 rounded-lg"
        />

        {/* YOUTUBE LINK */}
        <input
          type="text"
          placeholder="YouTube Embed Link"
          value={embedLink}
          onChange={(e) => setEmbedLink(e.target.value)}
          className="w-full bg-white/10 border border-white/10 p-3 rounded-lg"
        />

        {/* START TIME */}
        <input
          type="datetime-local"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
          className="w-full bg-white/10 border border-white/10 p-3 rounded-lg"
        />

        <button
          onClick={handleCreate}
          className="bg-red-600 px-6 py-3 rounded-lg hover:bg-red-700 transition"
        >
          Create Premiere
        </button>

      </div>

    </div>
  );
}