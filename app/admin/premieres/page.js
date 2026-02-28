"use client";

import { useEffect, useState } from "react";
import { db } from "@/firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import Link from "next/link";

export default function AdminPremieresPage() {
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
    <div className="p-6 md:p-10 text-white">

      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl md:text-3xl font-bold">
          Manage Premieres
        </h1>

        <Link
          href="/premiere/create"
          className="bg-red-600 px-5 py-2 rounded-full hover:bg-red-700 transition text-sm"
        >
          + Create Premiere
        </Link>
      </div>

      {premieres.length === 0 && (
        <p className="text-gray-400">No premieres found.</p>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

        {premieres.map((premiere) => (
          <Link
            key={premiere.id}
            href={`/admin/premieres/${premiere.id}`}
            className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition"
          >
            <h2 className="text-lg font-semibold mb-2">
              {premiere.title}
            </h2>

            <p className="text-sm text-gray-400 mb-3">
              {premiere.description}
            </p>

            <p className="text-xs text-gray-500">
              {premiere.scheduledAt?.toDate
                ? premiere.scheduledAt.toDate().toLocaleString()
                : ""}
            </p>
          </Link>
        ))}

      </div>
    </div>
  );
}