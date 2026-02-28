"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { updateProfile } from "firebase/auth";
import { auth } from "@/firebase";
import { db } from "@/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

export default function EditProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }

    if (user) {
      setName(user.displayName || "");

      // Fetch extra profile data
      const fetchUserData = async () => {
        const snapshot = await getDoc(doc(db, "users", user.uid));
        if (snapshot.exists()) {
          setMobile(snapshot.data().mobile || "");
        }
      };

      fetchUserData();
    }
  }, [user, loading, router]);

  const handleSave = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);

      // Update Firebase Auth displayName
      await updateProfile(auth.currentUser, {
        displayName: name,
      });

      // Save additional data in Firestore
      await setDoc(
        doc(db, "users", user.uid),
        {
          name,
          mobile,
          email: user.email,
          updatedAt: new Date(),
        },
        { merge: true }
      );

      router.push("/profile");
    } catch (err) {
      console.error(err);
      alert("Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white px-6 py-20">

      <div className="max-w-2xl mx-auto bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-10 shadow-2xl">

        <h1 className="text-3xl font-bold mb-8">
          Edit Profile
        </h1>

        <form onSubmit={handleSave} className="space-y-6">

          <div>
            <label className="block text-sm mb-2 text-gray-400">
              Full Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-zinc-800 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-600"
            />
          </div>

          <div>
            <label className="block text-sm mb-2 text-gray-400">
              Mobile Number (Optional)
            </label>
            <input
              type="text"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              className="w-full bg-zinc-800 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-600"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="bg-red-600 hover:bg-red-700 px-6 py-3 rounded-full transition"
          >
            Save Changes
          </button>

        </form>

      </div>

    </div>
  );
}