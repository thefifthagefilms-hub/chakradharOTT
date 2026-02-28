"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Image from "next/image";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase";

export default function ProfilePage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [profileExists, setProfileExists] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }

    const checkProfile = async () => {
      if (user) {
        const snapshot = await getDoc(doc(db, "users", user.uid));
        if (!snapshot.exists() || !user.displayName) {
          router.push("/profile/edit");
        } else {
          setProfileExists(true);
        }
      }
    };

    checkProfile();
  }, [user, loading, router]);

  if (loading || !user || !profileExists) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white px-6 py-20">
      <div className="max-w-3xl mx-auto bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-10 shadow-2xl">

        <div className="flex items-center gap-6 mb-10">

          <Image
            src={
              user.photoURL ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(user.email)}`
            }
            alt="profile"
            width={90}
            height={90}
            className="rounded-full border border-white/20"
          />

          <div>
            <h1 className="text-3xl font-bold">
              {user.displayName}
            </h1>
            <p className="text-gray-400 mt-1">
              {user.email}
            </p>
          </div>

        </div>

        <div className="flex gap-4 flex-wrap">

          <button
            onClick={() => router.push("/profile/edit")}
            className="bg-white/10 hover:bg-white/20 px-6 py-3 rounded-full transition"
          >
            Edit Profile
          </button>

          <button
            onClick={logout}
            className="bg-red-600 hover:bg-red-700 px-6 py-3 rounded-full transition"
          >
            Logout
          </button>

        </div>

      </div>
    </div>
  );
}