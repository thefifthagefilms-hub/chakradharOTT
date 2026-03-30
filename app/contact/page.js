"use client";

import { useState } from "react";
import { db } from "@/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !email || !message) {
      alert("Please fill all fields");
      return;
    }

    try {
      setLoading(true);

      await addDoc(collection(db, "contacts"), {
        name,
        email,
        message,
        createdAt: serverTimestamp(),
      });

      setSuccess(true);
      setName("");
      setEmail("");
      setMessage("");

    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0B0F] text-white px-4 md:px-16 py-10">

      <div className="max-w-3xl mx-auto space-y-8">

        <h1 className="text-2xl md:text-4xl font-bold">
          Contact Us
        </h1>

        <p className="text-gray-400 text-sm">
          Have questions, feedback, or collaboration ideas? Reach out to us.
        </p>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-6">

          {success && (
            <p className="text-green-500 text-sm">
              Message sent successfully.
            </p>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* NAME */}
            <input
              type="text"
              placeholder="Your Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-zinc-800 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
            />

            {/* EMAIL */}
            <input
              type="email"
              placeholder="Your Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-zinc-800 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
            />

            {/* MESSAGE */}
            <textarea
              placeholder="Your Message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows="5"
              className="w-full bg-zinc-800 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
            />

            {/* BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className="bg-red-600 hover:bg-red-700 px-6 py-3 rounded-full w-full transition"
            >
              {loading ? "Sending..." : "Send Message"}
            </button>

          </form>

        </div>

        {/* EXTRA CONTACT INFO */}
        <div className="text-sm text-gray-400 space-y-2">
          <p>Email: thefifthagefilms@gmail.com</p>
          <p>Platform: Chakradhar OTT</p>
        </div>

      </div>

    </div>
  );
}