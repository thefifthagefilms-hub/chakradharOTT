"use client";

import { useEffect, useState } from "react";
import { db } from "../firebase";
import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";

export default function CommentSection({ movieId }) {
  const [comments, setComments] = useState([]);
  const [name, setName] = useState("");
  const [comment, setComment] = useState("");

  useEffect(() => {
    const q = query(
      collection(db, "comments"),
      where("movieId", "==", movieId),
      orderBy("timestamp", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setComments(data);
    });

    return () => unsubscribe();
  }, [movieId]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !comment) return;

    await addDoc(collection(db, "comments"), {
      movieId,
      name,
      comment,
      timestamp: serverTimestamp(),
    });

    setName("");
    setComment("");
  };

  return (
    <div className="mt-16">
      <h2 className="text-2xl font-semibold mb-6">
        Comments
      </h2>

      <form onSubmit={handleSubmit} className="mb-8">
        <input
          type="text"
          placeholder="Your Name"
          className="w-full mb-4 p-3 rounded bg-zinc-800 text-white"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <textarea
          placeholder="Write a comment..."
          className="w-full mb-4 p-3 rounded bg-zinc-800 text-white"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />

        <button
          type="submit"
          className="bg-red-600 px-6 py-3 rounded hover:bg-red-700 transition"
        >
          Post Comment
        </button>
      </form>

      <div className="space-y-4">
        {comments.map((c) => (
          <div key={c.id} className="bg-zinc-900 p-4 rounded">
            <p className="font-semibold">{c.name}</p>
            <p className="text-gray-400">{c.comment}</p>
          </div>
        ))}
      </div>
    </div>
  );
}