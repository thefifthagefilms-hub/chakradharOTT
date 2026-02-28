"use client";

import { useState } from "react";
import { db } from "../../../../firebase";
import { collection, doc, setDoc } from "firebase/firestore";
import { useParams } from "next/navigation";

function generateTicketCode() {
  const part1 = Math.random().toString(36).substring(2, 6).toUpperCase();
  const part2 = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${part1}-${part2}`;
}

export default function GenerateTicketsPage() {
  const { id } = useParams();

  const [count, setCount] = useState(10);
  const [generating, setGenerating] = useState(false);
  const [generatedTickets, setGeneratedTickets] = useState([]);

  const handleGenerate = async () => {
    setGenerating(true);
    const ticketsCollection = collection(db, "premieres", id, "tickets");

    let newTickets = [];

    for (let i = 0; i < count; i++) {
      const code = generateTicketCode();

      await setDoc(doc(ticketsCollection, code), {
        code,
        used: false,
        createdAt: new Date(),
      });

      newTickets.push(code);
    }

    setGeneratedTickets(newTickets);
    setGenerating(false);
  };

  const copyToClipboard = (code) => {
    navigator.clipboard.writeText(code);
    alert("Copied: " + code);
  };

  return (
    <div className="min-h-screen bg-black text-white px-4 py-10">

      <div className="max-w-4xl mx-auto bg-white/5 border border-white/10 rounded-3xl p-6 md:p-10">

        <h1 className="text-2xl md:text-3xl font-bold mb-6">
          Generate Tickets
        </h1>

        <div className="flex flex-col md:flex-row gap-4 mb-6">

          <input
            type="number"
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
            className="p-3 rounded bg-zinc-800 w-full md:w-40"
            min="1"
          />

          <button
            onClick={handleGenerate}
            disabled={generating}
            className="bg-red-600 px-6 py-3 rounded-full hover:bg-red-700 transition"
          >
            {generating ? "Generating..." : "Generate"}
          </button>

        </div>

        {generatedTickets.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-4">
              Generated Ticket Codes
            </h2>

            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
              {generatedTickets.map((code) => (
                <div
                  key={code}
                  className="bg-zinc-800 p-4 rounded-xl flex justify-between items-center"
                >
                  <span className="font-mono text-sm">{code}</span>
                  <button
                    onClick={() => copyToClipboard(code)}
                    className="text-xs bg-white/10 px-3 py-1 rounded hover:bg-white/20"
                  >
                    Copy
                  </button>
                </div>
              ))}
            </div>

          </div>
        )}

      </div>
    </div>
  );
}