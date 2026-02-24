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

  /* ---------------- Resolve Params ---------------- */

  useEffect(() => {
    const resolveParams = async () => {
      const resolved = await params;
      setMovieId(resolved.id);
    };
    resolveParams();
  }, [params]);

  /* ---------------- Fetch Data ---------------- */

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
    };

    fetchData();
  }, [movieId]);

  /* ---------------- Selection ---------------- */

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
    const confirmDelete = confirm("Delete selected comments?");
    if (!confirmDelete) return;

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

  /* ---------------- Admin Reply ---------------- */

  const sendReply = async (parentId) => {
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

    // refresh
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

  /* ---------------- Thread Split ---------------- */

  const topLevel = comments.filter((c) => !c.parentId);
  const replies = comments.filter((c) => c.parentId);

  return (
    <div>

      <h1 className="text-4xl font-bold mb-10">
        Comments — {movieTitle}
      </h1>

      {/* Bulk Controls */}
      <div className="mb-6 flex gap-4">
        <button
          onClick={selectAll}
          className="bg-blue-600 px-4 py-2 rounded"
        >
          Select All
        </button>

        <button
          onClick={clearSelection}
          className="bg-zinc-700 px-4 py-2 rounded"
        >
          Clear
        </button>

        <button
          onClick={deleteSelected}
          className="bg-red-600 px-4 py-2 rounded"
        >
          Delete Selected
        </button>
      </div>

      <div className="space-y-8">

        {topLevel.map((comment) => (
          <div key={comment.id}>

            {/* Main Comment */}
            <div className="bg-zinc-900 p-5 rounded-xl flex justify-between">

              <div className="flex gap-4">
                <input
                  type="checkbox"
                  checked={selected.includes(comment.id)}
                  onChange={() => toggleSelect(comment.id)}
                />

                <div>
                  {comment.isAdmin && (
                    <p className="text-yellow-400 text-xs mb-1">
                      Admin
                    </p>
                  )}
                  <p className="font-semibold">
                    {comment.name}
                  </p>
                  <p className="text-gray-300">
                    {comment.comment}
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => editComment(comment.id, comment.comment)}
                  className="bg-yellow-600 px-3 py-1 rounded text-sm"
                >
                  Edit
                </button>

                <button
                  onClick={() => deleteSingle(comment.id)}
                  className="bg-red-600 px-3 py-1 rounded text-sm"
                >
                  Delete
                </button>

                <button
                  onClick={() => setReplyTo(comment.id)}
                  className="bg-green-600 px-3 py-1 rounded text-sm"
                >
                  Reply
                </button>
              </div>
            </div>

            {/* Reply Box */}
            {replyTo === comment.id && (
              <div className="ml-10 mt-4">
                <textarea
                  className="w-full p-3 bg-zinc-800 rounded mb-3"
                  placeholder="Admin reply..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                />
                <button
                  onClick={() => sendReply(comment.id)}
                  className="bg-green-600 px-5 py-2 rounded"
                >
                  Send Reply
                </button>
              </div>
            )}

            {/* Replies */}
            {replies
              .filter((r) => r.parentId === comment.id)
              .map((reply) => (
                <div
                  key={reply.id}
                  className="ml-12 mt-4 bg-zinc-800 p-4 rounded-lg flex justify-between"
                >
                  <div>
                    {reply.isAdmin && (
                      <p className="text-yellow-400 text-xs mb-1">
                        Admin
                      </p>
                    )}
                    <p className="font-semibold">
                      {reply.name}
                    </p>
                    <p className="text-gray-300">
                      {reply.comment}
                    </p>
                  </div>

                  <button
                    onClick={() => deleteSingle(reply.id)}
                    className="bg-red-600 px-3 py-1 rounded text-sm"
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