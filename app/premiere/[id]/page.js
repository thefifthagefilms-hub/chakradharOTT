"use client";

import { useEffect, useState } from "react";
import { db } from "../../../firebase";
import { doc, getDoc } from "firebase/firestore";
import { useParams } from "next/navigation";
import Link from "next/link";

export default function PremiereDetailPage() {
  const { id } = useParams();

  const [premiere, setPremiere] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState("");

  /* Fetch Premiere */
  useEffect(() => {
    const fetchPremiere = async () => {
      const snap = await getDoc(doc(db, "premieres", id));
      if (snap.exists()) {
        setPremiere({ id: snap.id, ...snap.data() });
      }
      setLoading(false);
    };

    if (id) fetchPremiere();
  }, [id]);

  /* Countdown */
  useEffect(() => {
    if (!premiere?.scheduledAt) return;

    const target = premiere.scheduledAt?.toDate
      ? premiere.scheduledAt.toDate()
      : new Date(premiere.scheduledAt);

    const interval = setInterval(() => {
      const now = new Date();
      const diff = target - now;

      if (diff <= 0) {
        setTimeLeft("Live Now");
        clearInterval(interval);
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
    }, 1000);

    return () => clearInterval(interval);
  }, [premiere]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!premiere) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        Premiere not found.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white px-4 md:px-16 py-12">

      <div className="max-w-4xl mx-auto bg-white/5 border border-white/10 rounded-3xl p-6 md:p-10">

        <h1 className="text-3xl md:text-5xl font-bold mb-6">
          {premiere.title}
        </h1>

        <p className="text-gray-400 mb-6">
          {premiere.description}
        </p>

        <div className="mb-6">
          <p className="text-sm text-gray-500">Scheduled Time</p>
          <p className="text-lg">
            {premiere.scheduledAt?.toDate
              ? premiere.scheduledAt.toDate().toLocaleString()
              : new Date(premiere.scheduledAt).toLocaleString()}
          </p>
        </div>

        <div className="mb-8">
          <p className="text-sm text-gray-500">Countdown</p>
          <p className="text-2xl font-semibold text-red-500">
            {timeLeft}
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-4">

          {/* UPDATED JOIN BUTTON */}
          <Link
            href={`/premiere/${id}/join`}
            className="bg-red-600 px-6 py-3 rounded-full hover:bg-red-700 transition text-center"
          >
            Join Premiere
          </Link>

          {premiere.isPaid && (
            <button
              className="bg-yellow-600 px-6 py-3 rounded-full hover:bg-yellow-700 transition"
            >
              Buy Ticket ₹{premiere.price}
            </button>
          )}

        </div>

      </div>
    </div>
  );
}