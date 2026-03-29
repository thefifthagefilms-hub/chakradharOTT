"use client";

import { useEffect, useState } from "react";
import { db } from "@/firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import Link from "next/link";

export default function AdminPremieresPage() {
  const [premieres, setPremieres] = useState([]);

  useEffect(() => {
    const fetchPremieres = async () => {
      try {
        const q = query(
          collection(db, "premieres"),
          orderBy("createdAt", "desc")
        );

        const snapshot = await getDocs(q);

        setPremieres(
          snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
        );
      } catch (err) {
        console.error("Error fetching premieres:", err);
      }
    };

    fetchPremieres();
  }, []);

  return (
    <div className="min-h-screen bg-[#0B0B0F] text-white px-4 md:px-10 py-8">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
          🎬 Manage Premieres
        </h1>

        <Link
          href="/admin/premieres/create"   // ✅ FIXED
          className="bg-red-600 px-5 py-2 rounded-full hover:bg-red-700 transition text-sm"
        >
          + Create Premiere
        </Link>
      </div>

      {premieres.length === 0 && (
        <p className="text-gray-400">No premieres found.</p>
      )}

      {/* GRID */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">

        {premieres.map((premiere) => (
          <Link
            key={premiere.id}
            href={`/admin/premieres/${premiere.id}`}
            className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition group"
          >

            {/* TITLE */}
            <h2 className="text-lg font-semibold mb-2 group-hover:text-white">
              {premiere.title}
            </h2>

            {/* STATUS */}
            <div className="mb-3">
              <span
                className={`text-xs px-2 py-1 rounded-full ${
                  premiere.status === "live"
                    ? "bg-red-600"
                    : premiere.status === "ended"
                    ? "bg-gray-600"
                    : "bg-yellow-600"
                }`}
              >
                {premiere.status || "scheduled"}
              </span>
            </div>

            {/* DESCRIPTION */}
            <p className="text-sm text-gray-400 mb-3 line-clamp-2">
              {premiere.description || "No description"}
            </p>

            {/* TIME */}
            <p className="text-xs text-gray-500">
              {premiere.startTime
                ? new Date(premiere.startTime).toLocaleString()
                : "No date set"}
            </p>

          </Link>
        ))}

      </div>
    </div>
  );
}