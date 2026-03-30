"use client";

import { useState } from "react";
import { auth } from "../../../firebase";
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail, // ✅ NEW
} from "firebase/auth";

export default function AdminLogin() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0); // ✅ NEW

  const allowedEmails = [
    "thefifthagefilms@gmail.com",
    "rahulchakradharperepogu@gmail.com",
  ];

  /* ---------------- STEP 1: EMAIL + PASSWORD ---------------- */

  const handlePasswordLogin = async (e) => {
    e.preventDefault();

    if (!allowedEmails.includes(email)) {
      alert("Unauthorized email.");
      return;
    }

    try {
      setLoading(true);

      await signInWithEmailAndPassword(auth, email, password);

      await sendOtp();

      setStep(2);
    } catch {
      alert("Invalid credentials.");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- SEND OTP (REUSABLE) ---------------- */

  const sendOtp = async () => {
    const res = await fetch("/api/send-otp", {
      method: "POST",
      body: JSON.stringify({ email }),
      headers: { "Content-Type": "application/json" },
    });

    const data = await res.json();

    if (!data.success) {
      alert("Failed to send OTP.");
      return;
    }

    // cooldown (30 sec)
    setCooldown(30);
    const interval = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  /* ---------------- STEP 2: OTP VERIFY ---------------- */

  const handleVerifyOtp = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const res = await fetch("/api/verify-otp", {
        method: "POST",
        body: JSON.stringify({ email, otp }),
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();

      if (data.success) {
        window.location.href = "/admin";
      } else {
        alert("Invalid or expired OTP.");
      }
    } catch {
      alert("Verification failed.");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- FORGOT PASSWORD ---------------- */

  const handleForgotPassword = async () => {
    if (!email) {
      alert("Enter your email first.");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      alert("Password reset link sent to your email.");
    } catch {
      alert("Failed to send reset email.");
    }
  };

  return (
    <div className="relative bg-black text-white min-h-screen flex items-center justify-center px-4">

      <form
        onSubmit={step === 1 ? handlePasswordLogin : handleVerifyOtp}
        className="bg-zinc-900 p-6 md:p-10 rounded-xl shadow-xl w-full max-w-md"
      >
        <h1 className="text-2xl md:text-3xl font-bold mb-8 text-center">
          {step === 1 ? "Admin Login" : "Enter OTP"}
        </h1>

        {step === 1 && (
          <>
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

            <div className="mb-2">
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

            {/* ✅ FORGOT PASSWORD */}
            <div className="text-right mb-6">
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-xs text-gray-400 hover:text-white transition"
              >
                Forgot Password?
              </button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div className="mb-4">
              <input
                type="text"
                placeholder="Enter 6 digit OTP"
                value={otp}
                disabled={loading}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full p-3 bg-zinc-800 rounded focus:outline-none focus:ring-2 focus:ring-red-600 text-center tracking-widest"
                required
              />
            </div>

            {/* ✅ RESEND OTP */}
            <div className="text-center mb-6">
              <button
                type="button"
                disabled={cooldown > 0}
                onClick={sendOtp}
                className="text-xs text-gray-400 hover:text-white transition disabled:opacity-50"
              >
                {cooldown > 0
                  ? `Resend OTP in ${cooldown}s`
                  : "Resend OTP"}
              </button>
            </div>
          </>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-red-600 hover:bg-red-700 py-3 rounded mb-4 disabled:opacity-60 transition"
        >
          {loading
            ? "Processing..."
            : step === 1
            ? "Continue"
            : "Verify OTP"}
        </button>
      </form>

      {loading && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm text-gray-300">
              Securing session...
            </p>
          </div>
        </div>
      )}
    </div>
  );
}