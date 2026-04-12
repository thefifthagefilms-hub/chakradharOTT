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
  deleteDoc,
} from "firebase/firestore";
import { useParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function PremiereRoomPage() {
  const { id } = useParams();
  const { user } = useAuth();

  const [premiere, setPremiere] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [lastSent, setLastSent] = useState(0);
  const [pinned, setPinned] = useState(null);

  const [viewerCount, setViewerCount] = useState(0);
  const [viewers, setViewers] = useState([]);
  const [showViewers, setShowViewers] = useState(false);

  const [isLive, setIsLive] = useState(false);
  const [countdown, setCountdown] = useState("");

  /* FETCH PREMIERE */
  useEffect(() => {
    if (!id) return;

    const fetchPremiere = async () => {
      try {
        const snap = await getDoc(doc(db, "premieres", id));
        if (snap.exists()) {
          setPremiere({ id: snap.id, ...snap.data() });
          setNotFound(false);
        } else {
          setNotFound(true);
        }
      } catch (err) {
        console.error("Error fetching premiere:", err);
        setNotFound(true);
      }
      setLoading(false);
    };

    fetchPremiere();
  }, [id]);

  /* CHECK IF PREMIERE IS LIVE */
  useEffect(() => {
    if (!premiere?.scheduledFor) return;

    const updateLiveStatus = () => {
      const scheduledTime = premiere.scheduledFor.toDate?.() || new Date(premiere.scheduledFor);
      const now = new Date();
      const diff = scheduledTime - now;

      if (diff <= 0) {
        setIsLive(true);
        setCountdown("");
      } else {
        setIsLive(false);
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setCountdown(`${hours}h ${minutes}m ${seconds}s`);
      }
    };

    updateLiveStatus();
    const interval = setInterval(updateLiveStatus, 1000);
    return () => clearInterval(interval);
  }, [premiere]);

  /* REGISTER VIEWER */
  useEffect(() => {
    if (!user || !id) return;

    const viewerRef = doc(db, "premieres", id, "viewers", user.uid);

    // Register viewer
    const registerViewer = async () => {
      try {
        await addDoc(collection(db, "premieres", id, "viewers"), {
          userId: user.uid,
          joinedAt: new Date(),
        });
      } catch (err) {
        console.error("Error registering viewer:", err);
      }
    };

    registerViewer();

    // Clean up when component unmounts
    return () => {
      try {
        deleteDoc(viewerRef).catch(() => {});
      } catch (err) {
        console.error("Error unregistering viewer:", err);
      }
    };
  }, [user, id]);

  /* TRACK VIEWERS COUNT */
  useEffect(() => {
    if (!id) return;

    const ref = collection(db, "premieres", id, "viewers");

    const unsub = onSnapshot(ref, (snap) => {
      setViewerCount(snap.size);
      const viewerList = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setViewers(viewerList);
    });

    return () => unsub();
  }, [id]);

  /* LOAD MESSAGES */
  useEffect(() => {
    if (!id) return;

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

  /* SEND MESSAGE */
  const sendMessage = async () => {
    if (!input.trim()) return;
    if (!user) {
      alert("Please login to send messages");
      return;
    }

    const now = Date.now();
    if (now - lastSent < 2000) {
      alert("Slow down…");
      return;
    }

    setLastSent(now);

    try {
      await addDoc(collection(db, "premieres", id, "messages"), {
        text: input,
        name: user.displayName || "User",
        userId: user.uid,
        createdAt: serverTimestamp(),
        pinned: false,
      });

      setInput("");
    } catch (err) {
      console.error("Error sending message:", err);
      alert("Failed to send message");
    }
  };

  /* HANDLE KEY PRESS */
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  /* LOADING STATE */
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0B0F] text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
          <p>Loading premiere...</p>
        </div>
      </div>
    );
  }

  /* NOT FOUND STATE */
  if (notFound || !premiere) {
    return (
      <div className="min-h-screen bg-[#0B0B0F] text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">404</h1>
          <p className="text-gray-400 mb-6">Premiere not found</p>
          <a href="/premieres" className="bg-red-600 hover:bg-red-700 px-6 py-2 rounded transition">
            Back to Premieres
          </a>
        </div>
      </div>
    );
  }

  /* LOGIN REQUIRED STATE */
  if (!user) {
    return (
      <div className="min-h-screen bg-[#0B0B0F] text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Login Required</h1>
          <p className="text-gray-400 mb-6">Please login to view this premiere</p>
          <a href="/login" className="bg-red-600 hover:bg-red-700 px-6 py-2 rounded transition">
            Login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0B0F] text-white">

      {/* HEADER */}
      <div className="flex justify-between p-4 border-b border-white/10 items-center">

        <div>
          <h1 className="text-2xl font-bold">{premiere.title}</h1>
          {premiere.description && (
            <p className="text-sm text-gray-400 mt-1">{premiere.description}</p>
          )}
        </div>

        <div className="flex gap-3 items-center">
          {isLive ? (
            <span className="bg-red-600 px-3 py-1 text-sm rounded font-semibold animate-pulse">
              🔴 LIVE NOW
            </span>
          ) : (
            <span className="bg-blue-600 px-3 py-1 text-sm rounded font-semibold">
              ⏱️ {countdown}
            </span>
          )}

          <button
            onClick={() => setShowViewers(!showViewers)}
            className="bg-white/10 hover:bg-white/20 px-3 py-1 text-xs rounded transition cursor-pointer flex items-center gap-2"
          >
            👀 {viewerCount}
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 p-4">

        {/* VIDEO PLAYER */}
        <div className="lg:col-span-2">
          <div className="bg-black aspect-video rounded overflow-hidden">
            {premiere.embedLink ? (
              <iframe
                src={premiere.embedLink}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                No video available
              </div>
            )}
          </div>
        </div>

        {/* CHAT SECTION */}
        <div className="bg-white/5 border border-white/10 p-4 rounded flex flex-col h-[600px]">

          {/* PINNED MESSAGE */}
          {pinned && (
            <div className="bg-yellow-600/20 border border-yellow-600/50 p-3 mb-3 rounded text-sm">
              <p className="text-xs text-yellow-300 font-semibold mb-1">📌 Pinned Message</p>
              <p className="text-yellow-100">{pinned.text}</p>
              <p className="text-xs text-yellow-400 mt-1">— {pinned.name}</p>
            </div>
          )}

          {/* MESSAGES */}
          <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-2">

            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-500">
                <p className="text-sm">No messages yet. Start the conversation!</p>
              </div>
            ) : (
              messages.map((m) => (
                <div key={m.id} className="bg-white/5 p-2 rounded border border-white/10">
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex-1">
                      <p className="text-xs text-gray-400 font-semibold">{m.name}</p>
                      <p className="text-sm break-words">{m.text}</p>
                    </div>
                    {m.userId === user?.uid && (
                      <span className="text-xs text-gray-500 whitespace-nowrap">(you)</span>
                    )}
                  </div>
                </div>
              ))
            )}

          </div>

          {/* MESSAGE INPUT */}
          <div className="flex gap-2 border-t border-white/10 pt-3">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message... (Enter to send)"
              className="flex-1 bg-white/10 border border-white/10 p-2 rounded text-sm resize-none h-10 focus:outline-none focus:border-white/30 transition"
              rows="1"
            />
            <button
              onClick={sendMessage}
              className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-sm font-semibold transition flex items-center gap-2 whitespace-nowrap"
            >
              Send
            </button>
          </div>

        </div>

      </div>

      {/* ACTIVE VIEWERS SIDEBAR */}
      {showViewers && (
        <div className="fixed right-0 top-0 bottom-0 w-80 bg-[#0B0B0F] border-l border-white/10 p-4 space-y-4 overflow-y-auto z-40">

          <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-4">
            <h2 className="text-lg font-bold">Active Viewers</h2>
            <button
              onClick={() => setShowViewers(false)}
              className="text-gray-400 hover:text-white text-2xl transition"
            >
              ✕
            </button>
          </div>

          <div className="bg-white/10 border border-white/10 p-3 rounded mb-4">
            <p className="text-sm font-semibold">Total Viewers: {viewers.length}</p>
          </div>

          {viewers.length === 0 ? (
            <p className="text-gray-400 text-sm">No active viewers</p>
          ) : (
            <div className="space-y-2">
              {viewers.map((viewer) => (
                <div
                  key={viewer.id}
                  className="bg-white/5 border border-white/10 rounded-lg p-3"
                >
                  <div className="flex items-center gap-2">
                    <span className="inline-block w-2 h-2 bg-green-500 rounded-full"></span>
                    <p className="text-xs text-gray-300 font-mono break-all flex-1">
                      {viewer.id === user?.uid ? "You" : viewer.id.substring(0, 8) + "..."}
                    </p>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Joined {viewer.joinedAt?.toDate?.().toLocaleTimeString?.() || "just now"}
                  </p>
                </div>
              ))}
            </div>
          )}

        </div>
      )}

      {/* OVERLAY WHEN VIEWERS SIDEBAR IS OPEN */}
      {showViewers && (
        <div
          className="fixed inset-0 bg-black/40 z-30"
          onClick={() => setShowViewers(false)}
        />
      )}

    </div>
  );
}
