"use client";

import { useEffect, useState } from "react";
import { db, auth } from "../../firebase";
import {
  collection,
  getDocs,
  query,
  orderBy,
  limit,
} from "firebase/firestore";
import { motion } from "framer-motion";
import { onAuthStateChanged } from "firebase/auth";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    movies: 0,
    ratings: 0,
    comments: 0,
    views: 0,
  });

  const [recentComments, setRecentComments] = useState([]);
  const [latestMovie, setLatestMovie] = useState(null);
  const [adminEmail, setAdminEmail] = useState("");
  const [sessionTimeLeft, setSessionTimeLeft] = useState(1800);
  const [loading, setLoading] = useState(true);

  /* ---------------- AUTH SUBSCRIPTION ---------------- */

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user?.email) {
        setAdminEmail(user.email);
      }
    });

    return () => unsubscribe();
  }, []);

  /* ---------------- FETCH DASHBOARD DATA ---------------- */

  useEffect(() => {
    const fetchData = async () => {
      try {
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

        // Latest movie
        const latestMovieQuery = query(
          collection(db, "movies"),
          orderBy("createdAt", "desc"),
          limit(1)
        );

        const latestMovieSnap = await getDocs(latestMovieQuery);

        if (!latestMovieSnap.empty) {
          setLatestMovie(latestMovieSnap.docs[0].data());
        }

        // Recent comments
        const recentCommentsQuery = query(
          collection(db, "comments"),
          orderBy("timestamp", "desc"),
          limit(5)
        );

        const recentSnap = await getDocs(recentCommentsQuery);

        const recentList = recentSnap.docs.map((doc) => doc.data());
        setRecentComments(recentList);

      } catch (error) {
        console.error("Dashboard fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  /* ---------------- SESSION COUNTDOWN ---------------- */

  useEffect(() => {
    const timer = setInterval(() => {
      setSessionTimeLeft((prev) => {
        if (prev <= 1) return 0;
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="space-y-12">

      {/* HEADER */}
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl md:text-5xl font-bold">
          Admin Dashboard
        </h1>
        <p className="text-gray-400 mt-3">
          Platform intelligence & live activity
        </p>
      </motion.div>

      {/* SESSION PANEL */}
      <div className="bg-gradient-to-r from-green-600/10 to-emerald-600/10 border border-green-500/20 p-5 rounded-xl flex flex-col md:flex-row md:items-center md:justify-between gap-4">

        <div>
          <p className="text-sm text-gray-400">Logged in as</p>
          <p className="font-semibold">{adminEmail || "Admin"}</p>
        </div>

        <div>
          <p className="text-sm text-gray-400">Session expires in</p>
          <p className="font-semibold text-green-400">
            {formatTime(sessionTimeLeft)}
          </p>
        </div>

        <div className="text-green-400 font-semibold text-sm">
          ● Secure Session Active
        </div>

      </div>

      {/* STATS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard title="Total Movies" value={stats.movies} loading={loading} />
        <StatCard title="Total Ratings" value={stats.ratings} loading={loading} />
        <StatCard title="Total Comments" value={stats.comments} loading={loading} />
        <StatCard title="Total Views" value={stats.views} loading={loading} />
      </div>

      {/* ACTIVITY SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* Latest Movie */}
        <div className="bg-zinc-900/80 border border-white/10 p-6 rounded-2xl">
          <h2 className="text-lg font-semibold mb-4">
            Latest Uploaded Movie
          </h2>
          {latestMovie ? (
            <div>
              <p className="font-semibold">{latestMovie.title}</p>
              <p className="text-gray-400 text-sm mt-1">
                {latestMovie.genre || "No genre"}
              </p>
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No data</p>
          )}
        </div>

        {/* Recent Comments */}
        <div className="bg-zinc-900/80 border border-white/10 p-6 rounded-2xl">
          <h2 className="text-lg font-semibold mb-4">
            Recent Comments
          </h2>
          {recentComments.length === 0 ? (
            <p className="text-gray-500 text-sm">No recent comments</p>
          ) : (
            <div className="space-y-4">
              {recentComments.map((c, index) => (
                <div key={index} className="border-b border-white/5 pb-3">
                  <p className="text-sm font-semibold">{c.name}</p>
                  <p className="text-xs text-gray-400 line-clamp-1">
                    {c.comment}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}

/* ---------- STAT CARD ---------- */

function StatCard({ title, value, loading }) {
  return (
    <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 border border-white/10 p-6 rounded-2xl shadow-lg hover:shadow-2xl transition duration-300">
      <p className="text-gray-400 text-xs uppercase mb-3">
        {title}
      </p>

      {loading ? (
        <div className="h-8 w-24 bg-zinc-700 rounded animate-pulse" />
      ) : (
        <p className="text-3xl font-bold">
          {value.toLocaleString()}
        </p>
      )}
    </div>
  );
}