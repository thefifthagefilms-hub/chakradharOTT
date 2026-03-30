"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-black border-t border-white/10 mt-16 text-gray-400 text-sm">

      <div className="max-w-6xl mx-auto px-4 md:px-10 py-8 space-y-6">

        {/* TOP SECTION */}
        <div className="flex flex-col md:flex-row md:justify-between gap-6 text-center md:text-left">

          {/* BRAND */}
          <div>
            <h2 className="text-white font-semibold text-lg">
              Chakradhar OTT
            </h2>
            <p className="mt-2 text-xs text-gray-500 max-w-xs">
              A premium cinematic platform for movies and live premieres.
            </p>
          </div>

          {/* LINKS */}
          <div className="flex flex-col gap-2">
            <Link href="/terms" className="hover:text-white transition">
              Terms & Conditions
            </Link>
            <Link href="/privacy" className="hover:text-white transition">
              Privacy Policy
            </Link>
            <Link href="/contact" className="hover:text-white transition">
              Contact
            </Link>
          </div>

          {/* CONTACT */}
          <div>
            <p>Email:</p>
            <p className="text-gray-500 text-xs mt-1">
              thefifthagefilms@gmail.com
            </p>
          </div>

        </div>

        {/* BOTTOM */}
        <div className="border-t border-white/10 pt-4 text-center text-xs text-gray-500">
          © {new Date().getFullYear()} Chakradhar OTT Platform • Created by Rahul Chakradhar & The Fifth Age Films Productions
        </div>

      </div>

    </footer>
  );
}