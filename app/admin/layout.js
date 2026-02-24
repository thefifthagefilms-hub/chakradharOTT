"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { auth } from "../../firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";

const allowedEmails = [
  "thefifthagefilms@gmail.com",
  "rahulchakradharperepogu@gmail.com",
];

export default function AdminLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();

  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  const isLoginPage = pathname === "/admin/login";

  /* ---------------- AUTH CHECK ---------------- */

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && allowedEmails.includes(user.email)) {
        // Also check session cookie
        const hasSession =
          document.cookie.includes("admin-session=verified");

        if (hasSession) {
          setAuthorized(true);
        } else {
          setAuthorized(false);
          router.push("/admin/login");
        }
      } else {
        setAuthorized(false);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  /* ---------------- REDIRECT BLOCK ---------------- */

  useEffect(() => {
    if (!loading && !authorized && !isLoginPage) {
      router.push("/admin/login");
    }
  }, [loading, authorized, isLoginPage, router]);

  /* ---------------- AUTO SESSION TIMEOUT ---------------- */

  useEffect(() => {
    if (!authorized) return;

    const timeout = setTimeout(() => {
      document.cookie =
        "admin-session=; Max-Age=0; path=/;";

      signOut(auth);
      router.push("/admin/login");
    }, 30 * 60 * 1000); // 30 minutes

    return () => clearTimeout(timeout);
  }, [authorized, router]);

  /* ---------------- LOGOUT ---------------- */

  const handleLogout = async () => {
    document.cookie =
      "admin-session=; Max-Age=0; path=/;";

    await signOut(auth);
    router.push("/admin/login");
  };

  /* ---------------- LOGIN PAGE BYPASS ---------------- */

  if (isLoginPage) {
    return <>{children}</>;
  }

  /* ---------------- LOADING ---------------- */

  if (loading) {
    return (
      <div className="bg-black text-white min-h-screen flex items-center justify-center">
        Verifying secure session...
      </div>
    );
  }

  if (!authorized) return null;

  /* ---------------- ADMIN UI ---------------- */

  return (
    <div className="flex min-h-screen bg-black text-white">

      {/* SIDEBAR */}
      <aside className="w-64 bg-zinc-900 p-6 flex flex-col justify-between shadow-xl border-r border-white/10">

        <div>
          <h2 className="text-2xl font-bold mb-10">
            Admin Panel
          </h2>

          <nav className="space-y-6 text-gray-300">

            <Link
              href="/admin"
              className="block hover:text-white transition"
            >
              Dashboard
            </Link>

            <Link
              href="/admin/movies"
              className="block hover:text-white transition"
            >
              Movies
            </Link>

            <Link
              href="/admin/comments"
              className="block hover:text-white transition"
            >
              Comments
            </Link>

          </nav>
        </div>

        <button
          onClick={handleLogout}
          className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded transition"
        >
          Logout
        </button>

      </aside>

      {/* MAIN */}
      <main className="flex-1 p-12 overflow-y-auto">
        {children}
      </main>

    </div>
  );
}