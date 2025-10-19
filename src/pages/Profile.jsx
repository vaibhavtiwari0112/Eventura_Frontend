import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { cancelBooking, fetchUserBookings } from "../store/slices/bookingSlice";
import {
  User,
  Mail,
  Ticket,
  ChevronDown,
  ChevronUp,
  Calendar,
  MapPin,
  Film,
  CreditCard,
} from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import ConfirmCancelOverlay from "../components/common/ConfirmCancelOverlay";
import LoadingOverlay from "../components/common/LoadingOverlay";
import SuccessOverlay from "../components/common/SuccessOverlay";
import ErrorOverlay from "../components/common/ErrorOverlay";
import {
  createPaymentOrder,
  verifyPayment,
} from "../store/slices/paymentSlice";

export default function Profile() {
  const user = useSelector((s) => s.auth.user);
  const { bookings, loading } = useSelector((s) => s.booking);
  const dispatch = useDispatch();

  const [expandedId, setExpandedId] = useState(null);
  const [cancelBookingData, setCancelBookingData] = useState(null);
  const [dataLoaded, setDataLoaded] = useState(false);

  // overlays
  const [overlayState, setOverlayState] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  // ✅ Fetch bookings once
  useEffect(() => {
    if (user?.id && !dataLoaded) {
      dispatch(fetchUserBookings(user.id)).then(() => setDataLoaded(true));
    }
  }, [dispatch, user?.id, dataLoaded]);

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleCancelBooking = async ({ bookingId, hallId, reason }) => {
    setOverlayState("loading");
    try {
      await dispatch(cancelBooking({ bookingId, hallId, reason })).unwrap();
      setOverlayState("success");
      setTimeout(() => {
        setOverlayState(null);
        dispatch(fetchUserBookings(user.id));
      }, 2000);
    } catch (err) {
      setErrorMsg(err?.message || "Failed to cancel booking");
      setOverlayState("error");
    }
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // 💳 Razorpay Pay Now handler (Redux-integrated)
  const handlePayNow = async (booking) => {
    try {
      setOverlayState("loading");

      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) throw new Error("Razorpay SDK failed to load.");

      // 1️⃣ Create Razorpay order for existing booking
      const orderResponse = await dispatch(
        createPaymentOrder({
          bookingId: booking.id,
          amount: booking.amount,
          currency: "INR",
        })
      ).unwrap();

      const { key, order, paymentId } = orderResponse;

      // 2️⃣ Razorpay options
      const options = {
        key,
        amount: order.amount,
        currency: order.currency,
        name: "Eventura",
        description: `Payment for Booking #${booking.id}`,
        order_id: order.id,
        handler: async (response) => {
          try {
            // 3️⃣ Verify payment and confirm booking
            await dispatch(
              verifyPayment({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                paymentDocId: paymentId,
                bookingId: booking.id, // ✅ REQUIRED
                hallId: booking.hallId, // ✅ optional, include if your backend expects it
              })
            ).unwrap();

            // 4️⃣ Refresh UI
            setOverlayState("success");
            setTimeout(() => {
              setOverlayState(null);
              dispatch(fetchUserBookings(user.id)); // refresh bookings to show "CONFIRMED"
            }, 1500);
          } catch (verifyErr) {
            setErrorMsg("Payment verification failed");
            setOverlayState("error");
          }
        },
        prefill: {
          name: user?.name,
          email: user?.email,
        },
        theme: { color: "#4F46E5" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
      setOverlayState(null);
    } catch (err) {
      console.error("Payment error:", err);
      setErrorMsg(err.message || "Payment failed");
      setOverlayState("error");
    }
  };

  const statusGradients = {
    confirmed: "bg-gradient-to-r from-green-600 to-green-700 text-white",
    cancelled: "bg-gradient-to-r from-red-600 to-red-700 text-white",
    paid: "bg-gradient-to-r from-indigo-500 to-indigo-600 text-white",
    pending: "bg-gradient-to-r from-yellow-500 to-yellow-600 text-white",
    default: "bg-gradient-to-r from-gray-500 to-gray-600 text-white",
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Profile Header */}
      <div className="bg-gradient-to-r from-navy-600 to-navy-800 dark:from-navy-800 dark:to-navy-900 rounded-2xl shadow-lg p-6 mb-8 flex items-center space-x-4">
        <div className="w-16 h-16 rounded-full bg-white dark:bg-navy-700 flex items-center justify-center text-navy-700 dark:text-white font-bold text-xl shadow-md">
          {user?.name?.[0] || "G"}
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">
            {user?.name || "Guest"}
          </h2>
          <p className="text-gray-200 flex items-center gap-2">
            <Mail size={16} />
            {user?.email || "-"}
          </p>
        </div>
      </div>

      {/* Account Info */}
      <div className="bg-white dark:bg-navy-900 rounded-2xl shadow-md p-5 mb-6">
        <h3 className="text-lg font-semibold text-navy-700 dark:text-gray-100 mb-3 flex items-center gap-2">
          <User size={18} /> Account Info
        </h3>
        <div className="space-y-2 text-gray-700 dark:text-gray-300">
          <p>
            <span className="font-medium">Name:</span> {user?.name || "Guest"}
          </p>
          <p>
            <span className="font-medium">Email:</span> {user?.email || "-"}
          </p>
        </div>
      </div>

      {/* Booking History */}
      <div>
        <h3 className="text-lg font-semibold text-navy-700 dark:text-gray-100 mb-3 flex items-center gap-2">
          <Ticket size={18} /> Booking History
        </h3>

        {loading && !dataLoaded ? (
          <div className="text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-navy-800 p-4 rounded-xl text-center shadow-inner">
            Loading bookings...
          </div>
        ) : !bookings || bookings.length === 0 ? (
          <div className="text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-navy-800 p-4 rounded-xl text-center shadow-inner">
            No bookings yet
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((h) => (
              <div
                key={h.id}
                className="bg-white dark:bg-navy-900 rounded-2xl shadow-md hover:shadow-lg transition overflow-hidden"
              >
                {/* Summary Row */}
                <div
                  className="p-4 flex justify-between items-center cursor-pointer"
                  onClick={() => toggleExpand(h.id)}
                >
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {h.movieTitle || "Booking"} #{h.id}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {h.seats?.length || 0} seats —{" "}
                      {h.seats?.join(", ") || "-"}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold shadow-md ${
                        statusGradients[h.status?.toLowerCase()] ||
                        statusGradients.default
                      }`}
                    >
                      {h.status || "Pending"}
                    </span>
                    {expandedId === h.id ? (
                      <ChevronUp size={18} className="text-gray-500" />
                    ) : (
                      <ChevronDown size={18} className="text-gray-500" />
                    )}
                  </div>
                </div>

                {/* Expanded Section */}
                {expandedId === h.id && (
                  <div className="px-5 pb-5 pt-3 text-sm text-gray-700 dark:text-gray-300 space-y-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50/60 dark:bg-navy-800/40">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <p className="flex items-center gap-2">
                        <Film
                          size={16}
                          className="text-navy-500 dark:text-indigo-400"
                        />
                        <span className="font-medium">Movie:</span>{" "}
                        {h.movieTitle}
                      </p>
                      <p>
                        <span className="font-medium">Hall:</span> {h.hall}
                      </p>
                      <p className="flex items-center gap-2">
                        <MapPin
                          size={16}
                          className="text-navy-500 dark:text-indigo-400"
                        />
                        <span className="font-medium">Location:</span>{" "}
                        {h.location}
                      </p>
                      <p className="flex items-center gap-2">
                        <Calendar
                          size={16}
                          className="text-navy-500 dark:text-indigo-400"
                        />
                        <span className="font-medium">Showtime:</span> {h.time}
                      </p>
                    </div>

                    <div className="border-t border-gray-300 dark:border-gray-700 pt-3 space-y-1">
                      <p>
                        <span className="font-medium">Base Price:</span> ₹
                        {h.basePrice}
                      </p>
                      <p>
                        <span className="font-medium">GST (18%):</span> ₹{h.gst}
                      </p>
                      <p>
                        <span className="font-medium">
                          Entertainment Tax (5%):
                        </span>{" "}
                        ₹{h.entertainmentTax}
                      </p>
                      <p>
                        <span className="font-medium">Convenience Fee:</span> ₹
                        {h.convenienceFee}
                      </p>
                      <p className="font-semibold text-navy-700 dark:text-indigo-300">
                        <span>Total Paid:</span> ₹{h.amount}
                      </p>
                      {h.paymentId && (
                        <p className="flex items-center gap-2 text-xs mt-1 text-gray-500 dark:text-gray-400">
                          <CreditCard size={14} />
                          Payment ID: {h.paymentId}
                        </p>
                      )}
                    </div>

                    {h.status === "confirmed" && (
                      <div className="flex flex-col items-center justify-center mt-4 bg-gray-100 dark:bg-navy-700 rounded-xl p-4 shadow-inner">
                        <QRCodeCanvas
                          value={`BookingID: ${h.id}\nMovie: ${
                            h.movieTitle
                          }\nSeats: ${h.seats.join(", ")}\nShowtime: ${h.time}`}
                          size={120}
                          bgColor="#FFFFFF"
                          fgColor="#000000"
                          level="H"
                          includeMargin={true}
                        />
                        <p className="text-xs mt-2 text-gray-500 dark:text-gray-300">
                          Scan for booking details
                        </p>
                      </div>
                    )}

                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      Booked at: {h.bookedAt ? h.bookedAt : "-"}
                    </p>

                    <div className="mt-4 flex flex-row-reverse justify-start gap-3">
                      {["PENDING", "CONFIRMED"].includes(
                        h.status?.toUpperCase()
                      ) && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setCancelBookingData({
                              bookingId: h.id,
                              hallId: h.hallId,
                            });
                          }}
                          className="px-4 py-2 rounded-lg bg-gradient-to-r from-red-600 to-red-700 text-white shadow hover:from-red-700 hover:to-red-800 transition text-sm font-medium"
                        >
                          Cancel
                        </button>
                      )}

                      {h.status?.toUpperCase() === "PENDING" && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePayNow(h);
                          }}
                          className="px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow hover:from-indigo-700 hover:to-indigo-800 transition flex items-center gap-1 text-sm font-medium"
                        >
                          <CreditCard size={14} /> Pay Now
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Cancel Booking Overlays */}
      {cancelBookingData && (
        <ConfirmCancelOverlay
          onConfirm={(reason) => {
            handleCancelBooking({
              bookingId: cancelBookingData.bookingId,
              hallId: cancelBookingData.hallId,
              reason,
            });
            setCancelBookingData(null);
          }}
          onClose={() => setCancelBookingData(null)}
        />
      )}

      {overlayState === "loading" && <LoadingOverlay message="Processing..." />}
      {overlayState === "success" && (
        <SuccessOverlay message="Action completed successfully!" />
      )}
      {overlayState === "error" && (
        <ErrorOverlay
          message={errorMsg}
          onClose={() => setOverlayState(null)}
        />
      )}
    </div>
  );
}
