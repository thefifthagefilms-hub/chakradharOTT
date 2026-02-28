"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { db } from "../firebase";
import { useAuth } from "@/context/AuthContext";
import AuthModal from "@/components/AuthModal";

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
  const { user } = useAuth();

  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");
  const [replyText, setReplyText] = useState("");
  const [replyTo, setReplyTo] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

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

    if (!user) {
      setShowAuthModal(true);
      return;
    }

    if (!text.trim()) return;

    await addDoc(collection(db, "comments"), {
      movieId,
      userId: user.uid,
      name: user.displayName || "User",
      photoURL: user.photoURL || null,
      comment: text,
      timestamp: serverTimestamp(),
      parentId: null,
    });

    setText("");
  };

  /* ---------------- POST REPLY ---------------- */

  const handleReplySubmit = async (parentId) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    if (!replyText.trim()) return;

    await addDoc(collection(db, "comments"), {
      movieId,
      userId: user.uid,
      name: user.displayName || "User",
      photoURL: user.photoURL || null,
      comment: replyText,
      timestamp: serverTimestamp(),
      parentId,
    });

    setReplyText("");
    setReplyTo(null);
  };

  /* ---------------- SPLIT THREADS ---------------- */

  const topLevel = comments.filter((c) => !c.parentId);
  const replies = comments.filter((c) => c.parentId);

  /* ---------------- AVATAR ---------------- */

  const getAvatar = (photoURL, name) => {
    if (photoURL) return photoURL;

    return `https://ui-avatars.com/api/?name=${encodeURIComponent(
      name || "User"
    )}&background=111&color=fff`;
  };

  /* ---------------- RENDER ---------------- */

  return (
    <>
      <div className="mt-16">
        <h2 className="text-2xl font-semibold mb-8">
          Comments
        </h2>

        {/* Comment Form */}
        <form onSubmit={handleSubmit} className="mb-10 flex gap-4">

          {user && (
            <Image
              src={getAvatar(user.photoURL, user.displayName)}
              alt="avatar"
              width={40}
              height={40}
              className="rounded-full object-cover"
            />
          )}

          <div className="flex-1">
            <textarea
              placeholder={
                user
                  ? "Write a comment..."
                  : "Login to comment..."
              }
              className="w-full p-3 rounded-xl bg-zinc-800 text-white resize-none"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />

            <button
              type="submit"
              className="mt-3 bg-red-600 px-6 py-2 rounded-full hover:bg-red-700 transition"
            >
              Post
            </button>
          </div>
        </form>

        {/* Comments */}
        <div className="space-y-8">

          {topLevel.map((c) => (
            <div key={c.id}>

              <div className="flex gap-4">

                <Image
                  src={getAvatar(c.photoURL, c.name)}
                  alt="avatar"
                  width={40}
                  height={40}
                  className="rounded-full object-cover"
                />

                <div className="flex-1">

                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                    <p className="font-semibold text-sm mb-1">
                      {c.name}
                    </p>
                    <p className="text-gray-300 text-sm">
                      {c.comment}
                    </p>
                  </div>

                  <button
                    onClick={() => setReplyTo(c.id)}
                    className="text-xs text-gray-400 mt-2 hover:text-white"
                  >
                    Reply
                  </button>

                  {replyTo === c.id && (
                    <div className="mt-4 flex gap-3">
                      <textarea
                        placeholder="Write a reply..."
                        className="flex-1 p-3 rounded-xl bg-zinc-800 text-white resize-none"
                        value={replyText}
                        onChange={(e) =>
                          setReplyText(e.target.value)
                        }
                      />

                      <button
                        onClick={() =>
                          handleReplySubmit(c.id)
                        }
                        className="bg-green-600 px-5 py-2 rounded-full hover:bg-green-700 transition"
                      >
                        Send
                      </button>
                    </div>
                  )}

                  {replies
                    .filter((r) => r.parentId === c.id)
                    .map((r) => (
                      <div
                        key={r.id}
                        className="flex gap-3 mt-4 ml-6"
                      >
                        <Image
                          src={getAvatar(r.photoURL, r.name)}
                          alt="avatar"
                          width={32}
                          height={32}
                          className="rounded-full object-cover"
                        />

                        <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                          <p className="font-semibold text-xs mb-1">
                            {r.name}
                          </p>
                          <p className="text-gray-300 text-xs">
                            {r.comment}
                          </p>
                        </div>
                      </div>
                    ))}

                </div>

              </div>

            </div>
          ))}

        </div>
      </div>

      <AuthModal
        open={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </>
  );
}