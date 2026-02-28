"use client";

import { useEffect, useState } from "react";
import { db } from "../../../../firebase";
import { doc, getDoc } from "firebase/firestore";
import { useParams } from "next/navigation";
import { useAuth } from "../../../../context/AuthContext";

export default function PremiereRoomPage() {
  const { id } = useParams();
  const { user } = useAuth();

  const [premiere, setPremiere] = useState(null);
  const [loading, setLoading] = useState(true);

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
        Loading Room...
      </div>
    );
  }

  if (!premiere) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        Premiere not found.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white px-4 md:px-16 py-10">

      <div className="max-w-6xl mx-auto space-y-8">

        <h1 className="text-3xl md:text-4xl font-bold">
          {premiere.title}
        </h1>

        {/* Video Section */}
        <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden">
          <div className="aspect-video">

            {premiere.embedLink ? (
              <iframe
                src={premiere.embedLink}
                className="w-full h-full"
                allowFullScreen
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                Live Stream Will Start Soon
              </div>
            )}

          </div>
        </div>

        {/* Basic Live Chat Placeholder */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
          <h2 className="text-xl font-semibold mb-4">
            Live Chat (Coming Next)
          </h2>

          <p className="text-gray-400 text-sm">
            Chat system will be integrated in next step.
          </p>
        </div>

      </div>
    </div>
  );
}