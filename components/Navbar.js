"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [search, setSearch] = useState("");
  const [movies, setMovies] = useState([]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const fetchMovies = async () => {
      const snapshot = await getDocs(collection(db, "movies"));
      setMovies(
        snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
      );
    };
    fetchMovies();
  }, []);

  const filtered =
    search.length > 0
      ? movies.filter((m) =>
          m.title.toLowerCase().includes(search.toLowerCase())
        )
      : [];

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${
        scrolled
          ? "bg-black/70 backdrop-blur-2xl border-b border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.4)]"
          : "bg-gradient-to-b from-black/80 to-transparent"
      }`}
    >
      <div className="flex items-center justify-between px-6 md:px-14 py-4">

        {/* Logo */}
        <Link href="/" className="text-2xl md:text-3xl font-bold text-white">
          Chakradhar <span className="text-red-600">OTT</span>
        </Link>

        {/* Desktop Search */}
        <div className="relative w-64 hidden md:block">
          <input
            type="text"
            placeholder="Search movies..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white/5 backdrop-blur-lg border border-white/10 rounded-full px-4 py-2 text-sm text-white focus:outline-none focus:border-red-600"
          />

          <AnimatePresence>
            {filtered.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="absolute top-12 w-full bg-black/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl max-h-64 overflow-y-auto"
              >
                {filtered.slice(0, 6).map((movie) => (
                  <Link
                    key={movie.id}
                    href={`/movie/${movie.id}`}
                    onClick={() => setSearch("")}
                    className="block px-4 py-3 text-sm hover:bg-white/10 transition"
                  >
                    {movie.title}
                  </Link>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </motion.nav>
  );
}