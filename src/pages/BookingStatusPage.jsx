import React, { useEffect } from "react";
import { useParams, useLocation, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchBookingStatus } from "../store/slices/bookingSlice";
import { CheckCircle2, XCircle, Clock, ArrowLeft, Ticket } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react"; // ✅ Import QR Code component

export default function BookingStatusPage() {
  const { id } = useParams();
  const location = useLocation();
  const booking = location.state?.booking;
  const dispatch = useDispatch();

  const statusFromStore = useSelector((s) => s.booking.statusById[id]);

  useEffect(() => {
    if (id) {
      dispatch(fetchBookingStatus(id));
    }
  }, [id, dispatch]);

  if (!booking) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-12">
        <div className="bg-white dark:bg-navy-900 rounded-2xl shadow-lg p-8 text-center">
          <p className="text-lg text-gray-700 dark:text-gray-300">
            Booking not found.
          </p>
          <Link
            to="/"
            className="inline-block mt-4 px-6 py-2 rounded-lg bg-navy-600 text-white hover:bg-navy-500 dark:bg-navy-700 dark:hover:bg-navy-600 transition"
          >
            <ArrowLeft size={16} className="inline mr-2" /> Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const effectiveStatus = statusFromStore || booking.status || "pending";

  const statusConfig = {
    confirmed: {
      title: "Booking Confirmed!",
      desc: "Your seats are reserved successfully.",
      icon: <CheckCircle2 size={32} className="mr-4" />,
      bannerClass: "from-green-500 to-green-600",
    },
    cancelled: {
      title: "Booking Cancelled",
      desc: "Your booking was cancelled. Payment will be refunded if applicable.",
      icon: <XCircle size={32} className="mr-4" />,
      bannerClass: "from-red-500 to-red-600",
    },
    pending: {
      title: "Booking Pending",
      desc: "We are waiting for confirmation from the payment provider.",
      icon: <Clock size={32} className="mr-4" />,
      bannerClass: "from-yellow-500 to-yellow-600",
    },
  };

  const cfg = statusConfig[effectiveStatus] || statusConfig.pending;

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      {/* Status Banner */}
      <div
        className={`bg-gradient-to-r ${cfg.bannerClass} text-white rounded-2xl p-6 flex items-center shadow-md mb-8`}
      >
        {cfg.icon}
        <div>
          <h2 className="text-2xl font-bold">{cfg.title}</h2>
          <p className="text-sm opacity-90">{cfg.desc}</p>
        </div>
      </div>

      {/* Booking Details Card */}
      <div className="bg-white dark:bg-navy-900 rounded-2xl shadow-lg p-6 relative border-t-4 border-navy-500 dark:border-navy-700 flex justify-between items-start">
        {/* Left: Ticket Info */}
        <div className="space-y-2 text-gray-700 dark:text-gray-300 flex-1 pr-4">
          <h3 className="text-xl font-semibold text-navy-700 dark:text-white flex items-center gap-2 mb-4">
            <Ticket size={20} /> Booking Details
          </h3>
          <p>
            <span className="font-medium">Booking ID:</span> {booking.id}
          </p>
          <p>
            <span className="font-medium">Movie:</span> {booking.movieTitle}
          </p>
          <p>
            <span className="font-medium">Hall:</span> {booking.hall}
          </p>
          <p>
            <span className="font-medium">Location:</span> {booking.location}
          </p>
          <p>
            <span className="font-medium">Showtime:</span> {booking.time}
          </p>
          <p>
            <span className="font-medium">Seats:</span>{" "}
            {Array.isArray(booking.seats) && booking.seats.length > 0
              ? booking.seats.join(", ")
              : "No seats"}
          </p>
          <hr className="my-2 border-gray-300 dark:border-gray-700" />
          <p className="text-lg font-semibold text-navy-700 dark:text-white">
            Total Amount: ₹{booking.amount || 0}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Booking Time: {booking.bookedAt || "-"}
          </p>
        </div>

        {/* Right: QR Code for Confirmed Bookings */}
        {effectiveStatus === "confirmed" && (
          <div className="flex flex-col items-center justify-center bg-gray-100 dark:bg-navy-800 rounded-xl p-4 shadow-inner">
            <QRCodeCanvas
              value={`BookingID: ${booking.id}\nMovie: ${
                booking.movieTitle
              }\nSeats: ${booking.seats.join(", ")}\nShowtime: ${booking.time}`}
              size={120}
              bgColor="#FFFFFF"
              fgColor="#000000"
              level="H"
              includeMargin={true}
            />
            <p className="text-xs mt-2 text-gray-500 dark:text-gray-400">
              Scan for details
            </p>
          </div>
        )}
      </div>

      {/* CTA Buttons */}
      <div className="flex justify-between mt-8">
        <Link
          to="/"
          className="px-6 py-2.5 rounded-xl font-medium transition bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-navy-800 dark:text-gray-200 dark:hover:bg-navy-700 shadow"
        >
          <ArrowLeft size={16} className="inline mr-2" /> Home
        </Link>
        <Link
          to="/profile"
          className="px-6 py-2.5 rounded-xl font-medium transition bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md hover:shadow-lg hover:scale-105"
        >
          View My Bookings
        </Link>
      </div>
    </div>
  );
}
