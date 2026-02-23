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

      // Check if this device already rated
      const existing = ratings.find(
        (r) => r.deviceId === deviceId
      );

      if (existing) {
        setUserRatingDocId(existing.id);
      } else {
        setUserRatingDocId(null);
      }

      // Fetch boost values
      const movieDoc = await getDoc(doc(db, "movies", movieId));
      const movieData = movieDoc.data();

      const ratingBoost = movieData?.ratingBoost || 0;
      const ratingCountBoost = movieData?.ratingCountBoost || 0;

      const finalAverage = realAverage + ratingBoost;
      const finalCount = realCount + ratingCountBoost;

      setAverage(Number(finalAverage.toFixed(1)));
      setCount(finalCount);
    });

    return () => unsubscribe();
  }, [movieId]);

  const handleRating = async (value) => {
    const deviceId = getDeviceId();

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

  return (
    <div className="mt-12 mb-10">
      <h3 className="text-xl font-semibold mb-4">
        Rate This Movie
      </h3>

      <div className="flex items-center gap-4">
        <div className="flex">
          {[1, 2, 3, 4, 5].map((star) => (
            <span
              key={star}
              onClick={() => handleRating(star)}
              onMouseEnter={() => setHover(star)}
              onMouseLeave={() => setHover(0)}
              className={`text-4xl cursor-pointer transition ${
                star <= (hover || average)
                  ? "text-yellow-400 drop-shadow-[0_0_10px_rgba(255,215,0,0.8)]"
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