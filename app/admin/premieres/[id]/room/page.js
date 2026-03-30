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
  updateDoc,
} from "firebase/firestore";
import { useParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function PremiereRoomPage() {
  const { id } = useParams();
  const { user } = useAuth();

  const [premiere, setPremiere] = useState(null);
  const [loading, setLoading] = useState(true);

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [lastSent, setLastSent] = useState(0);
  const [pinned, setPinned] = useState(null);

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
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchPremiere();
  }, [id]);

  // REALTIME CHAT
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

      // pinned message (latest pinned)
      const pin = msgs.find((m) => m.pinned);
      setPinned(pin || null);
    });

    return () => unsubscribe();
  }, [id]);

  // SEND MESSAGE (ANTI-SPAM)
  const sendMessage = async () => {
    if (!input.trim() || !user) return;

    const now = Date.now();

    if (now - lastSent < 2000) {
      alert("Slow down…");
      return;
    }

    setLastSent(now);

    await addDoc(collection(db, "premieres", id, "messages"), {
      text: input,
      userId: user.uid,
      name: user.displayName || "User",
      photoURL: user.photoURL || "",
      isAdmin: user.email === "youradmin@email.com", // ⚠️ CHANGE THIS
      createdAt: serverTimestamp(),
      pinned: false,
    });

    setInput("");
  };

  // PIN MESSAGE (ADMIN ONLY)
  const pinMessage = async (msgId) => {
    if (!user?.email) return;

    // remove old pins
    const oldPinned = messages.filter((m) => m.pinned);
    for (let m of oldPinned) {
      await updateDoc(
        doc(db, "premieres", id, "messages", m.id),
        { pinned: false }
      );
    }

    // set new pin
    await updateDoc(
      doc(db, "premieres", id, "messages", msgId),
      { pinned: true }
    );
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        Login required.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0B0F] text-white">

      {/* HEADER */}
      <div className="px-4 md:px-16 py-4 border-b border-white/10 flex justify-between">
        <h1 className="text-lg md:text-xl">{premiere.title}</h1>
        <span className="bg-red-600 px-3 py-1 text-xs rounded-full animate-pulse">
          LIVE
        </span>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 p-4 md:px-16">

        {/* VIDEO */}
        <div className="lg:col-span-2">
          <div className="aspect-video bg-black rounded-2xl overflow-hidden">
            {premiere.embedLink ? (
              <iframe src={premiere.embedLink} className="w-full h-full" />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                Waiting for stream...
              </div>
            )}
          </div>
        </div>

        {/* CHAT */}
        <div className="bg-white/5 rounded-2xl p-4 flex flex-col h-[500px]">

          <h2 className="mb-2 text-sm font-semibold">Live Chat</h2>

          {/* PINNED */}
          {pinned && (
            <div className="bg-yellow-600/20 border border-yellow-600 text-xs p-2 rounded mb-2">
              📌 {pinned.name}: {pinned.text}
            </div>
          )}

          {/* MESSAGES */}
          <div className="flex-1 overflow-y-auto space-y-3 text-sm">

            {messages.map((msg) => (
              <div key={msg.id} className="flex justify-between">

                <div className={`${msg.isAdmin ? "text-yellow-400" : ""}`}>
                  <span className="text-xs text-gray-400">
                    {msg.name}
                  </span>
                  <p>{msg.text}</p>
                </div>

                {user.email === "thefifthagefilms@gmail.com" && (
                  <button
                    onClick={() => pinMessage(msg.id)}
                    className="text-xs text-gray-400"
                  >
                    📌
                  </button>
                )}

              </div>
            ))}

          </div>

          {/* INPUT */}
          <div className="mt-2 flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 bg-white/10 px-3 py-2 rounded text-sm"
              placeholder="Type..."
            />
            <button
              onClick={sendMessage}
              className="bg-red-600 px-4 rounded text-sm"
            >
              Send
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}