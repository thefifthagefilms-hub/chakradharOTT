"use client";

import { useEffect } from "react";
import { db } from "../firebase";
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
} from "firebase/firestore";

export default function ViewTracker({ movieId }) {

  useEffect(() => {

    const trackView = async () => {

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

      if (snapshot.empty) {

        await addDoc(collection(db, "views"), {
          movieId,
          deviceId,
          createdAt: serverTimestamp(),
        });

        await updateDoc(doc(db, "movies", movieId), {
          viewsReal: increment(1),
        });

      }
    };

    trackView();

  }, [movieId]);

  return null;
}