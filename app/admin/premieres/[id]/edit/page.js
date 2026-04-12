"use client";

import { useEffect, useState } from "react";
import { db } from "@/firebase";
import { doc, getDoc, updateDoc, Timestamp } from "firebase/firestore";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

/* 🎥 YOUTUBE CONVERTER */
function convertToEmbed(url) {
  try {
    if (!url) return "";
    if (url.includes("embed")) return url;

    let videoId = "";
    if (url.includes("youtu.be/")) {
      videoId = url.split("youtu.be/")[1]?.split("?")[0]?.split("&")[0];
    } else if (url.includes("v=")) {
      videoId = url.split("v=")[1]?.split("&")[0];
    }

    if (!videoId) {
      console.error("Could not extract video ID from:", url);
      return url;
    }

    return `https://www.youtube.com/embed/${videoId}`;
  } catch (err) {
    console.error("YouTube converter error:", err);
    return url;
  }
}

export default function EditPremierePage() {
  const params = useParams();
  const id = params?.id;
  const router = useRouter();

  const [premiere, setPremiere] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    embedLink: "",
    bannerImage: "",
    displayTime: "",
    startTime: "",
  });

  useEffect(() => {
    if (!id) return;

    const fetchPremiere = async () => {
      try {
        const docRef = doc(db, "premieres", id);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
          alert("Premiere not found");
          router.push("/admin/premieres");
          return;
        }

        const data = docSnap.data();
        setPremiere(data);

        // Populate form with existing data
        setForm({
          title: data.title || "",
          description: data.description || "",
          embedLink: data.embedLink || "",
          bannerImage: data.bannerImage || "",
          displayTime: data.displayTime?.toDate?.().toISOString().slice(0, 16) || "",
          startTime: data.startTime?.toDate?.().toISOString().slice(0, 16) || "",
        });
      } catch (err) {
        console.error("Error fetching premiere:", err);
        alert("Failed to load premiere");
      } finally {
        setLoading(false);
      }
    };

    fetchPremiere();
  }, [id, router]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    if (!form.title || !form.embedLink || !form.startTime) {
      alert("Fill all required fields");
      return;
    }

    try {
      setSaving(true);

      const embed = convertToEmbed(form.embedLink);

      const updateData = {
        title: form.title,
        description: form.description,
        embedLink: embed,
        bannerImage: form.bannerImage || "",
        startTime: Timestamp.fromDate(new Date(form.startTime)),
      };

      // Only update displayTime if it's provided
      if (form.displayTime) {
        updateData.displayTime = Timestamp.fromDate(new Date(form.displayTime));
      }

      await updateDoc(doc(db, "premieres", id), updateData);

      alert("✅ Premiere updated successfully!");
      router.push(`/admin/premieres/${id}`);
    } catch (err) {
      console.error("Update error:", err);
      alert("Error updating premiere: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-[#0B0B0F] text-white min-h-screen flex items-center justify-center">
        <p className="text-gray-400">Loading...</p>
      </div>
    );
  }

  if (!premiere) {
    return (
      <div className="bg-[#0B0B0F] text-white min-h-screen flex items-center justify-center">
        <p className="text-red-500">Premiere not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0B0F] text-white px-4 md:px-16 py-10">
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-3xl font-semibold">Edit Premiere</h1>

        <div className="bg-yellow-600/20 border border-yellow-600/30 rounded-lg p-4 mb-6">
          <p className="text-yellow-200 text-sm">
            📝 You can edit this premiere details anytime. Changes will reflect immediately in the live room.
          </p>
        </div>

        {/* TITLE */}
        <div>
          <label className="block text-sm font-semibold mb-2">Title *</label>
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="Premiere Title"
            className="w-full bg-white/10 border border-white/10 p-3 rounded-lg"
          />
        </div>

        {/* DESCRIPTION */}
        <div>
          <label className="block text-sm font-semibold mb-2">Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Description (optional)"
            className="w-full bg-white/10 border border-white/10 p-3 rounded-lg h-24"
          />
        </div>

        {/* YOUTUBE LINK */}
        <div>
          <label className="block text-sm font-semibold mb-2">YouTube Link *</label>
          <input
            name="embedLink"
            value={form.embedLink}
            onChange={handleChange}
            placeholder="Paste ANY YouTube Link"
            className="w-full bg-white/10 border border-white/10 p-3 rounded-lg"
          />
          <p className="text-xs text-gray-400 mt-1">⚠️ Changing this will update the video in the live room</p>
        </div>

        {/* BANNER */}
        <div>
          <label className="block text-sm font-semibold mb-2">Banner Image URL</label>
          <input
            name="bannerImage"
            value={form.bannerImage}
            onChange={handleChange}
            placeholder="Banner Image URL (optional)"
            className="w-full bg-white/10 border border-white/10 p-3 rounded-lg"
          />
        </div>

        {/* TIMES */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-2">Display Time (Early Access)</label>
            <input
              type="datetime-local"
              name="displayTime"
              value={form.displayTime}
              onChange={handleChange}
              className="w-full bg-white/10 border border-white/10 p-3 rounded-lg"
            />
            <p className="text-xs text-gray-400 mt-1">When to show on homepage</p>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Start Time *</label>
            <input
              type="datetime-local"
              name="startTime"
              value={form.startTime}
              onChange={handleChange}
              className="w-full bg-white/10 border border-white/10 p-3 rounded-lg"
            />
            <p className="text-xs text-gray-400 mt-1">When premiere goes live</p>
          </div>
        </div>

        {/* TICKET INFO (READ-ONLY) */}
        <div className="bg-white/5 border border-white/10 rounded-lg p-4">
          <p className="text-sm text-gray-300 mb-3">
            💳 <span className="font-semibold">Ticket Settings (cannot edit)</span>
          </p>
          <div className="grid md:grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-gray-400">Ticket Required:</p>
              <p className="font-semibold">{premiere.ticketRequired ? "Yes" : "No"}</p>
            </div>
            <div>
              <p className="text-gray-400">Price:</p>
              <p className="font-semibold">₹{premiere.ticketPrice || "Free"}</p>
            </div>
            <div>
              <p className="text-gray-400">Tickets Sold:</p>
              <p className="font-semibold">{premiere.ticketsSold || 0}</p>
            </div>
            <div>
              <p className="text-gray-400">Status:</p>
              <p className={`font-semibold ${
                premiere.status === "live"
                  ? "text-red-400"
                  : premiere.status === "ended"
                  ? "text-gray-400"
                  : "text-yellow-400"
              }`}>
                {premiere.status || "scheduled"}
              </p>
            </div>
          </div>
        </div>

        {/* BUTTONS */}
        <div className="flex gap-4 pt-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 px-6 py-3 rounded-lg font-semibold transition"
          >
            {saving ? "Saving..." : "💾 Save Changes"}
          </button>

          <Link
            href={`/admin/premieres/${id}`}
            className="flex-1 bg-white/10 hover:bg-white/20 px-6 py-3 rounded-lg font-semibold text-center transition"
          >
            Cancel
          </Link>
        </div>
      </div>
    </div>
  );
}
