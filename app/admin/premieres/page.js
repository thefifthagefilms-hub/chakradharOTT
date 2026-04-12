"use client";

import { useEffect, useState } from "react";
import { db } from "@/firebase";
import { collection, getDocs, query, orderBy, updateDoc, doc } from "firebase/firestore";
import Link from "next/link";

export default function AdminPremieresPage() {
  const [premieres, setPremieres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("active"); // "active" or "history"
  const [archiveModal, setArchiveModal] = useState(null);
  const [archiving, setArchiving] = useState(false);

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
      } finally {
        setLoading(false);
      }
    };

    fetchPremieres();
  }, []);

  // Filter premieres based on tab
  const activePremieres = premieres.filter((p) => !p.archived);
  const archivedPremieres = premieres.filter((p) => p.archived);

  const displayedPremieres = activeTab === "active" ? activePremieres : archivedPremieres;

  // Archive premiere
  const handleArchive = async (premiereId) => {
    try {
      setArchiving(true);

      await updateDoc(doc(db, "premieres", premiereId), {
        archived: true,
        archivedAt: new Date(),
      });

      setPremieres((prev) =>
        prev.map((p) =>
          p.id === premiereId
            ? { ...p, archived: true, archivedAt: new Date() }
            : p
        )
      );

      alert("✅ Premiere archived successfully!");
      setArchiveModal(null);
    } catch (err) {
      console.error("Error archiving premiere:", err);
      alert("Failed to archive premiere");
    } finally {
      setArchiving(false);
    }
  };

  // Restore premiere from archive
  const handleRestore = async (premiereId) => {
    try {
      await updateDoc(doc(db, "premieres", premiereId), {
        archived: false,
        archivedAt: null,
      });

      setPremieres((prev) =>
        prev.map((p) =>
          p.id === premiereId
            ? { ...p, archived: false, archivedAt: null }
            : p
        )
      );

      alert("✅ Premiere restored successfully!");
    } catch (err) {
      console.error("Error restoring premiere:", err);
      alert("Failed to restore premiere");
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0B0F] text-white px-4 md:px-10 py-8">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
          🎬 Manage Premieres
        </h1>

        <Link
          href="/admin/premieres/create"
          className="bg-red-600 px-5 py-2 rounded-full hover:bg-red-700 transition text-sm shadow-lg hover:scale-105"
        >
          + Create Premiere
        </Link>
      </div>

      {/* TABS */}
      <div className="flex gap-2 mb-8 border-b border-white/10 pb-4">
        <button
          onClick={() => setActiveTab("active")}
          className={`px-4 py-2 font-semibold transition flex items-center gap-2 ${
            activeTab === "active"
              ? "text-red-600 border-b-2 border-red-600"
              : "text-gray-400 hover:text-white"
          }`}
        >
          Active Premieres
          <span className="bg-red-600 text-white text-xs px-2 py-1 rounded-full">
            {activePremieres.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("history")}
          className={`px-4 py-2 font-semibold transition flex items-center gap-2 ${
            activeTab === "history"
              ? "text-red-600 border-b-2 border-red-600"
              : "text-gray-400 hover:text-white"
          }`}
        >
          📚 History
          <span className="bg-gray-600 text-white text-xs px-2 py-1 rounded-full">
            {archivedPremieres.length}
          </span>
        </button>
      </div>

      {/* LOADING */}
      {loading && (
        <p className="text-gray-400">Loading premieres...</p>
      )}

      {/* EMPTY STATE */}
      {!loading && displayedPremieres.length === 0 && (
        <div className="text-center text-gray-400 mt-20">
          <p className="text-lg mb-2">
            {activeTab === "active"
              ? "No active premieres"
              : "No archived premieres"}
          </p>
          <p className="text-sm">
            {activeTab === "active"
              ? "Create your first live event"
              : "Archived premieres will appear here"}
          </p>
        </div>
      )}

      {/* GRID */}
      {!loading && displayedPremieres.length > 0 && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">

          {displayedPremieres.map((premiere) => (
            <div
              key={premiere.id}
              className={`rounded-2xl p-5 transition group hover:scale-[1.02] border ${
                activeTab === "active"
                  ? "bg-white/5 border-white/10 hover:bg-white/10"
                  : "bg-white/5 border-white/10 hover:bg-white/10 opacity-75"
              }`}
            >
              {/* CLICKABLE AREA */}
              <Link
                href={`/admin/premieres/${premiere.id}`}
                className="block mb-3"
              >
                {/* TITLE */}
                <h2 className="text-lg font-semibold mb-2 group-hover:text-white">
                  {premiere.title || "Untitled Premiere"}
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
                <p className="text-xs text-gray-500 mb-2">
                  <span className="text-gray-400">Display:</span>{" "}
                  {premiere.displayTime
                    ? premiere.displayTime.toDate().toLocaleString()
                    : premiere.startTime
                    ? premiere.startTime.toDate().toLocaleString()
                    : "No date set"}
                </p>
                <p className="text-xs text-gray-500 mb-3">
                  <span className="text-gray-400">Live:</span>{" "}
                  {premiere.startTime
                    ? premiere.startTime.toDate().toLocaleString()
                    : "No date set"}
                </p>
              </Link>

              {/* ACTIONS */}
              <div className="flex gap-2 pt-3 border-t border-white/10">
                {activeTab === "active" ? (
                  <button
                    onClick={() => setArchiveModal(premiere.id)}
                    className="flex-1 bg-yellow-600/20 hover:bg-yellow-600/30 border border-yellow-600/30 text-yellow-400 hover:text-yellow-300 text-xs py-2 rounded transition"
                  >
                    🗂️ Archive
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => handleRestore(premiere.id)}
                      className="flex-1 bg-green-600/20 hover:bg-green-600/30 border border-green-600/30 text-green-400 hover:text-green-300 text-xs py-2 rounded transition"
                    >
                      🔄 Restore
                    </button>
                    <p className="flex-1 text-xs text-gray-500 flex items-center">
                      📅 {premiere.archivedAt?.toDate?.().toLocaleDateString?.()}
                    </p>
                  </>
                )}
              </div>
            </div>
          ))}

        </div>
      )}

      {/* ARCHIVE CONFIRMATION MODAL */}
      {archiveModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-[#0B0B0F] border border-white/20 rounded-2xl max-w-md w-full p-6 space-y-4">
            <h2 className="text-xl font-bold">Archive Premiere?</h2>

            <div className="p-3 bg-yellow-600/20 border border-yellow-600/30 rounded">
              <p className="text-sm text-gray-300">
                {premieres.find((p) => p.id === archiveModal)?.title}
              </p>
            </div>

            <p className="text-sm text-gray-400">
              Archiving will move this premiere to history. You can restore it anytime.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => handleArchive(archiveModal)}
                disabled={archiving}
                className="flex-1 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 px-4 py-2 rounded-lg font-semibold transition"
              >
                {archiving ? "Archiving..." : "🗂️ Archive"}
              </button>
              <button
                onClick={() => setArchiveModal(null)}
                className="flex-1 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg font-semibold transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}