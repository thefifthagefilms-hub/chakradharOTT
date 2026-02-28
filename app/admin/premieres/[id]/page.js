"use client";

import { useEffect, useState } from "react";
import { db } from "@/firebase";
import {
  doc,
  getDoc,
  collection,
  getDocs,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { useParams } from "next/navigation";

function generateTicketCode() {
  const part1 = Math.random().toString(36).substring(2, 6).toUpperCase();
  const part2 = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${part1}-${part2}`;
}

export default function AdminPremiereDetail() {
  const { id } = useParams();

  const [premiere, setPremiere] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [ticketCount, setTicketCount] = useState(5);
  const [loading, setLoading] = useState(true);

  /* Fetch Data */
  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      const premiereSnap = await getDoc(doc(db, "premieres", id));

      if (premiereSnap.exists()) {
        setPremiere({ id: premiereSnap.id, ...premiereSnap.data() });
      }

      const ticketsSnap = await getDocs(
        collection(db, "premieres", id, "tickets")
      );

      setTickets(
        ticketsSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
      );

      setLoading(false);
    };

    fetchData();
  }, [id]);

  /* Generate Tickets */
  const handleGenerate = async () => {
    for (let i = 0; i < ticketCount; i++) {
      const code = generateTicketCode();

      await setDoc(
        doc(db, "premieres", id, "tickets", code),
        {
          code,
          used: false,
          createdAt: new Date(),
        }
      );
    }

    const snap = await getDocs(
      collection(db, "premieres", id, "tickets")
    );

    setTickets(
      snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
    );
  };

  /* Toggle Used (Admin Override) */
  const toggleUsed = async (ticketId, currentStatus) => {
    await updateDoc(
      doc(db, "premieres", id, "tickets", ticketId),
      {
        used: !currentStatus,
      }
    );

    setTickets((prev) =>
      prev.map((t) =>
        t.id === ticketId
          ? { ...t, used: !currentStatus }
          : t
      )
    );
  };

  if (loading) {
    return (
      <div className="p-10 text-white">
        Loading...
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 text-white">

      <h1 className="text-2xl md:text-3xl font-bold mb-6">
        {premiere?.title}
      </h1>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8">

        <h2 className="text-lg font-semibold mb-4">
          Generate Tickets
        </h2>

        <div className="flex gap-4">

          <input
            type="number"
            value={ticketCount}
            onChange={(e) =>
              setTicketCount(Number(e.target.value))
            }
            className="bg-zinc-800 p-3 rounded w-32"
            min="1"
          />

          <button
            onClick={handleGenerate}
            className="bg-red-600 px-5 py-3 rounded-full hover:bg-red-700 transition"
          >
            Generate
          </button>

        </div>

      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">

        <h2 className="text-lg font-semibold mb-4">
          Tickets ({tickets.length})
        </h2>

        {tickets.length === 0 && (
          <p className="text-gray-400">
            No tickets generated.
          </p>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">

          {tickets.map((ticket) => (
            <div
              key={ticket.id}
              className={`p-4 rounded-xl border ${
                ticket.used
                  ? "border-red-600 bg-red-900/30"
                  : "border-green-600 bg-green-900/20"
              }`}
            >
              <p className="font-mono text-sm mb-2">
                {ticket.code}
              </p>

              <button
                onClick={() =>
                  toggleUsed(ticket.id, ticket.used)
                }
                className="text-xs bg-white/10 px-3 py-1 rounded"
              >
                {ticket.used ? "Mark Unused" : "Mark Used"}
              </button>
            </div>
          ))}

        </div>

      </div>

    </div>
  );
}