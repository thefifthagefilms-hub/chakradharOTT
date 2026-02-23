"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition duration-500 ${
        scrolled
          ? "bg-black/90 backdrop-blur-md shadow-lg"
          : "bg-gradient-to-b from-black/80 to-transparent"
      }`}
    >
      <div className="flex items-center justify-between px-12 py-5">

        {/* Logo */}
        <Link href="/" className="text-3xl font-extrabold text-red-600 tracking-wide">
          Chakradhar OTT
        </Link>

        {/* Navigation */}
        <div className="flex items-center gap-8 text-sm font-medium">
          <Link
            href="/"
            className="hover:text-red-500 transition"
          >
            Home
          </Link>

          <Link
            href="/"
            className="hover:text-red-500 transition"
          >
            Movies
          </Link>

          <Link
            href="/admin"
            className="hover:text-red-500 transition"
          >
            Admin
          </Link>
        </div>

      </div>
    </nav>
  );
}