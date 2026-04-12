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
  Timestamp,
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
  const [viewers, setViewers] = useState([]);
  const [showViewers, setShowViewers] = useState(false);
  const [selectedUserToRemove, setSelectedUserToRemove] = useState(null);
  const [removalReason, setRemovalReason] = useState("");

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
      // ✅ Fetch viewers list
      const viewerList = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setViewers(viewerList);
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

  /* REMOVE USER */
  const removeUser = async (userId) => {
    try {
      // Delete from viewers
      await deleteDoc(doc(db, "premieres", id, "viewers", userId));

      // Optional: Store removal record
      if (removalReason || removalReason !== "") {
        await setDoc(
          doc(db, "premieres", id, "removed_users", userId),
          {
            userId,
            removedAt: Timestamp.now(),
            reason: removalReason || "No reason provided",
            removedBy: user.uid,
          }
        );
      }

      alert(`✅ User removed${removalReason ? ": " + removalReason : ""}`);
      setSelectedUserToRemove(null);
      setRemovalReason("");
    } catch (err) {
      console.error("Error removing user:", err);
      alert("Failed to remove user");
    }
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
      <div className="flex justify-between p-4 border-b border-white/10 items-center">

        <h1>{premiere.title}</h1>

        <div className="flex gap-3 items-center">
          <span className="bg-red-600 px-2 py-1 text-xs rounded">
            LIVE
          </span>

          <button
            onClick={() => setShowViewers(!showViewers)}
            className="bg-white/10 hover:bg-white/20 px-3 py-1 text-xs rounded transition cursor-pointer flex items-center gap-2"
          >
            👀 {viewerCount}
          </button>
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

      {/* VIEWERS SIDEBAR */}
      {showViewers && (
        <div className="fixed right-0 top-0 bottom-0 w-80 bg-[#0B0B0F] border-l border-white/10 p-4 space-y-4 overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Active Viewers ({viewers.length})</h2>
            <button
              onClick={() => setShowViewers(false)}
              className="text-gray-400 hover:text-white text-2xl"
            >
              ✕
            </button>
          </div>

          {viewers.length === 0 && (
            <p className="text-gray-400 text-sm">No viewers</p>
          )}

          <div className="space-y-2 mt-4">
            {viewers.map((viewer) => (
              <div
                key={viewer.id}
                className="bg-white/5 border border-white/10 rounded-lg p-3 flex justify-between items-center"
              >
                <div className="text-sm">
                  <p className="font-mono break-all">{viewer.id}</p>
                  <p className="text-xs text-gray-400">
                    {viewer.joinedAt?.toDate?.().toLocaleTimeString?.() || "just now"}
                  </p>
                </div>

                {isHost && viewer.id !== user?.uid && (
                  <button
                    onClick={() => setSelectedUserToRemove(viewer.id)}
                    className="bg-red-600 hover:bg-red-700 px-2 py-1 text-xs rounded transition"
                  >
                    ❌
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* REMOVAL MODAL */}
      {selectedUserToRemove && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-[#0B0B0F] border border-white/20 rounded-2xl max-w-md w-full p-6 space-y-4">
            <h2 className="text-xl font-bold">Remove User from Session?</h2>

            <div className="p-3 bg-red-600/20 border border-red-600/30 rounded">
              <p className="text-sm text-gray-300 break-all">{selectedUserToRemove}</p>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">
                Reason (Optional)
              </label>
              <textarea
                value={removalReason}
                onChange={(e) => setRemovalReason(e.target.value)}
                placeholder="e.g., Spam, Inappropriate behavior, etc."
                className="w-full bg-white/10 border border-white/10 p-3 rounded-lg text-sm"
                rows="3"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => removeUser(selectedUserToRemove)}
                className="flex-1 bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg font-semibold transition"
              >
                Remove User
              </button>
              <button
                onClick={() => {
                  setSelectedUserToRemove(null);
                  setRemovalReason("");
                }}
                className="flex-1 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg font-semibold transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}