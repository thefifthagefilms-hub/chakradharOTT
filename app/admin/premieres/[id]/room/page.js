"use client";

import { useEffect, useState } from "react";
import { db } from "@/firebase";
import {
  doc,
  getDoc,
  collection,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { useParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function PremiereRoomPage() {
  const { id } = useParams();
  const { user } = useAuth();

  const [premiere, setPremiere] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ CHAT STATES
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  // FETCH PREMIERE
  useEffect(() => {
    if (!id) return;

    const fetchPremiere = async () => {
      try {
        const snap = await getDoc(doc(db, "premieres", id));
        if (snap.exists()) {
          setPremiere({ id: snap.id, ...snap.data() });
        }
      } catch (error) {
        console.error("Error fetching premiere:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPremiere();
  }, [id]);

  // ✅ REAL-TIME CHAT LISTENER
  useEffect(() => {
    if (!id) return;

    const q = query(
      collection(db, "premieres", id, "messages"),
      orderBy("createdAt", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMessages(msgs);
    });

    return () => unsubscribe();
  }, [id]);

  // ✅ SEND MESSAGE
  const sendMessage = async () => {
    if (!input.trim() || !user) return;

    try {
      await addDoc(collection(db, "premieres", id, "messages"), {
        text: input,
        userId: user.uid,
        name: user.displayName || "User",
        photoURL: user.photoURL || "",
        createdAt: serverTimestamp(),
      });

      setInput("");
    } catch (err) {
      console.error("Send message error:", err);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0B0B0F] text-white flex items-center justify-center text-sm">
        Login required to join the premiere.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0B0F] text-white flex items-center justify-center text-sm">
        Loading Room...
      </div>
    );
  }

  if (!premiere) {
    return (
      <div className="min-h-screen bg-[#0B0B0F] text-white flex items-center justify-center text-sm">
        Premiere not found.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0B0F] text-white">

      {/* HEADER */}
      <div className="px-4 md:px-16 pt-6 pb-4 border-b border-white/10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-lg md:text-2xl font-semibold tracking-tight">
            {premiere.title}
          </h1>

          <span className="bg-red-600 text-xs px-3 py-1 rounded-full animate-pulse">
            LIVE
          </span>
        </div>
      </div>

      {/* MAIN */}
      <div className="px-4 md:px-16 py-6 max-w-7xl mx-auto">

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* VIDEO */}
          <div className="lg:col-span-2">
            <div className="rounded-2xl overflow-hidden border border-white/10 bg-black shadow-lg">
              <div className="aspect-video">

                {premiere.embedLink ? (
                  <iframe
                    src={premiere.embedLink}
                    className="w-full h-full"
                    allowFullScreen
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                    Live Stream Will Start Soon
                  </div>
                )}

              </div>
            </div>
          </div>

          {/* CHAT PANEL */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col h-[400px] lg:h-auto">

            <h2 className="text-sm font-semibold mb-3">
              Live Chat
            </h2>

            {/* MESSAGES */}
            <div className="flex-1 overflow-y-auto space-y-3 text-sm pr-2">

              {messages.map((msg) => (
                <div key={msg.id} className="flex gap-2 items-start">

                  <div className="w-7 h-7 rounded-full bg-gray-700 flex items-center justify-center text-xs">
                    {msg.name?.[0] || "U"}
                  </div>

                  <div>
                    <p className="text-xs text-gray-400">
                      {msg.name}
                    </p>
                    <p className="text-white">
                      {msg.text}
                    </p>
                  </div>

                </div>
              ))}

              {messages.length === 0 && (
                <p className="text-gray-400 text-xs">
                  No messages yet. Be the first to chat.
                </p>
              )}

            </div>

            {/* INPUT */}
            <div className="mt-3 border-t border-white/10 pt-3 flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none"
              />

              <button
                onClick={sendMessage}
                className="bg-red-600 px-4 py-2 rounded-lg text-sm"
              >
                Send
              </button>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}