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
} from "firebase/firestore";

export default function CommentManager({ params }) {
  const [movieId, setMovieId] = useState(null);
  const [movieTitle, setMovieTitle] = useState("");
  const [comments, setComments] = useState([]);
  const [selected, setSelected] = useState([]);

  // Resolve params
  useEffect(() => {
    const resolveParams = async () => {
      const resolved = await params;
      setMovieId(resolved.id);
    };
    resolveParams();
  }, [params]);

  useEffect(() => {
    if (!movieId) return;

    const fetchData = async () => {
      // Fetch movie title
      const movieSnap = await getDoc(doc(db, "movies", movieId));
      if (movieSnap.exists()) {
        setMovieTitle(movieSnap.data().title);
      }

      // Fetch comments
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
    const confirmDelete = confirm(
      "Delete selected comments?"
    );
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

  return (
    <div>
      <h1 className="text-4xl font-bold mb-10">
        Comments — {movieTitle}
      </h1>

      <div className="mb-6 flex gap-4">
        <button
          onClick={selectAll}
          className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded"
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
          className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded"
        >
          Delete Selected
        </button>
      </div>

      <div className="space-y-4">
        {comments.map((comment) => (
          <div
            key={comment.id}
            className="bg-zinc-900 p-4 rounded flex justify-between items-start"
          >
            <div className="flex gap-4 items-start">

              <input
                type="checkbox"
                checked={selected.includes(comment.id)}
                onChange={() =>
                  toggleSelect(comment.id)
                }
              />

              <div>
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
                onClick={() =>
                  editComment(comment.id, comment.comment)
                }
                className="bg-yellow-600 hover:bg-yellow-700 px-3 py-1 rounded text-sm"
              >
                Edit
              </button>

              <button
                onClick={() =>
                  deleteSingle(comment.id)
                }
                className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm"
              >
                Delete
              </button>

            </div>

          </div>
        ))}
      </div>

    </div>
  );
}