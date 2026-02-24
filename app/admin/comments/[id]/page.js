"use client";

import { useEffect, useState } from "react";
import { db } from "../../../../firebase";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  updateDoc,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";

export default function CommentManager({ params }) {
  const [movieId, setMovieId] = useState(null);
  const [movieTitle, setMovieTitle] = useState("");
  const [comments, setComments] = useState([]);
  const [selected, setSelected] = useState([]);
  const [replyTo, setReplyTo] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [loading, setLoading] = useState(true);

  /* ---------- Resolve Params ---------- */

  useEffect(() => {
    const resolveParams = async () => {
      const resolved = await params;
      setMovieId(resolved.id);
    };
    resolveParams();
  }, [params]);

  /* ---------- Fetch Data ---------- */

  useEffect(() => {
    if (!movieId) return;

    const fetchData = async () => {
      const movieSnap = await getDoc(doc(db, "movies", movieId));
      if (movieSnap.exists()) {
        setMovieTitle(movieSnap.data().title);
      }

      const q = query(
        collection(db, "comments"),
        where("movieId", "==", movieId)
      );

      const snapshot = await getDocs(q);
      const commentList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setComments(commentList);
      setLoading(false);
    };

    fetchData();
  }, [movieId]);

  /* ---------- Selection ---------- */

  const toggleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id)
        ? prev.filter((c) => c !== id)
        : [...prev, id]
    );
  };

  const selectAll = () => {
    setSelected(comments.map((c) => c.id));
  };

  const clearSelection = () => {
    setSelected([]);
  };

  const deleteSelected = async () => {
    if (!confirm("Delete selected comments?")) return;

    for (let id of selected) {
      await deleteDoc(doc(db, "comments", id));
    }

    setComments((prev) =>
      prev.filter((c) => !selected.includes(c.id))
    );

    setSelected([]);
  };

  const deleteSingle = async (id) => {
    await deleteDoc(doc(db, "comments", id));
    setComments((prev) =>
      prev.filter((c) => c.id !== id)
    );
  };

  const editComment = async (id, oldText) => {
    const newText = prompt("Edit comment:", oldText);
    if (!newText) return;

    await updateDoc(doc(db, "comments", id), {
      comment: newText,
    });

    setComments((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, comment: newText } : c
      )
    );
  };

  /* ---------- Admin Reply ---------- */

  const sendReply = async (parentId) => {
    if (!replyText.trim()) return;

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

    const q = query(
      collection(db, "comments"),
      where("movieId", "==", movieId)
    );

    const snapshot = await getDocs(q);
    const updated = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    setComments(updated);
  };

  /* ---------- Thread Split ---------- */

  const topLevel = comments.filter((c) => !c.parentId);
  const replies = comments.filter((c) => c.parentId);

  return (
    <div className="space-y-10 max-w-5xl mx-auto">

      {/* HEADER */}
      <div>
        <h1 className="text-2xl md:text-4xl font-bold tracking-tight">
          Comments
        </h1>
        <p className="text-gray-400 mt-2 text-sm md:text-base">
          Managing comments for: {movieTitle}
        </p>
      </div>

      {/* BULK CONTROLS */}
      <div className="flex flex-wrap gap-3">
        <button onClick={selectAll} className="bg-blue-600 px-4 py-2 rounded-lg text-sm">
          Select All
        </button>
        <button onClick={clearSelection} className="bg-zinc-700 px-4 py-2 rounded-lg text-sm">
          Clear
        </button>
        <button onClick={deleteSelected} className="bg-red-600 px-4 py-2 rounded-lg text-sm">
          Delete Selected
        </button>
      </div>

      {/* COMMENTS */}
      <div className="space-y-8">

        {loading && <p className="text-gray-400 text-sm">Loading comments...</p>}

        {!loading && topLevel.map((comment) => (
          <div key={comment.id} className="space-y-4">

            {/* MAIN COMMENT */}
            <div className="bg-zinc-900/80 backdrop-blur-lg border border-white/10 p-5 rounded-2xl shadow-lg">

              <div className="flex flex-col md:flex-row md:justify-between gap-4">

                <div className="flex gap-4 items-start flex-1">

                  <input
                    type="checkbox"
                    checked={selected.includes(comment.id)}
                    onChange={() => toggleSelect(comment.id)}
                    className="mt-1"
                  />

                  <div className="break-words">
                    {comment.isAdmin && (
                      <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-full mr-2">
                        Admin
                      </span>
                    )}

                    <p className="font-semibold mt-1">
                      {comment.name}
                    </p>

                    <p className="text-gray-300 mt-2 leading-relaxed">
                      {comment.comment}
                    </p>
                  </div>

                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => editComment(comment.id, comment.comment)}
                    className="bg-yellow-600 px-3 py-1 rounded text-xs md:text-sm"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => deleteSingle(comment.id)}
                    className="bg-red-600 px-3 py-1 rounded text-xs md:text-sm"
                  >
                    Delete
                  </button>

                  <button
                    onClick={() => setReplyTo(comment.id)}
                    className="bg-green-600 px-3 py-1 rounded text-xs md:text-sm"
                  >
                    Reply
                  </button>
                </div>

              </div>

            </div>

            {/* REPLY BOX */}
            {replyTo === comment.id && (
              <div className="ml-4 md:ml-12 bg-zinc-900/60 p-4 rounded-xl space-y-3">
                <textarea
                  className="w-full p-3 bg-zinc-800 rounded-lg"
                  placeholder="Admin reply..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                />
                <button
                  onClick={() => sendReply(comment.id)}
                  className="bg-green-600 px-5 py-2 rounded-lg text-sm"
                >
                  Send Reply
                </button>
              </div>
            )}

            {/* REPLIES */}
            {replies
              .filter((r) => r.parentId === comment.id)
              .map((reply) => (
                <div
                  key={reply.id}
                  className="ml-6 md:ml-16 bg-zinc-800/80 p-4 rounded-xl flex flex-col md:flex-row md:justify-between gap-3"
                >
                  <div className="break-words">
                    {reply.isAdmin && (
                      <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-full mr-2">
                        Admin
                      </span>
                    )}
                    <p className="font-semibold mt-1">
                      {reply.name}
                    </p>
                    <p className="text-gray-300 mt-2">
                      {reply.comment}
                    </p>
                  </div>

                  <button
                    onClick={() => deleteSingle(reply.id)}
                    className="bg-red-600 px-3 py-1 rounded text-xs md:text-sm self-start md:self-center"
                  >
                    Delete
                  </button>
                </div>
              ))}

          </div>
        ))}

      </div>
    </div>
  );
}