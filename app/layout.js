import "./globals.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import CookieBanner from "@/components/CookieBanner"; // ✅ ADDED
import { AuthProvider } from "@/context/AuthContext";
import Script from "next/script";

export const metadata = {
  title: "Chakradhar OTT Platform",
  description: "A premium OTT movie streaming platform",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-black text-white min-h-screen flex flex-col">

        {/* ✅ RAZORPAY SCRIPT */}
        <Script
          src="https://checkout.razorpay.com/v1/checkout.js"
          strategy="beforeInteractive"
        />

        <AuthProvider>
          <Navbar />
          <main className="flex-grow pt-24">
            {children}
          </main>
          <Footer />

          {/* ✅ COOKIE BANNER (NON-BREAKING POSITION) */}
          <CookieBanner />

        </AuthProvider>

      </body>
    </html>
  );
}