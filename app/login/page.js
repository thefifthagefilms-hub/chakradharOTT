"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const {
    loginWithGoogle,
    loginWithEmail,
    registerWithEmail,
    resetPassword,
  } = useAuth();

  const [mode, setMode] = useState("login"); // login | register
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGoogle = async () => {
    try {
      setLoading(true);
      await loginWithGoogle();
      router.push("/");
    } catch (err) {
      alert("Google login failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);

      if (mode === "login") {
        await loginWithEmail(email, password);
      } else {
        await registerWithEmail(email, password);
      }

      router.push("/");
    } catch (err) {
      alert("Authentication failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      alert("Enter your email first.");
      return;
    }

    try {
      await resetPassword(email);
      alert("Password reset email sent.");
    } catch {
      alert("Error sending reset email.");
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-6">

      <div className="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl">

        <h1 className="text-3xl font-bold mb-6 text-center">
          {mode === "login" ? "Welcome Back" : "Create Account"}
        </h1>

        {/* Google Login */}
        <button
          onClick={handleGoogle}
          disabled={loading}
          className="w-full mb-6 bg-white text-black py-3 rounded-xl font-medium hover:opacity-90 transition"
        >
          Continue with Google
        </button>

        <div className="text-center text-gray-400 mb-6 text-sm">
          OR
        </div>

        {/* Email Form */}
        <form onSubmit={handleEmailAuth} className="space-y-4">

          <input
            type="email"
            placeholder="Email"
            required
            disabled={loading}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-zinc-800 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-600"
          />

          <input
            type="password"
            placeholder="Password"
            required
            disabled={loading}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-zinc-800 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-600"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700 py-3 rounded-xl transition"
          >
            {mode === "login" ? "Login" : "Register"}
          </button>

        </form>

        {mode === "login" && (
          <button
            onClick={handleForgotPassword}
            className="text-sm text-gray-400 mt-4 block mx-auto hover:text-white"
          >
            Forgot Password?
          </button>
        )}

        <div className="mt-6 text-center text-sm text-gray-400">
          {mode === "login" ? (
            <>
              Don’t have an account?{" "}
              <button
                onClick={() => setMode("register")}
                className="text-white underline"
              >
                Register
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button
                onClick={() => setMode("login")}
                className="text-white underline"
              >
                Login
              </button>
            </>
          )}
        </div>

      </div>
    </div>
  );
}