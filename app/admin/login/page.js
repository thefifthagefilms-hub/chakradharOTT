"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "../../../firebase";
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const allowedEmails = [
    "thefifthagefilms@gmail.com",
    "rahulchakradharperepogu@gmail.com",
  ];

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!allowedEmails.includes(email)) {
      alert("Unauthorized email.");
      return;
    }

    try {
      setLoading(true);

      await signInWithEmailAndPassword(auth, email, password);

      document.cookie =
        "admin-session=verified; path=/; max-age=1800; SameSite=Strict";

      router.push("/admin");

    } catch (error) {
      alert("Invalid credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!allowedEmails.includes(email)) {
      alert("Only authorized emails can reset password.");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      alert("Password reset email sent.");
    } catch {
      alert("Error sending reset email.");
    }
  };

  return (
    <div className="relative bg-black text-white min-h-screen flex items-center justify-center px-4">

      {/* LOGIN CARD */}
      <form
        onSubmit={handleLogin}
        className="bg-zinc-900 p-6 md:p-10 rounded-xl shadow-xl w-full max-w-md"
      >
        <h1 className="text-2xl md:text-3xl font-bold mb-8 text-center">
          Admin Login
        </h1>

        <div className="mb-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            disabled={loading}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 bg-zinc-800 rounded focus:outline-none focus:ring-2 focus:ring-red-600"
            required
          />
        </div>

        <div className="mb-6">
          <input
            type="password"
            placeholder="Password"
            value={password}
            disabled={loading}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 bg-zinc-800 rounded focus:outline-none focus:ring-2 focus:ring-red-600"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-red-600 hover:bg-red-700 py-3 rounded mb-4 disabled:opacity-60 transition"
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <button
          type="button"
          disabled={loading}
          onClick={handleForgotPassword}
          className="text-sm text-gray-400 hover:text-white block mx-auto"
        >
          Forgot Password?
        </button>
      </form>

      {/* FULL SCREEN LOADING OVERLAY */}
      {loading && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm text-gray-300">
              Verifying credentials...
            </p>
          </div>
        </div>
      )}

    </div>
  );
}