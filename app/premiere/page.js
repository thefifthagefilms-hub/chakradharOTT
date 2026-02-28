"use client";

import { useEffect, useState } from "react";
import { db } from "../../firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import Link from "next/link";

export default function PremiereListPage() {
  const [premieres, setPremieres] = useState([]);

  useEffect(() => {
    const fetchPremieres = async () => {
      const q = query(
        collection(db, "premieres"),
        orderBy("createdAt", "desc")
      );

      const snapshot = await getDocs(q);
      setPremieres(
        snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
      );
    };

    fetchPremieres();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-12">
      <div className="max-w-6xl mx-auto">

        <h1 className="text-3xl md:text-4xl font-bold mb-10">
          Live Premieres
        </h1>

        {premieres.length === 0 && (
          <p className="text-gray-400">No premieres created yet.</p>
        )}

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">

          {premieres.map((premiere) => (
            <Link
              key={premiere.id}
              href={`/premiere/${premiere.id}`}
              className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition"
            >
              <h2 className="text-xl font-semibold mb-3">
                {premiere.title}
              </h2>

              <p className="text-sm text-gray-400 mb-4 line-clamp-2">
                {premiere.description}
              </p>

              <div className="text-sm text-gray-500 space-y-1">
                <p>
                  Scheduled:{" "}
                  {premiere.scheduledAt?.toDate
                    ? premiere.scheduledAt.toDate().toLocaleString()
                    : new Date(premiere.scheduledAt).toLocaleString()}
                </p>

                <p>
                  Tickets: {premiere.ticketsSold || 0} / {premiere.maxTickets}
                </p>

                <p>
                  {premiere.isPaid
                    ? `Paid Event • ₹${premiere.price}`
                    : "Free Event"}
                </p>
              </div>

            </Link>
          ))}

        </div>
      </div>
    </div>
  );
}