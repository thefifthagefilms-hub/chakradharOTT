"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { sendEmailVerification, signOut } from "firebase/auth";
import { auth } from "@/firebase";

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
  const [verificationMessage, setVerificationMessage] = useState(""); // ✅ NEW

  /* ---------------- GOOGLE LOGIN ---------------- */

  const handleGoogle = async () => {
    try {
      setLoading(true);
      await loginWithGoogle();
      router.push("/");
    } catch (err) {
      console.error("Google Error:", err);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- EMAIL LOGIN / REGISTER ---------------- */

  const handleEmailAuth = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setVerificationMessage(""); // ✅ Clear previous messages

      if (mode === "login") {
        await loginWithEmail(email, password);

        // ✅ FIXED: Check verification AFTER login
        if (!auth.currentUser.emailVerified) {
          // Logout immediately to keep state consistent
          await signOut(auth);

          // Show message with resend option
          setVerificationMessage(
            "Email not verified. Check your inbox for verification link. Resend email?"
          );

          // Resend verification email
          try {
            await sendEmailVerification(auth.currentUser);
            alert("Verification email resent. Check your inbox or spam folder.");
          } catch (err) {
            console.error("Resend error:", err);
          }

          setEmail("");
          setPassword("");
          return;
        }
      } else {
        await registerWithEmail(email, password);

        // Send verification email
        await sendEmailVerification(auth.currentUser);

        alert(
          "Account created! Verification email sent. Please check your inbox or spam folder."
        );
        setMode("login");
        setEmail("");
        setPassword("");
        return;
      }

      router.push("/");
    } catch (err) {
      console.error("Auth Error:", err);
      alert(err.message);
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
      await resetPassword(email);
      alert("Password reset email sent.");
    } catch (err) {
      console.error("Reset Error:", err);
      alert(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-6">

      <div className="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl">

        <h1 className="text-3xl font-bold mb-6 text-center">
          {mode === "login" ? "Welcome Back" : "Create Account"}
        </h1>

        {/* GOOGLE LOGIN */}
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

        {/* ✅ VERIFICATION MESSAGE */}
        {verificationMessage && (
          <div className="bg-yellow-600/20 border border-yellow-500/50 text-yellow-200 p-4 rounded-xl mb-6 text-sm">
            <p className="mb-3">{verificationMessage}</p>
            <button
              type="button"
              onClick={async () => {
                if (email && auth.currentUser) {
                  try {
                    await sendEmailVerification(auth.currentUser);
                    alert("Verification email resent!");
                  } catch (err) {
                    alert("Error resending email");
                  }
                }
              }}
              className="w-full bg-yellow-600 hover:bg-yellow-700 px-3 py-2 rounded text-xs transition"
            >
              Resend Verification Email
            </button>
          </div>
        )}

        {/* EMAIL FORM */}
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