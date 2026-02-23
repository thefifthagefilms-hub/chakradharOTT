"use client";

import { useEffect, useState } from "react";
import { db } from "../../firebase";
import {
  collection,
  getDocs,
} from "firebase/firestore";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    movies: 0,
    ratings: 0,
    comments: 0,
    views: 0,
  });

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
    };

    fetchStats();
  }, []);

  return (
    <div>
      <h1 className="text-4xl font-bold mb-12">
        Dashboard Overview
      </h1>

      <div className="grid md:grid-cols-4 gap-8">

        <div className="bg-zinc-900 p-8 rounded-xl shadow-lg">
          <h2 className="text-gray-400 text-sm mb-2">
            Total Movies
          </h2>
          <p className="text-3xl font-bold">
            {stats.movies}
          </p>
        </div>

        <div className="bg-zinc-900 p-8 rounded-xl shadow-lg">
          <h2 className="text-gray-400 text-sm mb-2">
            Total Ratings
          </h2>
          <p className="text-3xl font-bold">
            {stats.ratings}
          </p>
        </div>

        <div className="bg-zinc-900 p-8 rounded-xl shadow-lg">
          <h2 className="text-gray-400 text-sm mb-2">
            Total Comments
          </h2>
          <p className="text-3xl font-bold">
            {stats.comments}
          </p>
        </div>

        <div className="bg-zinc-900 p-8 rounded-xl shadow-lg">
          <h2 className="text-gray-400 text-sm mb-2">
            Total Views
          </h2>
          <p className="text-3xl font-bold">
            {stats.views}
          </p>
        </div>

      </div>
    </div>
  );
}