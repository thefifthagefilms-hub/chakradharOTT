"use client";

import { useState } from "react";
import { db } from "../../../../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "../../../../context/AuthContext";

export default function JoinPremierePage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();

  const [ticketCode, setTicketCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleValidate = async () => {
    if (!user) {
      alert("Login required.");
      return;
    }

    if (!ticketCode.trim()) {
      setError("Enter ticket code.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const ticketRef = doc(
        db,
        "premieres",
        id,
        "tickets",
        ticketCode.trim().toUpperCase()
      );

      const ticketSnap = await getDoc(ticketRef);

      if (!ticketSnap.exists()) {
        setError("Invalid Ticket Code");
        setLoading(false);
        return;
      }

      const ticketData = ticketSnap.data();

      if (ticketData.used) {
        setError("Ticket Already Used");
        setLoading(false);
        return;
      }

      // Mark ticket permanently used
      await updateDoc(ticketRef, {
        used: true,
        usedBy: user.uid,
        usedAt: new Date(),
      });

      router.push(`/premiere/${id}/room`);
    } catch (err) {
      setError("Validation failed.");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
      <div className="bg-white/5 border border-white/10 rounded-2xl p-8 w-full max-w-md">

        <h1 className="text-2xl font-bold mb-6 text-center">
          Enter Premiere
        </h1>

        <input
          type="text"
          placeholder="Enter Ticket Code"
          value={ticketCode}
          onChange={(e) => setTicketCode(e.target.value)}
          className="w-full p-3 rounded bg-zinc-800 mb-4"
        />

        {error && (
          <p className="text-red-500 text-sm mb-3 text-center">
            {error}
          </p>
        )}

        <button
          onClick={handleValidate}
          disabled={loading}
          className="w-full bg-red-600 py-3 rounded-full hover:bg-red-700 transition"
        >
          {loading ? "Validating..." : "Validate & Enter"}
        </button>

      </div>
    </div>
  );
}