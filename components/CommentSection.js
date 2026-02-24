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
import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";

const allowedEmails = [
  "thefifthagefilms@gmail.com",
  "rahulchakradharperepogu@gmail.com",
];

export default function CommentSection({ movieId }) {
  const [comments, setComments] = useState([]);
  const [name, setName] = useState("");
  const [comment, setComment] = useState("");
  const [replyText, setReplyText] = useState("");
  const [replyTo, setReplyTo] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  /* ---------------- ADMIN CHECK ---------------- */

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && allowedEmails.includes(user.email)) {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
    });

    return () => unsubscribe();
  }, []);

  /* ---------------- FETCH COMMENTS ---------------- */

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

  /* ---------------- POST COMMENT ---------------- */

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !comment) return;

    await addDoc(collection(db, "comments"), {
      movieId,
      name,
      comment,
      timestamp: serverTimestamp(),
      isAdmin: false,
      parentId: null,
    });

    setName("");
    setComment("");
  };

  /* ---------------- POST REPLY ---------------- */

  const handleReplySubmit = async (parentId) => {
    if (!replyText) return;

    await addDoc(collection(db, "comments"), {
      movieId,
      name: "Admin",
      comment: replyText,
      timestamp: serverTimestamp(),
      isAdmin: true,
      parentId,
    });

    setReplyText("");
    setReplyTo(null);
  };

  /* ---------------- SPLIT THREADS ---------------- */

  const topLevelComments = comments.filter(
    (c) => !c.parentId
  );

  const replies = comments.filter(
    (c) => c.parentId
  );

  /* ---------------- RENDER ---------------- */

  return (
    <div className="mt-16">
      <h2 className="text-2xl font-semibold mb-8">
        Comments
      </h2>

      {/* Comment Form */}
      <form
        onSubmit={handleSubmit}
        className="mb-10 bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6"
      >
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

      {/* Comments List */}
      <div className="space-y-8">

        {topLevelComments.map((c) => (
          <div key={c.id}>

            {/* Main Comment */}
            <div
              className={`p-5 rounded-2xl ${
                c.isAdmin
                  ? "bg-yellow-500/10 border border-yellow-400/30"
                  : "bg-white/5 border border-white/10"
              }`}
            >
              {c.isAdmin && (
                <p className="text-xs text-yellow-400 mb-1">
                  Admin
                </p>
              )}

              <p className="font-semibold mb-2">{c.name}</p>
              <p className="text-gray-300">{c.comment}</p>

              {isAdmin && (
                <button
                  onClick={() => setReplyTo(c.id)}
                  className="text-sm text-blue-400 mt-3"
                >
                  Reply
                </button>
              )}
            </div>

            {/* Reply Box */}
            {replyTo === c.id && (
              <div className="mt-4 ml-6">
                <textarea
                  placeholder="Admin reply..."
                  className="w-full p-3 rounded bg-zinc-800 text-white mb-3"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                />

                <button
                  onClick={() => handleReplySubmit(c.id)}
                  className="bg-green-600 px-5 py-2 rounded hover:bg-green-700 transition"
                >
                  Send Reply
                </button>
              </div>
            )}

            {/* Replies */}
            {replies
              .filter((r) => r.parentId === c.id)
              .map((reply) => (
                <div
                  key={reply.id}
                  className={`mt-4 ml-8 p-4 rounded-xl ${
                    reply.isAdmin
                      ? "bg-yellow-500/10 border border-yellow-400/30"
                      : "bg-white/5 border border-white/10"
                  }`}
                >
                  {reply.isAdmin && (
                    <p className="text-xs text-yellow-400 mb-1">
                      Admin
                    </p>
                  )}
                  <p className="font-semibold mb-1">
                    {reply.name}
                  </p>
                  <p className="text-gray-300">
                    {reply.comment}
                  </p>
                </div>
              ))}

          </div>
        ))}

      </div>
    </div>
  );
}