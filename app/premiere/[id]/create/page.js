"use client";

import { useState } from "react";
import { db } from "@/firebase";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { createPremiereObject } from "@/lib/premiereUtils";
import { useAuth } from "@/context/AuthContext";

export default function CreatePremierePage() {
  const { user } = useAuth();

  const [form, setForm] = useState({
    title: "",
    movieId: "",
    directorId: "",
    startTime: "",
    endTime: "",
    type: "free",
    maxSeats: "",
    requiresTicket: false,
    transferable: false,
    paymentEnabled: false,
    paymentType: "none",
    upiId: "",
    paymentLink: "",
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      alert("Not authorized.");
      return;
    }

    try {
      const premiereData = createPremiereObject({
        title: form.title,
        movieId: form.movieId,
        directorId: form.directorId || null,
        startTime: Timestamp.fromDate(new Date(form.startTime)),
        endTime: Timestamp.fromDate(new Date(form.endTime)),
        type: form.type,
        maxSeats: form.maxSeats ? Number(form.maxSeats) : null,
        requiresTicket: form.requiresTicket,
        transferable: form.transferable,
        paymentEnabled: form.paymentEnabled,
        paymentType: form.paymentType,
        upiId: form.upiId || null,
        paymentLink: form.paymentLink || null,
        createdBy: user.uid,
      });

      await addDoc(collection(db, "premieres"), premiereData);

      alert("Premiere created successfully.");
      setForm({
        title: "",
        movieId: "",
        directorId: "",
        startTime: "",
        endTime: "",
        type: "free",
        maxSeats: "",
        requiresTicket: false,
        transferable: false,
        paymentEnabled: false,
        paymentType: "none",
        upiId: "",
        paymentLink: "",
      });

    } catch (error) {
      console.error(error);
      alert("Error creating premiere.");
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-12">
      <div className="max-w-3xl mx-auto bg-white/5 p-8 rounded-2xl border border-white/10">

        <h1 className="text-2xl md:text-3xl font-bold mb-8">
          Create Premiere Event
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">

          <input
            type="text"
            name="title"
            placeholder="Premiere Title"
            value={form.title}
            onChange={handleChange}
            className="w-full p-3 bg-zinc-800 rounded-lg"
            required
          />

          <input
            type="text"
            name="movieId"
            placeholder="Movie ID"
            value={form.movieId}
            onChange={handleChange}
            className="w-full p-3 bg-zinc-800 rounded-lg"
            required
          />

          <input
            type="text"
            name="directorId"
            placeholder="Director User ID"
            value={form.directorId}
            onChange={handleChange}
            className="w-full p-3 bg-zinc-800 rounded-lg"
          />

          <div className="grid md:grid-cols-2 gap-4">
            <input
              type="datetime-local"
              name="startTime"
              value={form.startTime}
              onChange={handleChange}
              className="p-3 bg-zinc-800 rounded-lg"
              required
            />
            <input
              type="datetime-local"
              name="endTime"
              value={form.endTime}
              onChange={handleChange}
              className="p-3 bg-zinc-800 rounded-lg"
              required
            />
          </div>

          <select
            name="type"
            value={form.type}
            onChange={handleChange}
            className="w-full p-3 bg-zinc-800 rounded-lg"
          >
            <option value="free">Free</option>
            <option value="limited">Limited Seats</option>
            <option value="paid">Paid</option>
          </select>

          <input
            type="number"
            name="maxSeats"
            placeholder="Max Seats (Optional)"
            value={form.maxSeats}
            onChange={handleChange}
            className="w-full p-3 bg-zinc-800 rounded-lg"
          />

          <div className="space-y-3 text-sm">

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="requiresTicket"
                checked={form.requiresTicket}
                onChange={handleChange}
              />
              Requires Ticket
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="transferable"
                checked={form.transferable}
                onChange={handleChange}
              />
              Transferable Ticket
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="paymentEnabled"
                checked={form.paymentEnabled}
                onChange={handleChange}
              />
              Enable Payment
            </label>

          </div>

          {form.paymentEnabled && (
            <>
              <select
                name="paymentType"
                value={form.paymentType}
                onChange={handleChange}
                className="w-full p-3 bg-zinc-800 rounded-lg"
              >
                <option value="none">Select Payment Type</option>
                <option value="upi">UPI</option>
                <option value="qr">QR Code</option>
                <option value="link">Payment Link</option>
              </select>

              <input
                type="text"
                name="upiId"
                placeholder="UPI ID"
                value={form.upiId}
                onChange={handleChange}
                className="w-full p-3 bg-zinc-800 rounded-lg"
              />

              <input
                type="text"
                name="paymentLink"
                placeholder="Payment Link"
                value={form.paymentLink}
                onChange={handleChange}
                className="w-full p-3 bg-zinc-800 rounded-lg"
              />
            </>
          )}

          <button
            type="submit"
            className="w-full bg-red-600 py-3 rounded-lg hover:bg-red-700 transition"
          >
            Create Premiere
          </button>

        </form>
      </div>
    </div>
  );
}