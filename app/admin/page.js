"use client";

import { useEffect, useState } from "react";
import { db } from "../../firebase";
import { collection, getDocs } from "firebase/firestore";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    movies: 0,
    ratings: 0,
    comments: 0,
    views: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const moviesSnapshot = await getDocs(collection(db, "movies"));
      const ratingsSnapshot = await getDocs(collection(db, "ratings"));
      const commentsSnapshot = await getDocs(collection(db, "comments"));

      let totalViews = 0;
      moviesSnapshot.forEach((doc) => {
        totalViews += doc.data().views || 0;
      });

      setStats({
        movies: moviesSnapshot.size,
        ratings: ratingsSnapshot.size,
        comments: commentsSnapshot.size,
        views: totalViews,
      });

      setLoading(false);
    };

    fetchStats();
  }, []);

  return (
    <div className="space-y-10">

      {/* HEADER */}
      <div>
        <h1 className="text-2xl md:text-4xl font-bold tracking-tight">
          Dashboard Overview
        </h1>
        <p className="text-gray-400 mt-2 text-sm md:text-base">
          Real-time platform analytics
        </p>
      </div>

      {/* STATS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">

        <StatCard title="Total Movies" value={stats.movies} loading={loading} />
        <StatCard title="Total Ratings" value={stats.ratings} loading={loading} />
        <StatCard title="Total Comments" value={stats.comments} loading={loading} />
        <StatCard title="Total Views" value={stats.views} loading={loading} />

      </div>

    </div>
  );
}

/* ---------- STAT CARD COMPONENT ---------- */

function StatCard({ title, value, loading }) {
  return (
    <div className="bg-zinc-900/80 backdrop-blur-lg border border-white/10 p-6 md:p-8 rounded-2xl shadow-lg hover:shadow-2xl transition duration-300">

      <p className="text-gray-400 text-xs md:text-sm mb-3 tracking-wide uppercase">
        {title}
      </p>

      {loading ? (
        <div className="h-8 w-24 bg-zinc-800 rounded animate-pulse" />
      ) : (
        <p className="text-2xl md:text-3xl font-bold tracking-tight">
          {value.toLocaleString()}
        </p>
      )}

    </div>
  );
}