"use client";

import { useEffect, useState } from "react";
import { db } from "@/firebase";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  orderBy,
  query,
} from "firebase/firestore";

export default function AdminContactsPage() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  /* FETCH MESSAGES */
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const q = query(
          collection(db, "contacts"),
          orderBy("createdAt", "desc")
        );

        const snap = await getDocs(q);

        setMessages(
          snap.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
        );
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, []);

  /* DELETE MESSAGE */
  const handleDelete = async (id) => {
    const confirmDelete = confirm("Delete this message?");
    if (!confirmDelete) return;

    await deleteDoc(doc(db, "contacts", id));

    setMessages((prev) =>
      prev.filter((msg) => msg.id !== id)
    );
  };

  return (
    <div className="min-h-screen bg-[#0B0B0F] text-white px-4 md:px-10 py-8">

      <h1 className="text-2xl md:text-3xl font-semibold mb-8">
        📥 Contact Messages
      </h1>

      {loading && (
        <p className="text-gray-400">Loading messages...</p>
      )}

      {!loading && messages.length === 0 && (
        <p className="text-gray-400">No messages yet.</p>
      )}

      <div className="space-y-6">

        {messages.map((msg) => (
          <div
            key={msg.id}
            className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-3"
          >

            <div className="flex justify-between items-center">

              <div>
                <p className="font-semibold">{msg.name}</p>
                <p className="text-xs text-gray-400">
                  {msg.email}
                </p>
              </div>

              <button
                onClick={() => handleDelete(msg.id)}
                className="text-xs bg-red-600 px-3 py-1 rounded"
              >
                Delete
              </button>

            </div>

            <p className="text-sm text-gray-300">
              {msg.message}
            </p>

            <p className="text-xs text-gray-500">
              {msg.createdAt?.toDate
                ? msg.createdAt.toDate().toLocaleString()
                : ""}
            </p>

          </div>
        ))}

      </div>

    </div>
  );
}