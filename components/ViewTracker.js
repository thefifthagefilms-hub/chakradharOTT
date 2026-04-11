"use client";

import { useEffect } from "react";
import { db } from "@/firebase";
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  increment,
  serverTimestamp,
  setDoc,
  getDoc,
} from "firebase/firestore";

export default function ViewTracker({ movieId }) {

  useEffect(() => {

    const trackView = async () => {
      try {

        if (!movieId) return;

        let deviceId = localStorage.getItem("deviceId");

        if (!deviceId) {
          deviceId = crypto.randomUUID();
          localStorage.setItem("deviceId", deviceId);
        }

        const q = query(
          collection(db, "views"),
          where("movieId", "==", movieId),
          where("deviceId", "==", deviceId)
        );

        const snapshot = await getDocs(q);

        if (!snapshot.empty) return;

        await addDoc(collection(db, "views"), {
          movieId,
          deviceId,
          createdAt: serverTimestamp(),
        });

        const movieRef = doc(db, "movies", movieId);
        const movieSnap = await getDoc(movieRef);

        if (!movieSnap.exists()) return;

        await updateDoc(movieRef, {
          viewsReal: increment(1),
        });

      } catch (error) {
        console.error("View tracking error:", error);
        // Do NOT throw
      }
    };

    trackView();

  }, [movieId]);

  return null;
}