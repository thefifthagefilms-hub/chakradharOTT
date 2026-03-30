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
  setDoc,
  deleteDoc,
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

  const [viewerCount, setViewerCount] = useState(0);

  // ✅ HOST STATE
  const [isHost, setIsHost] = useState(false);

  /* FETCH PREMIERE */
  useEffect(() => {
    if (!id) return;

    const fetchPremiere = async () => {
      const snap = await getDoc(doc(db, "premieres", id));
      if (snap.exists()) {
        setPremiere({ id: snap.id, ...snap.data() });
      }
      setLoading(false);
    };

    fetchPremiere();
  }, [id]);

  /* CHECK HOST */
  useEffect(() => {
    if (!user || !id) return;

    const hostRef = doc(db, "premieres", id, "hosts", user.uid);

    const unsub = onSnapshot(hostRef, (snap) => {
      if (snap.exists()) setIsHost(true);
      else if (user.email === "thefifthagefilms@gmail.com") setIsHost(true);
      else setIsHost(false);
    });

    return () => unsub();
  }, [user, id]);

  /* VIEWERS */
  useEffect(() => {
    if (!user || !id) return;

    const viewerRef = doc(db, "premieres", id, "viewers", user.uid);

    setDoc(viewerRef, {
      userId: user.uid,
      joinedAt: new Date(),
    });

    return () => deleteDoc(viewerRef);
  }, [user, id]);

  useEffect(() => {
    const ref = collection(db, "premieres", id, "viewers");

    const unsub = onSnapshot(ref, (snap) => {
      setViewerCount(snap.size);
    });

    return () => unsub();
  }, [id]);

  /* CHAT */
  useEffect(() => {
    const q = query(
      collection(db, "premieres", id, "messages"),
      orderBy("createdAt", "asc")
    );

    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));

      setMessages(data);
      setPinned(data.find((m) => m.pinned));
    });

    return () => unsub();
  }, [id]);

  /* SEND */
  const sendMessage = async () => {
    if (!input.trim()) return;

    const now = Date.now();
    if (now - lastSent < 2000) return alert("Slow down…");

    setLastSent(now);

    await addDoc(collection(db, "premieres", id, "messages"), {
      text: input,
      name: user.displayName || "User",
      userId: user.uid,
      createdAt: serverTimestamp(),
      pinned: false,
    });

    setInput("");
  };

  /* PIN */
  const pinMessage = async (msgId) => {
    const old = messages.filter((m) => m.pinned);

    for (let m of old) {
      await updateDoc(
        doc(db, "premieres", id, "messages", m.id),
        { pinned: false }
      );
    }

    await updateDoc(
      doc(db, "premieres", id, "messages", msgId),
      { pinned: true }
    );
  };

  /* DELETE */
  const deleteMessage = async (msgId) => {
    await deleteDoc(doc(db, "premieres", id, "messages", msgId));
  };

  /* MAKE HOST */
  const makeHost = async (msgUserId) => {
    await setDoc(
      doc(db, "premieres", id, "hosts", msgUserId),
      {
        userId: msgUserId,
      }
    );
  };

  if (!user) {
    return <div className="text-white p-10">Login required</div>;
  }

  if (loading) {
    return <div className="text-white p-10">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-[#0B0B0F] text-white">

      {/* HEADER */}
      <div className="flex justify-between p-4 border-b border-white/10">

        <h1>{premiere.title}</h1>

        <div className="flex gap-3 items-center">
          <span className="bg-red-600 px-2 py-1 text-xs rounded">
            LIVE
          </span>

          <span className="text-xs">
            👀 {viewerCount}
          </span>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 p-4">

        {/* VIDEO */}
        <div className="lg:col-span-2 aspect-video">
          <iframe
            src={premiere.embedLink}
            className="w-full h-full"
          />
        </div>

        {/* CHAT */}
        <div className="bg-white/5 p-4 rounded">

          {pinned && (
            <div className="bg-yellow-600 p-2 mb-2 text-xs">
              📌 {pinned.text}
            </div>
          )}

          <div className="h-[400px] overflow-y-auto space-y-2">

            {messages.map((m) => (
              <div key={m.id} className="flex justify-between">

                <div>
                  <p className="text-xs text-gray-400">{m.name}</p>
                  <p>{m.text}</p>
                </div>

                {isHost && (
                  <div className="flex gap-2 text-xs">
                    <button onClick={() => pinMessage(m.id)}>📌</button>
                    <button onClick={() => deleteMessage(m.id)}>❌</button>
                    <button onClick={() => makeHost(m.userId)}>👑</button>
                  </div>
                )}

              </div>
            ))}

          </div>

          <div className="flex gap-2 mt-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 bg-white/10 p-2"
            />
            <button
              onClick={sendMessage}
              className="bg-red-600 px-3"
            >
              Send
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}