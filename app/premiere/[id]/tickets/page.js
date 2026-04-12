"use client";

import { useEffect, useState } from "react";
import { db } from "@/firebase";
import { doc, getDoc, collection, query, where, getDocs, addDoc, Timestamp } from "firebase/firestore";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function PremierTicketsPage() {
  const params = useParams();
  const id = params?.id;

  const [premiere, setPremieres] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [ticketNumber, setTicketNumber] = useState("");
  const [buyLoading, setBuyLoading] = useState(false);
  const [userTickets, setUserTickets] = useState([]);

  useEffect(() => {
    if (!id) return;

    const fetchPremiere = async () => {
      try {
        const docRef = doc(db, "premieres", id);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
          setError("Premiere not found");
          setLoading(false);
          return;
        }

        setPremieres({ id: docSnap.id, ...docSnap.data() });

        // Optionally load user tickets (uncomment when auth is available)
        // const userId = getCurrentUserId();
        // if (userId) {
        //   const ticketQuery = query(
        //     collection(db, "tickets"),
        //     where("userId", "==", userId),
        //     where("premiereId", "==", id)
        //   );
        //   const ticketSnap = await getDocs(ticketQuery);
        //   setUserTickets(ticketSnap.docs.map(d => ({ id: d.id, ...d.data() })));
        // }
      } catch (err) {
        console.error("Error fetching premiere:", err);
        setError("Failed to load premiere");
      } finally {
        setLoading(false);
      }
    };

    fetchPremiere();
  }, [id]);

  const handleBuyTicket = async () => {
    if (!ticketNumber.trim()) {
      alert("Please enter a ticket number");
      return;
    }

    try {
      setBuyLoading(true);

      // Add ticket to Firestore
      await addDoc(collection(db, "tickets"), {
        premiereId: id,
        ticketNumber: ticketNumber.trim(),
        ticketPrice: premiere.ticketPrice,
        purchasedAt: Timestamp.now(),
        status: "active",
        // Add userId when auth is available
        // userId: getCurrentUserId()
      });

      alert("Ticket activated! You can now watch the premiere.");
      setTicketNumber("");

      // Optionally redirect to premiere
      // router.push(`/premiere/${id}/join`);
    } catch (err) {
      console.error("Error buying ticket:", err);
      alert("Failed to activate ticket");
    } finally {
      setBuyLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-[#0B0B0F] text-white min-h-screen flex items-center justify-center">
        <p className="text-gray-400">Loading...</p>
      </div>
    );
  }

  if (error || !premiere || !premiere.ticketRequired) {
    return (
      <div className="bg-[#0B0B0F] text-white min-h-screen flex flex-col items-center justify-center">
        <p className="text-red-500 mb-4">{error || "Tickets not available for this premiere"}</p>
        <Link href="/" className="bg-red-600 px-6 py-2 rounded-lg hover:bg-red-700">
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-[#0B0B0F] text-white min-h-screen">
      <div className="h-[70px]" />

      <div className="max-w-2xl mx-auto px-4 md:px-16 py-10">
        {/* HEADER */}
        <h1 className="text-3xl font-bold mb-2">Get Access to {premiere.title}</h1>
        <p className="text-gray-300 mb-8">
          Enter your ticket number to watch this exclusive premiere
        </p>

        {/* PRICE INFO */}
        <div className="bg-gradient-to-r from-yellow-600/20 to-orange-600/20 border border-yellow-600/30 rounded-lg p-6 mb-8">
          <p className="text-gray-300 text-sm mb-1">Ticket Price</p>
          <p className="text-4xl font-bold">₹{premiere.ticketPrice}</p>
        </div>

        {/* TICKET INPUT */}
        <div className="bg-white/5 border border-white/10 rounded-lg p-8 space-y-6">
          <div>
            <label className="block text-sm font-semibold mb-3">
              Ticket Number
            </label>
            <input
              type="text"
              value={ticketNumber}
              onChange={(e) => setTicketNumber(e.target.value)}
              placeholder="Enter your ticket number"
              className="w-full bg-white/10 border border-white/10 p-4 rounded-lg focus:outline-none focus:border-yellow-600"
            />
            <p className="text-xs text-gray-400 mt-2">
              You should have received this in your email or confirmation
            </p>
          </div>

          <button
            onClick={handleBuyTicket}
            disabled={buyLoading}
            className="w-full bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 px-6 py-3 rounded-lg font-semibold transition"
          >
            {buyLoading ? "Activating..." : "Activate Ticket"}
          </button>
        </div>

        {/* USER TICKETS */}
        {userTickets.length > 0 && (
          <div className="mt-10">
            <h2 className="text-2xl font-bold mb-4">Your Tickets</h2>
            <div className="space-y-2">
              {userTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="bg-white/5 border border-white/10 rounded-lg p-4 flex justify-between items-center"
                >
                  <div>
                    <p className="font-semibold">{ticket.ticketNumber}</p>
                    <p className="text-sm text-gray-400">
                      Purchased{" "}
                      {ticket.purchasedAt?.toDate?.().toLocaleDateString()}
                    </p>
                  </div>
                  <Link
                    href={`/premiere/${id}/join`}
                    className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-sm font-semibold"
                  >
                    Watch Now
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* BACK LINK */}
        <Link
          href={`/premiere/${id}/join`}
          className="mt-8 block text-center bg-white/10 hover:bg-white/20 px-6 py-3 rounded-lg transition"
        >
          Back to Premiere
        </Link>
      </div>
    </div>
  );
}
