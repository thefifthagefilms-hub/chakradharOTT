"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useMemo } from "react";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [movies, setMovies] = useState([]);

  const dropdownRef = useRef(null);

  /* ---------------- Scroll Effect ---------------- */
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /* ---------------- Fetch Movies Once ---------------- */
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

  /* ---------------- Debounce Query ---------------- */
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  /* ---------------- Derived Results (NO setState) ---------------- */
  const results = useMemo(() => {
    if (!debouncedQuery) return [];

    return movies
      .filter((m) =>
        m.title.toLowerCase().includes(debouncedQuery.toLowerCase())
      )
      .slice(0, 6);
  }, [debouncedQuery, movies]);

  /* ---------------- Outside Click ---------------- */
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setQuery("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

        <Link href="/" className="text-2xl md:text-3xl font-bold text-white">
          Chakradhar <span className="text-red-600">OTT</span>
        </Link>

        <div className="relative w-64 hidden md:block" ref={dropdownRef}>
          <input
            type="text"
            placeholder="Search movies..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-white/5 backdrop-blur-lg border border-white/10 rounded-full px-4 py-2 text-sm text-white focus:outline-none focus:border-red-600"
          />

          <AnimatePresence>
            {results.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="absolute top-12 w-full bg-black/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl max-h-64 overflow-y-auto"
              >
                {results.map((movie) => (
                  <Link
                    key={movie.id}
                    href={`/movie/${movie.id}`}
                    onClick={() => setQuery("")}
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