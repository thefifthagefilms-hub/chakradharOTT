"use client";

import { useState } from "react";
import { db } from "@/firebase";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { useRouter } from "next/navigation";

/* 🎥 YOUTUBE CONVERTER */
function convertToEmbed(url) {
  try {
    if (!url) return "";

    if (url.includes("embed")) return url;

    let videoId = "";

    // Handle youtu.be/VIDEO_ID format
    if (url.includes("youtu.be/")) {
      videoId = url.split("youtu.be/")[1]?.split("?")[0]?.split("&")[0];
    }
    // Handle youtube.com/watch?v=VIDEO_ID format
    else if (url.includes("v=")) {
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

export default function CreatePremierePage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    embedLink: "",
    bannerImage: "",
    startTime: "",
    displayTime: "",
    ticketRequired: false,
    ticketPrice: 0,
    ticketLimit: 0,
    adminQuota: 0,
    countAdminQuotaInRevenue: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleCreate = async () => {
    if (!form.title || !form.embedLink || !form.startTime) {
      alert("Fill all required fields");
      return;
    }

    try {
      setLoading(true);

      const embed = convertToEmbed(form.embedLink);

      const docRef = await addDoc(collection(db, "premieres"), {
        title: form.title,
        description: form.description,
        embedLink: embed,
        bannerImage: form.bannerImage || "",
        displayTime: form.displayTime ? Timestamp.fromDate(new Date(form.displayTime)) : null,
        startTime: Timestamp.fromDate(new Date(form.startTime)), // ✅ FIXED
        status: "scheduled",
        ticketRequired: form.ticketRequired,
        ticketPrice: Number(form.ticketPrice || 0),
        ticketLimit: Number(form.ticketLimit || 0),
        adminQuota: Number(form.adminQuota || 0),
        adminQuotaUsed: 0,
        countAdminQuotaInRevenue: form.countAdminQuotaInRevenue,
        ticketsSold: 0,
        createdAt: Timestamp.now(),
      });

      // ✅ FIXED REDIRECT
      router.push(`/admin/premieres/${docRef.id}`);

    } catch (err) {
      console.error("Create error:", err);
      alert("Error creating premiere: " + (err.message || err));
    } finally {
      setLoading(false);
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
          name="title"
          placeholder="Premiere Title"
          onChange={handleChange}
          className="w-full bg-white/10 border border-white/10 p-3 rounded-lg"
        />

        {/* DESCRIPTION */}
        <textarea
          name="description"
          placeholder="Description (optional)"
          onChange={handleChange}
          className="w-full bg-white/10 border border-white/10 p-3 rounded-lg"
        />

        {/* YOUTUBE LINK */}
        <input
          name="embedLink"
          placeholder="Paste ANY YouTube Link"
          onChange={handleChange}
          className="w-full bg-white/10 border border-white/10 p-3 rounded-lg"
        />

        {/* BANNER */}
        <input
          name="bannerImage"
          placeholder="Banner Image URL (optional)"
          onChange={handleChange}
          className="w-full bg-white/10 border border-white/10 p-3 rounded-lg"
        />

        {/* START TIME */}
        <input
          type="datetime-local"
          name="startTime"
          onChange={handleChange}
          className="w-full bg-white/10 border border-white/10 p-3 rounded-lg"
        />

        {/* DISPLAY TIME (EARLY ACCESS) */}
        <div className="space-y-2">
          <label className="text-sm text-gray-300">
            Display Time (when to show on homepage) - Optional
          </label>
          <input
            type="datetime-local"
            name="displayTime"
            onChange={handleChange}
            className="w-full bg-white/10 border border-white/10 p-3 rounded-lg"
          />
          <p className="text-xs text-gray-400">
            If set, premiere appears on homepage from this time. If blank, uses start time.
          </p>
        </div>

        {/* PAID */}
        <div className="flex items-center gap-3">
          <input type="checkbox" name="ticketRequired" onChange={handleChange} />
          <label>Paid Premiere</label>
        </div>

        {form.ticketRequired && (
          <input
            name="ticketPrice"
            type="number"
            placeholder="Ticket Price"
            onChange={handleChange}
            className="w-full bg-white/10 border border-white/10 p-3 rounded-lg"
          />
        )}

        {/* TICKET LIMIT */}
        <div className="space-y-2">
          <label className="text-sm text-gray-300">
            Max Participants (Ticket Limit) - Optional
          </label>
          <input
            name="ticketLimit"
            type="number"
            placeholder="e.g., 100, 500, or 0 for unlimited"
            onChange={handleChange}
            className="w-full bg-white/10 border border-white/10 p-3 rounded-lg"
            min="0"
          />
          <p className="text-xs text-gray-400">
            Set max tickets to sell. Leave as 0 for unlimited.
          </p>
        </div>

        {/* ADMIN QUOTA */}
        <div className="space-y-2">
          <label className="text-sm text-gray-300">
            Admin Quota Tickets (Free tickets you can give) - Optional
          </label>
          <input
            name="adminQuota"
            type="number"
            placeholder="e.g., 50 free tickets"
            onChange={handleChange}
            className="w-full bg-white/10 border border-white/10 p-3 rounded-lg"
            min="0"
          />
          <p className="text-xs text-gray-400">
            How many free tickets you can give to friends/family.
          </p>
        </div>

        {/* COUNT ADMIN QUOTA IN REVENUE */}
        {form.adminQuota > 0 && (
          <div className="flex items-center gap-3 bg-white/5 p-3 rounded border border-white/10">
            <input
              type="checkbox"
              name="countAdminQuotaInRevenue"
              onChange={handleChange}
            />
            <label>Count admin quota tickets in revenue?</label>
          </div>
        )}

        <button
          onClick={handleCreate}
          disabled={loading}
          className="bg-red-600 px-6 py-3 rounded-lg hover:bg-red-700 transition w-full"
        >
          {loading ? "Creating..." : "Create Premiere"}
        </button>

      </div>

    </div>
  );
}