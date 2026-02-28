"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

export default function AuthModal({ open, onClose }) {
  const router = useRouter();

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Background Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 flex items-center justify-center z-50 px-6"
          >
            <div className="bg-zinc-900 border border-white/10 rounded-3xl p-8 w-full max-w-md shadow-2xl">

              <h2 className="text-2xl font-bold mb-4">
                Login Required
              </h2>

              <p className="text-gray-400 mb-6">
                Please login or create an account to continue.
              </p>

              <div className="flex gap-4">

                <button
                  onClick={() => router.push("/login")}
                  className="flex-1 bg-red-600 hover:bg-red-700 py-3 rounded-full transition"
                >
                  Login / Register
                </button>

                <button
                  onClick={onClose}
                  className="flex-1 bg-white/10 hover:bg-white/20 py-3 rounded-full transition"
                >
                  Cancel
                </button>

              </div>

            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}