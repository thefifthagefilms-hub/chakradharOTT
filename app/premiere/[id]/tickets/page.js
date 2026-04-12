"use client";

import { useEffect, useState } from "react";
import { db } from "@/firebase";
import { doc, getDoc, collection, query, where, getDocs, addDoc, Timestamp, updateDoc } from "firebase/firestore";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function PremierTicketsPage() {
  const params = useParams();
  const id = params?.id;
  const router = useRouter();
  const { user } = useAuth();

  const [premiere, setPremieres] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [userTickets, setUserTickets] = useState([]);

  useEffect(() => {
    if (!id) return;

    const fetchPremiere = async () => {
      try {
        const docRef = doc(db, "premieres", id);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
          setError("Premiere not found");
          setLoading(false);
          return;
        }

        setPremieres({ id: docSnap.id, ...docSnap.data() });

        // Load user's tickets for this premiere
        if (user?.uid) {
          const userTicketQuery = query(
            collection(db, "users", user.uid, "tickets"),
            where("premiereId", "==", id)
          );
          const ticketSnap = await getDocs(userTicketQuery);
          setUserTickets(
            ticketSnap.docs.map((d) => ({ id: d.id, ...d.data() }))
          );
        }
      } catch (err) {
        console.error("Error fetching premiere:", err);
        setError("Failed to load premiere");
      } finally {
        setLoading(false);
      }
    };

    fetchPremiere();
  }, [id, user?.uid]);

  // Handle Razorpay Payment
  const handlePayment = async () => {
    if (!user?.uid) {
      alert("Please login to buy tickets");
      router.push("/login");
      return;
    }

    try {
      setPaymentLoading(true);

      // Create Razorpay Order
      const res = await fetch("/api/razorpay/order", {
        method: "POST",
        body: JSON.stringify({
          amount: premiere.ticketPrice,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to create order");
      }

      const order = await res.json();

      // Razorpay Options
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY,
        amount: order.amount,
        currency: "INR",
        order_id: order.id,
        name: "Chakradhar OTT",
        description: `Ticket for ${premiere.title}`,

        handler: async function (response) {
          try {
            // Verify Payment
            const verifyRes = await fetch("/api/razorpay/verify", {
              method: "POST",
              body: JSON.stringify({
                ...response,
                userId: user.uid,
                premiereId: id,
                title: premiere.title,
              }),
            });

            const verifyData = await verifyRes.json();

            if (verifyData.success) {
              alert("✅ Payment successful! Ticket purchased.");

              // Reload user tickets
              const userTicketQuery = query(
                collection(db, "users", user.uid, "tickets"),
                where("premiereId", "==", id)
              );
              const ticketSnap = await getDocs(userTicketQuery);
              setUserTickets(
                ticketSnap.docs.map((d) => ({ id: d.id, ...d.data() }))
              );

              setPaymentLoading(false);
            } else {
              alert("❌ " + (verifyData.message || "Payment verification failed"));
              setPaymentLoading(false);
            }
          } catch (err) {
            console.error("Verification error:", err);
            alert("Payment verification error");
            setPaymentLoading(false);
          }
        },

        prefill: {
          email: user?.email || "",
        },

        theme: {
          color: "#dc2626",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error("Payment error:", err);
      alert("❌ Payment failed: " + err.message);
      setPaymentLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-[#0B0B0F] text-white min-h-screen flex items-center justify-center">
        <p className="text-gray-400">Loading...</p>
      </div>
    );
  }

  if (error || !premiere) {
    return (
      <div className="bg-[#0B0B0F] text-white min-h-screen flex flex-col items-center justify-center">
        <p className="text-red-500 mb-4">{error || "Premiere not found"}</p>
        <Link href="/" className="bg-red-600 px-6 py-2 rounded-lg hover:bg-red-700">
          Back to Home
        </Link>
      </div>
    );
  }

  // If not ticketed premiere, redirect to join
  if (!premiere.ticketRequired) {
    return (
      <div className="bg-[#0B0B0F] text-white min-h-screen flex flex-col items-center justify-center">
        <p className="text-gray-300 mb-4">This is a free premiere</p>
        <Link href={`/premiere/${id}/join`} className="bg-red-600 px-6 py-2 rounded-lg hover:bg-red-700">
          Join Premiere
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-[#0B0B0F] text-white min-h-screen">
      <div className="h-[70px]" />

      <div className="max-w-2xl mx-auto px-4 md:px-16 py-10">
        {/* HEADER */}
        <h1 className="text-3xl font-bold mb-2">Get Access to {premiere.title}</h1>
        <p className="text-gray-300 mb-8">
          Enter your payment details to purchase a ticket for this exclusive premiere
        </p>

        {/* PRICE INFO */}
        <div className="bg-gradient-to-r from-yellow-600/20 to-orange-600/20 border border-yellow-600/30 rounded-lg p-6 mb-8">
          <p className="text-gray-300 text-sm mb-1">Ticket Price</p>
          <p className="text-4xl font-bold">₹{premiere.ticketPrice}</p>
          <p className="text-xs text-gray-400 mt-2">
            Secured payment powered by Razorpay
          </p>
        </div>

        {/* PAYMENT BUTTON */}
        <button
          onClick={handlePayment}
          disabled={paymentLoading}
          className="w-full bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 px-6 py-4 rounded-lg font-semibold transition mb-6 flex items-center justify-center gap-2"
        >
          {paymentLoading ? (
            <>
              <span className="animate-spin">⏳</span> Processing...
            </>
          ) : (
            <>
              💳 Buy Ticket (₹{premiere.ticketPrice})
            </>
          )}
        </button>

        {/* PURCHASED TICKETS */}
        {userTickets.length > 0 && (
          <div className="mt-10">
            <h2 className="text-2xl font-bold mb-4">✅ Your Tickets</h2>
            <div className="space-y-3">
              {userTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="bg-green-900/20 border border-green-600/30 rounded-lg p-4 flex justify-between items-center"
                >
                  <div>
                    <p className="font-semibold text-lg">{ticket.ticketCode}</p>
                    <p className="text-sm text-gray-400">
                      Purchased {ticket.purchasedAt?.toDate?.().toLocaleDateString?.()}
                    </p>
                  </div>
                  <Link
                    href={`/premiere/${id}/join`}
                    className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-sm font-semibold transition"
                  >
                    Watch Now
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SECURITY INFO */}
        <div className="mt-10 bg-white/5 border border-white/10 rounded-lg p-4">
          <p className="text-xs text-gray-400">
            🔒 Your payment information is secure and handled by Razorpay, a PCI-DSS compliant payment gateway.
            No card details are stored on our servers.
          </p>
        </div>

        {/* BACK LINK */}
        <Link
          href={`/premiere/${id}/join`}
          className="mt-6 block text-center bg-white/10 hover:bg-white/20 px-6 py-3 rounded-lg transition"
        >
          Back to Premiere
        </Link>
      </div>
    </div>
  );
}
