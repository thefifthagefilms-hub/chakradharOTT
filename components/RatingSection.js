"use client";

import { useEffect, useState } from "react";
import { db } from "../firebase";
import {
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";

export default function RatingSection({ movieId }) {
  const [average, setAverage] = useState(0);
  const [count, setCount] = useState(0);
  const [hover, setHover] = useState(0);
  const [userRating, setUserRating] = useState(0);
  const [userRatingDocId, setUserRatingDocId] = useState(null);
  const [boostData, setBoostData] = useState({
    ratingBoost: 0,
    ratingCountBoost: 0,
  });

  /* ---------------- Device ID ---------------- */

  const getDeviceId = () => {
    if (typeof window === "undefined") return null;

    let id = localStorage.getItem("deviceId");
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem("deviceId", id);
    }
    return id;
  };

  /* ---------------- Fetch Boost Once ---------------- */

  useEffect(() => {
    const fetchBoost = async () => {
      const movieDoc = await getDoc(doc(db, "movies", movieId));
      const movieData = movieDoc.data();

      setBoostData({
        ratingBoost: movieData?.ratingBoost || 0,
        ratingCountBoost: movieData?.ratingCountBoost || 0,
      });
    };

    fetchBoost();
  }, [movieId]);

  /* ---------------- Real-time Ratings ---------------- */

  useEffect(() => {
    const deviceId = getDeviceId();
    if (!deviceId) return;

    const ratingsQuery = query(
      collection(db, "ratings"),
      where("movieId", "==", movieId)
    );

    const unsubscribe = onSnapshot(ratingsQuery, (snapshot) => {
      const ratings = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const realCount = ratings.length;

      const realAverage =
        realCount > 0
          ? ratings.reduce((sum, r) => sum + r.rating, 0) / realCount
          : 0;

      const existing = ratings.find(
        (r) => r.deviceId === deviceId
      );

      if (existing) {
        setUserRatingDocId(existing.id);
        setUserRating(existing.rating);
      } else {
        setUserRatingDocId(null);
        setUserRating(0);
      }

      /* -------- Weighted Boost -------- */

      const boostedTotal =
        realAverage * realCount +
        boostData.ratingBoost * boostData.ratingCountBoost;

      const totalCount =
        realCount + boostData.ratingCountBoost;

      const weightedAverage =
        totalCount > 0 ? boostedTotal / totalCount : 0;

      setAverage(Number(weightedAverage.toFixed(1)));
      setCount(totalCount);
    });

    return () => unsubscribe();
  }, [movieId, boostData]);

  /* ---------------- Handle Rating ---------------- */

  const handleRating = async (value) => {
    const deviceId = getDeviceId();
    if (!deviceId) return;

    setUserRating(value);

    if (userRatingDocId) {
      await updateDoc(
        doc(db, "ratings", userRatingDocId),
        {
          rating: value,
          updatedAt: serverTimestamp(),
        }
      );
    } else {
      await addDoc(collection(db, "ratings"), {
        movieId,
        rating: value,
        deviceId,
        createdAt: serverTimestamp(),
      });
    }
  };

  /* ---------------- UI ---------------- */

  const displayValue =
    hover !== 0 ? hover : userRating;

  return (
    <div className="mt-8 md:mt-12 mb-8 md:mb-10">
      <h3 className="text-lg md:text-xl font-semibold mb-5 md:mb-6">
        Rate This Movie
      </h3>

      <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6">

        <div className="flex">
          {[1, 2, 3, 4, 5].map((star) => (
            <span
              key={star}
              onClick={() => handleRating(star)}
              onMouseEnter={() => setHover(star)}
              onMouseLeave={() => setHover(0)}
              className={`text-3xl md:text-4xl cursor-pointer transition duration-200 ${
                star <= displayValue
                  ? "text-yellow-400 drop-shadow-[0_0_8px_rgba(255,215,0,0.7)]"
                  : "text-gray-600"
              }`}
            >
              ★
            </span>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <span className="text-lg text-gray-300 font-medium">
            {average} / 5
          </span>

          <span className="text-sm text-gray-400">
            ({count} ratings)
          </span>
        </div>

      </div>
    </div>
  );
}