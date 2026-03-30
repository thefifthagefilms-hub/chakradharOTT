"use client";

import { useEffect, useState } from "react";
import { db } from "@/firebase";
import {
  doc,
  getDoc,
  updateDoc,
  setDoc,
} from "firebase/firestore";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function JoinPremierePage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();

  const [premiere, setPremiere] = useState(null);
  const [loading, setLoading] = useState(true);

  const [ticket, setTicket] = useState("");
  const [error, setError] = useState("");

  /* FETCH PREMIERE */
  useEffect(() => {
    if (!id) return;

    const fetchPremiere = async () => {
      try {
        const snap = await getDoc(doc(db, "premieres", id));
        if (snap.exists()) {
          setPremiere({ id: snap.id, ...snap.data() });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPremiere();
  }, [id]);

  /* 🔓 AUTO ENTRY (OPEN PREMIERE) */
  useEffect(() => {
    if (!loading && premiere && !premiere.ticketRequired && id) {
      router.push(`/premiere/${id}/room`);
    }
  }, [loading, premiere, id, router]);

  /* 🎟 VALIDATE TICKET */
  const handleJoin = async () => {
    if (!ticket) {
      setError("Enter ticket code");
      return;
    }

    try {
      const ticketRef = doc(db, "premieres", id, "tickets", ticket);
      const snap = await getDoc(ticketRef);

      if (!snap.exists()) {
        setError("Invalid ticket");
        return;
      }

      const data = snap.data();

      if (data.used) {
        setError("Ticket already used");
        return;
      }

      // ✅ mark ticket used
      await updateDoc(ticketRef, {
        used: true,
        usedBy: user.uid,
        usedAt: new Date(),
      });

      // ✅ STORE IN USER PROFILE
      await setDoc(
        doc(db, "users", user.uid, "tickets", ticket),
        {
          ticketCode: ticket,
          premiereId: id,
          title: premiere.title,
          usedAt: new Date(),
        }
      );

      router.push(`/premiere/${id}/room`);
    } catch (err) {
      console.error(err);
      setError("Something went wrong");
    }
  };

  /* AUTH CHECK */
  if (!user) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        Login required.
      </div>
    );
  }

  /* LOADING */
  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        Loading...
      </div>
    );
  }

  /* NOT FOUND */
  if (!premiere) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        Premiere not found
      </div>
    );
  }

  /* 💰 PAID PREMIERE (PLACEHOLDER) */
  if (premiere.paymentRequired) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center gap-4">
        <h1 className="text-xl font-semibold">
          This is a Paid Premiere
        </h1>

        <p className="text-gray-400 text-sm">
          Price: ₹{premiere.ticketPrice || 0}
        </p>

        <button
          className="bg-red-600 px-6 py-3 rounded-lg"
          onClick={() => alert("Payment integration coming next")}
        >
          Buy Ticket
        </button>
      </div>
    );
  }

  /* 🎟 TICKET ENTRY UI */
  return (
    <div className="min-h-screen bg-[#0B0B0F] text-white flex items-center justify-center px-4">

      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 w-full max-w-md space-y-5">

        <h1 className="text-xl font-semibold text-center">
          Enter Ticket
        </h1>

        <input
          type="text"
          placeholder="XXXX-XXXX"
          value={ticket}
          onChange={(e) => setTicket(e.target.value.toUpperCase())}
          className="w-full bg-white/10 border border-white/10 px-4 py-3 rounded-lg text-center tracking-widest"
        />

        {error && (
          <p className="text-red-500 text-sm text-center">
            {error}
          </p>
        )}

        <button
          onClick={handleJoin}
          className="w-full bg-red-600 py-3 rounded-lg"
        >
          Join Premiere
        </button>

      </div>

    </div>
  );
}