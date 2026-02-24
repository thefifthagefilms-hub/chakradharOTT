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

  const getDeviceId = () => {
    let id = localStorage.getItem("deviceId");
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem("deviceId", id);
    }
    return id;
  };

  useEffect(() => {
    const deviceId = getDeviceId();

    const ratingsQuery = query(
      collection(db, "ratings"),
      where("movieId", "==", movieId)
    );

    const unsubscribe = onSnapshot(ratingsQuery, async (snapshot) => {
      const ratings = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const realCount = ratings.length;

      const realAverage =
        realCount > 0
          ? ratings.reduce((a, b) => a + b.rating, 0) / realCount
          : 0;

      // Detect existing user rating
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

      // Fetch boost values safely
      const movieDoc = await getDoc(doc(db, "movies", movieId));
      const movieData = movieDoc.data();

      const ratingBoost = movieData?.ratingBoost || 0;
      const ratingCountBoost = movieData?.ratingCountBoost || 0;

      // Weighted average calculation
      const boostedTotal =
        realAverage * realCount +
        ratingBoost * ratingCountBoost;

      const totalCount =
        realCount + ratingCountBoost;

      let weightedAverage =
        totalCount > 0 ? boostedTotal / totalCount : 0;

      // Clamp between 0 and 5
      weightedAverage = Math.min(
        5,
        Math.max(0, weightedAverage)
      );

      setAverage(Number(weightedAverage.toFixed(1)));
      setCount(totalCount);
    });

    return () => unsubscribe();
  }, [movieId]);

  const handleRating = async (value) => {
    const deviceId = getDeviceId();

    // Instant UI update (prevents mismatch)
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

  // Stars glow ONLY based on hover OR user rating
  const displayValue =
    hover !== 0 ? hover : userRating;

  return (
    <div className="mt-12 mb-10">
      <h3 className="text-xl font-semibold mb-6">
        Rate This Movie
      </h3>

      <div className="flex items-center gap-6">
        <div className="flex">
          {[1, 2, 3, 4, 5].map((star) => (
            <span
              key={star}
              onClick={() => handleRating(star)}
              onMouseEnter={() => setHover(star)}
              onMouseLeave={() => setHover(0)}
              className={`text-4xl cursor-pointer transition ${
                star <= displayValue
                  ? "text-yellow-400 drop-shadow-[0_0_8px_rgba(255,215,0,0.7)]"
                  : "text-gray-600"
              }`}
            >
              ★
            </span>
          ))}
        </div>

        <span className="text-lg text-gray-300 font-medium">
          {average} / 5
        </span>

        <span className="text-sm text-gray-400">
          ({count} ratings)
        </span>
      </div>
    </div>
  );
}