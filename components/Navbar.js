"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${
        scrolled
          ? "bg-black/80 backdrop-blur-xl border-b border-white/10"
          : "bg-gradient-to-b from-black/80 to-transparent"
      }`}
    >
      <div className="flex items-center justify-between px-6 md:px-12 py-4">

        {/* Logo */}
        <Link
          href="/"
          className="text-2xl md:text-3xl font-bold tracking-tight text-white"
        >
          Chakradhar OTT
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-10 text-sm font-medium text-gray-300">
          <Link href="/" className="hover:text-white transition">
            Home
          </Link>

          <Link href="/movies" className="hover:text-white transition">
            Movies
          </Link>

          <Link href="/admin" className="hover:text-white transition">
            Admin
          </Link>
        </div>

        {/* Mobile Button */}
        <div className="md:hidden">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="text-white text-2xl"
          >
            {menuOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown */}
      {menuOpen && (
        <div className="md:hidden bg-black/95 backdrop-blur-xl border-t border-white/10 px-6 py-6 space-y-6 text-gray-300 text-sm font-medium">
          <Link
            href="/"
            onClick={() => setMenuOpen(false)}
            className="block hover:text-white"
          >
            Home
          </Link>

          <Link
            href="/movies"
            onClick={() => setMenuOpen(false)}
            className="block hover:text-white"
          >
            Movies
          </Link>

          <Link
            href="/admin"
            onClick={() => setMenuOpen(false)}
            className="block hover:text-white"
          >
            Admin
          </Link>
        </div>
      )}
    </nav>
  );
}