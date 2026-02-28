"use client";

import { useState } from "react";
import { db } from "../../../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useAuth } from "../../../context/AuthContext";
import { useRouter } from "next/navigation";
import { createPremiereObject } from "../../../lib/premiereUtils";

export default function CreatePremierePage() {
  const { user } = useAuth();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [maxTickets, setMaxTickets] = useState(100);
  const [isPaid, setIsPaid] = useState(false);
  const [price, setPrice] = useState("");

  const handleCreate = async (e) => {
    e.preventDefault();

    if (!user) {
      alert("Login required.");
      return;
    }

    const premiereData = createPremiereObject({
      title,
      description,
      scheduledAt,
      maxTickets,
      isPaid,
      price,
      createdBy: user.uid,
    });

    await addDoc(collection(db, "premieres"), {
      ...premiereData,
      createdAt: serverTimestamp(),
    });

    router.push("/profile");
  };

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-10">
      <div className="max-w-3xl mx-auto bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8">

        <h1 className="text-2xl md:text-3xl font-bold mb-6">
          Create Live Premiere
        </h1>

        <form onSubmit={handleCreate} className="space-y-5">

          <input
            type="text"
            placeholder="Premiere Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-3 rounded bg-zinc-800"
            required
          />

          <textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-3 rounded bg-zinc-800"
          />

          <input
            type="datetime-local"
            value={scheduledAt}
            onChange={(e) => setScheduledAt(e.target.value)}
            className="w-full p-3 rounded bg-zinc-800"
            required
          />

          <input
            type="number"
            value={maxTickets}
            onChange={(e) => setMaxTickets(Number(e.target.value))}
            className="w-full p-3 rounded bg-zinc-800"
            min="1"
          />

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={isPaid}
              onChange={() => setIsPaid(!isPaid)}
            />
            <span>Paid Event</span>
          </div>

          {isPaid && (
            <input
              type="number"
              placeholder="Price"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full p-3 rounded bg-zinc-800"
            />
          )}

          <button
            type="submit"
            className="bg-red-600 px-6 py-3 rounded-full hover:bg-red-700"
          >
            Create Premiere
          </button>

        </form>
      </div>
    </div>
  );
}