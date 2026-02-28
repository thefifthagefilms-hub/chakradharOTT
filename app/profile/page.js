"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/firebase";
import {
  doc,
  deleteDoc,
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  reauthenticateWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState("overview");
  const [wishlist, setWishlist] = useState([]);
  const [comments, setComments] = useState([]);
  const [ratings, setRatings] = useState([]);
  const [watchHistory, setWatchHistory] = useState([]);

  /* ---------- Redirect (no setState here) ---------- */

  useEffect(() => {
    if (user === null) {
      router.push("/login");
    }
  }, [user, router]);

  /* ---------- Fetch Wishlist ---------- */

  useEffect(() => {
    if (!user) return;

    const fetchWishlist = async () => {
      const snap = await getDocs(
        collection(db, "users", user.uid, "wishlist")
      );
      setWishlist(snap.docs.map(doc => doc.data()));
    };

    fetchWishlist();
  }, [user]);

  /* ---------- Fetch Activity ---------- */

  useEffect(() => {
    if (!user) return;

    const fetchActivity = async () => {
      const commentSnap = await getDocs(
        query(
          collection(db, "comments"),
          where("userId", "==", user.uid)
        )
      );

      const ratingSnap = await getDocs(
        query(
          collection(db, "ratings"),
          where("userId", "==", user.uid)
        )
      );

      const watchSnap = await getDocs(
        query(
          collection(db, "views"),
          where("userId", "==", user.uid)
        )
      );

      setComments(commentSnap.docs.map(d => d.data()));
      setRatings(ratingSnap.docs.map(d => d.data()));
      setWatchHistory(watchSnap.docs.map(d => d.data()));
    };

    fetchActivity();
  }, [user]);

  /* ---------- Delete Account ---------- */

  const handleDeleteAccount = async () => {
    try {
      if (user.providerData[0].providerId === "password") {
        const password = prompt("Enter your password:");
        if (!password) return;

        const credential = EmailAuthProvider.credential(
          user.email,
          password
        );

        await reauthenticateWithCredential(user, credential);
      } else {
        const provider = new GoogleAuthProvider();
        await reauthenticateWithPopup(user, provider);
      }

      await deleteDoc(doc(db, "users", user.uid));
      await user.delete();
      router.push("/");
    } catch {
      alert("Reauthentication failed.");
    }
  };

  const getInitials = (email) =>
    email?.slice(0, 2).toUpperCase();

  /* ---------- Loading UI ---------- */

  if (user === undefined) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        Loading...
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-black text-white flex flex-col md:flex-row">

      {/* Sidebar */}
      <div className="md:w-64 w-full border-b md:border-b-0 md:border-r border-white/10 p-6 flex flex-col justify-between">

        <div>
          <div className="flex items-center gap-3 mb-6">
            {user.photoURL ? (
              <Image
                src={user.photoURL}
                alt="avatar"
                width={48}
                height={48}
                className="rounded-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center font-bold">
                {getInitials(user.email)}
              </div>
            )}
            <p className="text-sm break-all">{user.email}</p>
          </div>

          <div className="space-y-3 text-sm">
            {["overview", "activity", "wishlist", "security"].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`block w-full text-left px-4 py-2 rounded-lg transition capitalize ${
                  activeTab === tab
                    ? "bg-red-600"
                    : "hover:bg-white/10"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Logout bottom */}
        <button
          onClick={logout}
          className="mt-6 bg-yellow-600 px-4 py-2 rounded-lg hover:bg-yellow-700 transition text-sm"
        >
          Logout
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 md:p-10 space-y-6">

        {activeTab === "overview" && (
          <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
            <h2 className="text-xl font-bold mb-4">Overview</h2>
            <p>Email: {user.email}</p>
          </div>
        )}

        {activeTab === "activity" && (
          <div className="bg-white/5 p-6 rounded-2xl border border-white/10 space-y-6">
            <h2 className="text-xl font-bold">Activity</h2>

            <div>
              <h3 className="font-semibold mb-2">Recently Watched</h3>
              {watchHistory.length === 0 && <p>No watch history yet.</p>}
              {watchHistory.map((w, i) => (
                <p key={i} className="text-sm text-gray-300">
                  {w.movieId}
                </p>
              ))}
            </div>

            <div>
              <h3 className="font-semibold mb-2">My Comments</h3>
              {comments.length === 0 && <p>No comments yet.</p>}
              {comments.map((c, i) => (
                <p key={i} className="text-sm text-gray-300">
                  {c.comment}
                </p>
              ))}
            </div>

            <div>
              <h3 className="font-semibold mb-2">My Ratings</h3>
              {ratings.length === 0 && <p>No ratings yet.</p>}
              {ratings.map((r, i) => (
                <p key={i} className="text-sm text-gray-300">
                  Rated: {r.rating} / 5
                </p>
              ))}
            </div>
          </div>
        )}

        {activeTab === "wishlist" && (
          <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
            <h2 className="text-xl font-bold mb-4">My List</h2>

            {wishlist.length === 0 && (
              <p>No saved movies yet.</p>
            )}

            {wishlist.map((movie, i) => (
              <p key={i} className="text-sm">
                {movie.title}
              </p>
            ))}
          </div>
        )}

        {activeTab === "security" && (
          <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
            <button
              onClick={handleDeleteAccount}
              className="bg-red-700 px-5 py-2 rounded-lg"
            >
              Delete Account
            </button>
          </div>
        )}

      </div>
    </div>
  );
}