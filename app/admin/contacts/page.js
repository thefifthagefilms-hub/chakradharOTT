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

  /* ✅ NEW STATES */
  const [replyOpen, setReplyOpen] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState("");
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);

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

  /* DELETE */
  const handleDelete = async (id) => {
    const confirmDelete = confirm("Delete this message?");
    if (!confirmDelete) return;

    await deleteDoc(doc(db, "contacts", id));

    setMessages((prev) =>
      prev.filter((msg) => msg.id !== id)
    );
  };

  /* ✅ OPEN REPLY */
  const handleReplyOpen = (email) => {
    setSelectedEmail(email);
    setReplyText("");
    setReplyOpen(true);
  };

  /* ✅ SEND REPLY */
  const handleSendReply = async () => {
    if (!replyText) return alert("Write a reply");

    try {
      setSending(true);

      const res = await fetch("/api/send-reply", {
        method: "POST",
        body: JSON.stringify({
          to: selectedEmail,
          message: replyText,
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      alert("Reply sent successfully");

      setReplyOpen(false);
      setReplyText("");

    } catch (err) {
      console.error(err);
      alert("Failed to send email");
    } finally {
      setSending(false);
    }
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

              <div className="flex gap-2">

                {/* ✅ REPLY BUTTON */}
                <button
                  onClick={() => handleReplyOpen(msg.email)}
                  className="text-xs bg-green-600 px-3 py-1 rounded"
                >
                  Reply
                </button>

                <button
                  onClick={() => handleDelete(msg.id)}
                  className="text-xs bg-red-600 px-3 py-1 rounded"
                >
                  Delete
                </button>

              </div>

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

      {/* ✅ REPLY MODAL */}
      {replyOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">

          <div className="bg-zinc-900 border border-white/10 rounded-2xl p-6 w-full max-w-md space-y-4">

            <h2 className="text-lg font-semibold">
              Reply to {selectedEmail}
            </h2>

            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Type your reply..."
              className="w-full bg-zinc-800 p-3 rounded-lg h-32"
            />

            <div className="flex justify-end gap-3">

              <button
                onClick={() => setReplyOpen(false)}
                className="px-4 py-2 text-sm bg-white/10 rounded"
              >
                Cancel
              </button>

              <button
                onClick={handleSendReply}
                disabled={sending}
                className="px-4 py-2 text-sm bg-green-600 rounded"
              >
                {sending ? "Sending..." : "Send"}
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}