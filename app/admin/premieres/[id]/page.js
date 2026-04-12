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
  Timestamp,
} from "firebase/firestore";
import { useParams } from "next/navigation";
import Link from "next/link";

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
  const [loading, setLoading] = useState(false);

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
    };

    fetchData();
  }, [id]);

  /* STATUS CONTROL */
  const updateStatus = async (status) => {
    await updateDoc(doc(db, "premieres", id), { status });
    setPremiere((prev) => ({ ...prev, status }));
  };

  /* GENERATE TICKETS */
  const handleGenerate = async () => {
    if (!ticketCount || ticketCount < 1) return;

    setLoading(true);

    for (let i = 0; i < ticketCount; i++) {
      const code = generateTicketCode();

      await setDoc(
        doc(db, "premieres", id, "tickets", code),
        {
          code,
          used: false,
          createdAt: Timestamp.now(),
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

    setLoading(false);
  };

  /* TOGGLE USED */
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

  /* TOGGLE APPROVAL */
  const toggleApproval = async (ticketId, currentStatus) => {
    await updateDoc(
      doc(db, "premieres", id, "tickets", ticketId),
      {
        approved: !currentStatus,
        approvedAt: !currentStatus ? Timestamp.now() : null,
      }
    );

    setTickets((prev) =>
      prev.map((t) =>
        t.id === ticketId
          ? { ...t, approved: !currentStatus }
          : t
      )
    );
  };

  /* COPY TICKET */
  const copyTicket = (code) => {
    navigator.clipboard.writeText(code);
    alert("Copied: " + code);
  };

  if (!premiere) {
    return <div className="p-10 text-white">Loading...</div>;
  }

  return (
    <div className="p-6 md:p-10 text-white space-y-8 bg-[#0B0B0F] min-h-screen">

      {/* HEADER */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <h1 className="text-2xl md:text-3xl font-bold">
          {premiere.title}
        </h1>

        <span className={`text-xs px-3 py-1 rounded-full ${
          premiere.status === "live"
            ? "bg-red-600"
            : premiere.status === "ended"
            ? "bg-gray-600"
            : "bg-yellow-600"
        }`}>
          {premiere.status || "scheduled"}
        </span>
      </div>

      {/* CONTROLS */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">

        <div className="flex gap-3 flex-wrap">

          <button
            onClick={() => updateStatus("live")}
            className="bg-green-600 px-4 py-2 rounded-lg text-sm"
          >
            ▶ Start
          </button>

          <button
            onClick={() => updateStatus("ended")}
            className="bg-gray-700 px-4 py-2 rounded-lg text-sm"
          >
            ⛔ End
          </button>

          <Link
            href={`/admin/premieres/${id}/room`}
            className="bg-blue-600 px-4 py-2 rounded-lg text-sm"
          >
            🎥 Room
          </Link>

        </div>

        <p className="text-sm text-gray-400">
          Display Time:{" "}
          {premiere.displayTime
            ? premiere.displayTime.toDate?.().toLocaleString() || new Date(premiere.displayTime).toLocaleString()
            : "Not set"}
        </p>

        <p className="text-sm text-gray-400">
          Start Time:{" "}
          {premiere.startTime
            ? premiere.startTime.toDate?.().toLocaleString() || new Date(premiere.startTime).toLocaleString()
            : "Not set"}
        </p>

      </div>

      {/* GENERATE */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">

        <h2 className="text-lg font-semibold mb-4">
          Generate Tickets
        </h2>

        <div className="flex gap-4 items-center">

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
            className="bg-red-600 px-5 py-3 rounded-full"
          >
            {loading ? "Generating..." : "Generate"}
          </button>

        </div>

      </div>

      {/* PAYMENT REVENUE */}
      {premiere?.ticketRequired && (
        <div className="bg-gradient-to-r from-yellow-600/20 to-orange-600/20 border border-yellow-600/30 rounded-2xl p-6">
          <h2 className="text-lg font-semibold mb-4">💰 Payment Revenue</h2>

          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <p className="text-gray-300 text-sm mb-1">Total Sold</p>
              <p className="text-3xl font-bold">{premiere.ticketsSold || 0}</p>
              <p className="text-xs text-gray-400">tickets</p>
            </div>

            <div>
              <p className="text-gray-300 text-sm mb-1">Ticket Price</p>
              <p className="text-3xl font-bold">₹{premiere.ticketPrice || 0}</p>
              <p className="text-xs text-gray-400">per ticket</p>
            </div>

            <div>
              <p className="text-gray-300 text-sm mb-1">Total Revenue</p>
              <p className="text-3xl font-bold text-yellow-400">
                ₹{((premiere.ticketsSold || 0) * (premiere.ticketPrice || 0)).toLocaleString("en-IN")}
              </p>
              <p className="text-xs text-gray-400">earned</p>
            </div>
          </div>
        </div>
      )}

      {/* TICKETS */}
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

              {/* PAYMENT INFO */}
              {ticket.paymentId && (
                <div className="mb-3 text-xs space-y-1 border-t border-white/10 pt-2">
                  <p className="text-gray-300">💳 <span className="text-yellow-400">Paid</span></p>
                  <p className="text-gray-400 break-all">ID: {ticket.paymentId}</p>
                </div>
              )}

              {/* APPROVAL STATUS */}
              {ticket.paymentId && (
                <div className="mb-3 flex items-center gap-2 text-xs bg-white/5 px-2 py-1 rounded">
                  {ticket.approved ? (
                    <span className="text-green-400">✅ Approved</span>
                  ) : (
                    <span className="text-yellow-500">⏳ Pending</span>
                  )}
                </div>
              )}

              <div className="flex gap-2 flex-wrap">

                <button
                  onClick={() =>
                    toggleUsed(ticket.id, ticket.used)
                  }
                  className="text-xs bg-white/10 px-3 py-1 rounded hover:bg-white/20 transition"
                >
                  {ticket.used ? "Mark Unused" : "Mark Used"}
                </button>

                {ticket.paymentId && (
                  <button
                    onClick={() =>
                      toggleApproval(ticket.id, ticket.approved)
                    }
                    className={`text-xs px-3 py-1 rounded transition ${
                      ticket.approved
                        ? "bg-red-600/50 hover:bg-red-600"
                        : "bg-green-600/50 hover:bg-green-600"
                    }`}
                  >
                    {ticket.approved ? "Revoke" : "Approve"}
                  </button>
                )}

                <button
                  onClick={() => copyTicket(ticket.code)}
                  className="text-xs bg-blue-600 px-3 py-1 rounded hover:bg-blue-700 transition"
                >
                  Copy
                </button>

              </div>

            </div>
          ))}

        </div>

      </div>

    </div>
  );
}