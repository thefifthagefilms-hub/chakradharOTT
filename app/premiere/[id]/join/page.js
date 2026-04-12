"use client";

import { useEffect, useState } from "react";
import { db } from "@/firebase";
import { doc, getDoc } from "firebase/firestore";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function PremiereJoinPage() {
  const params = useParams();
  const id = params?.id;
  const { user } = useAuth();

  const [premiere, setPremieres] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeUntilStart, setTimeUntilStart] = useState(null);
  const [isRemoved, setIsRemoved] = useState(false);
  const [removalReason, setRemovalReason] = useState("");

  useEffect(() => {
    if (!id) return;

    const fetchPremiere = async () => {
      try {
        const docRef = doc(db, "premieres", id);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
          setError("Premiere not found");
          setLoading(false);
          return;
        }

        const data = docSnap.data();
        setPremieres({ id: docSnap.id, ...data });

        // ✅ Check if user is removed
        if (user?.uid) {
          const removedRef = doc(db, "premieres", id, "removed_users", user.uid);
          const removedSnap = await getDoc(removedRef);

          if (removedSnap.exists()) {
            const removedData = removedSnap.data();
            setIsRemoved(true);
            setRemovalReason(removedData.reason || "You have been removed");
          }
        }
      } catch (err) {
        console.error("Error fetching premiere:", err);
        setError("Failed to load premiere");
      } finally {
        setLoading(false);
      }
    };

    fetchPremiere();
  }, [id, user?.uid]);

  // Update countdown timer
  useEffect(() => {
    if (!premiere) return;

    const updateTimer = () => {
      const startTime = premiere.startTime?.toDate?.() || new Date(premiere.startTime);
      const now = new Date();
      const diff = startTime - now;

      if (diff <= 0) {
        setTimeUntilStart(null);
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeUntilStart({ hours, minutes, seconds });
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [premiere]);

  if (loading) {
    return (
      <div className="bg-[#0B0B0F] text-white min-h-screen flex items-center justify-center">
        <p className="text-gray-400">Loading premiere...</p>
      </div>
    );
  }

  if (isRemoved) {
    return (
      <div className="bg-[#0B0B0F] text-white min-h-screen flex flex-col items-center justify-center px-4">
        <div className="bg-red-900/30 border border-red-600/50 rounded-2xl p-8 max-w-md text-center space-y-4">
          <p className="text-3xl">❌</p>
          <h2 className="text-xl font-bold">Access Denied</h2>
          <p className="text-gray-300">
            You have been removed from this premiere session.
          </p>
          {removalReason && (
            <div className="bg-black/50 rounded-lg p-3">
              <p className="text-xs text-gray-400">Reason:</p>
              <p className="text-sm">{removalReason}</p>
            </div>
          )}
          <Link href="/" className="inline-block bg-red-600 hover:bg-red-700 px-6 py-2 rounded-lg font-semibold transition mt-4">
            Back Home
          </Link>
        </div>
      </div>
    );
  }

  if (error || !premiere) {
    return (
      <div className="bg-[#0B0B0F] text-white min-h-screen flex flex-col items-center justify-center">
        <p className="text-red-500 mb-4">{error || "Premiere not found"}</p>
        <Link href="/" className="bg-red-600 px-6 py-2 rounded-lg hover:bg-red-700">
          Back to Home
        </Link>
      </div>
    );
  }

  const startTime = premiere.startTime?.toDate?.() || new Date(premiere.startTime);
  const isLive = new Date() >= startTime;
  const isTicketed = premiere.ticketRequired;

  return (
    <div className="bg-[#0B0B0F] text-white min-h-screen">
      <div className="h-[70px]" />

      {/* BANNER */}
      {premiere.bannerImage && (
        <div className="relative h-[50vh] w-full overflow-hidden">
          <img
            src={premiere.bannerImage}
            alt={premiere.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
        </div>
      )}

      {/* CONTENT */}
      <div className="max-w-4xl mx-auto px-4 md:px-16 py-10">
        <div className="flex justify-between items-start gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-5xl font-bold mb-2">
              {premiere.title}
            </h1>
            <p className="text-gray-300 text-lg">
              {premiere.description}
            </p>
          </div>

          {!isLive && timeUntilStart && (
            <div className="bg-red-600/20 border border-red-600 rounded-lg p-4 text-right whitespace-nowrap">
              <p className="text-xs text-gray-300 mb-2">Starts in</p>
              <p className="text-2xl font-bold">
                {timeUntilStart.hours}h {timeUntilStart.minutes}m {timeUntilStart.seconds}s
              </p>
            </div>
          )}
        </div>

        {/* SCHEDULE */}
        <div className="bg-white/5 border border-white/10 rounded-lg p-4 mb-8">
          <p className="text-gray-300">
            <span className="font-semibold">Start Time:</span>{" "}
            {startTime.toLocaleString()}
          </p>
        </div>

        {/* VIDEO */}
        {isLive ? (
          <div className="aspect-video bg-black rounded-lg overflow-hidden mb-8 border border-white/10">
            {premiere.embedLink ? (
              <iframe
                src={premiere.embedLink}
                title={premiere.title}
                allowFullScreen
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-400">Stream starting soon...</p>
              </div>
            )}
          </div>
        ) : (
          <div className="aspect-video bg-gradient-to-br from-gray-800 to-black rounded-lg overflow-hidden mb-8 border border-white/10 flex items-center justify-center">
            <div className="text-center">
              <p className="text-gray-300 mb-2">Premiere Coming Soon</p>
              <p className="text-5xl">🎬</p>
            </div>
          </div>
        )}

        {/* ACTIONS */}
        <div className="flex flex-col sm:flex-row gap-4">
          {isLive ? (
            <div className="flex-1 bg-red-600 px-6 py-3 rounded-lg text-center font-semibold animate-pulse">
              🔴 LIVE NOW
            </div>
          ) : (
            <div className="flex-1 bg-gray-700/50 px-6 py-3 rounded-lg text-center font-semibold cursor-not-allowed">
              Coming Soon
            </div>
          )}

          {isTicketed && (
            <Link
              href={`/premiere/${id}/tickets`}
              className="flex-1 bg-yellow-600 hover:bg-yellow-700 px-6 py-3 rounded-lg text-center font-semibold transition"
            >
              💳 Get Ticket
            </Link>
          )}

          <Link
            href="/"
            className="flex-1 bg-white/10 hover:bg-white/20 px-6 py-3 rounded-lg text-center font-semibold transition"
          >
            Back Home
          </Link>
        </div>
      </div>
    </div>
  );
}
