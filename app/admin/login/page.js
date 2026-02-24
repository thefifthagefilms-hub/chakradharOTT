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
    <div className="bg-black text-white min-h-screen flex items-center justify-center">

      <form
        onSubmit={handleLogin}
        className="bg-zinc-900 p-10 rounded-xl shadow-xl w-96"
      >
        <h1 className="text-3xl font-bold mb-8 text-center">
          Admin Login
        </h1>

        <div className="mb-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 bg-zinc-800 rounded"
            required
          />
        </div>

        <div className="mb-6">
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 bg-zinc-800 rounded"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-red-600 hover:bg-red-700 py-3 rounded mb-4 disabled:opacity-60"
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <button
          type="button"
          onClick={handleForgotPassword}
          className="text-sm text-gray-400 hover:text-white block mx-auto"
        >
          Forgot Password?
        </button>
      </form>

    </div>
  );
}