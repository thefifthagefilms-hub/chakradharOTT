"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

export default function AdminLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();

  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    // Let middleware handle authorization.
    // Layout only waits briefly for hydration.
    const timer = setTimeout(() => {
      setLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  const handleLogout = async () => {
    await fetch("/api/logout", { method: "POST" });
    router.push("/admin/login");
  };

  if (isLoginPage) return <>{children}</>;

  if (loading) {
    return (
      <div className="bg-black text-white min-h-screen flex items-center justify-center">
        Loading Admin Panel...
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-black text-white">

      {/* DESKTOP SIDEBAR */}
      <aside className="hidden md:flex w-64 bg-zinc-900 p-6 flex-col justify-between shadow-xl border-r border-white/10">

        <div>
          <h2 className="text-2xl font-bold mb-10">Admin Panel</h2>

          <nav className="space-y-6 text-gray-300">
            <Link href="/admin" className="block hover:text-white transition">
              Dashboard
            </Link>

            <Link href="/admin/movies" className="block hover:text-white transition">
              Movies
            </Link>

            <Link href="/admin/comments" className="block hover:text-white transition">
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

      {/* MOBILE TOP BAR */}
      <div className="md:hidden fixed top-0 left-0 w-full bg-zinc-900 border-b border-white/10 flex items-center justify-between px-4 py-4 z-50">
        <h2 className="text-lg font-semibold">Admin</h2>
        <button onClick={() => setMenuOpen(true)} className="text-2xl">☰</button>
      </div>

      {menuOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50">
          <div className="absolute left-0 top-0 h-full w-64 bg-zinc-900 p-6 shadow-xl border-r border-white/10 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-10">
                <h2 className="text-xl font-bold">Admin</h2>
                <button onClick={() => setMenuOpen(false)}>✕</button>
              </div>

              <nav className="space-y-6 text-gray-300">
                <Link href="/admin" onClick={() => setMenuOpen(false)} className="block hover:text-white">
                  Dashboard
                </Link>
                <Link href="/admin/movies" onClick={() => setMenuOpen(false)} className="block hover:text-white">
                  Movies
                </Link>
                <Link href="/admin/comments" onClick={() => setMenuOpen(false)} className="block hover:text-white">
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
          </div>
        </div>
      )}

      <main className="flex-1 p-6 md:p-12 pt-24 md:pt-12 overflow-y-auto w-full">
        {children}
      </main>

    </div>
  );
}