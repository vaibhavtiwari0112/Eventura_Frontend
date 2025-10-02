import React from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import { CheckCircle2, Ticket, ArrowLeft } from "lucide-react";

export default function BookingConfirmation() {
  const { id } = useParams();
  const location = useLocation();

  const booking = location.state?.booking;

  console.log("inside the confirmationbooking", booking);

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

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      {/* Success Banner */}
      <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-2xl p-6 flex items-center shadow-md mb-8">
        <CheckCircle2 size={32} className="mr-4" />
        <div>
          <h2 className="text-2xl font-bold">Booking Confirmed!</h2>
          <p className="text-sm opacity-90">
            Your seats are reserved successfully.
          </p>
        </div>
      </div>

      {/* Booking Ticket Card */}
      <div className="bg-white dark:bg-navy-900 rounded-2xl shadow-lg p-6 relative border-t-4 border-navy-500 dark:border-navy-700">
        <h3 className="text-xl font-semibold text-navy-700 dark:text-white flex items-center gap-2 mb-4">
          <Ticket size={20} /> Booking Details
        </h3>
        <div className="space-y-2 text-gray-700 dark:text-gray-300">
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
          <p>
            <span className="font-medium">Base Price:</span> ₹
            {booking.basePrice || 0}
          </p>
          <p>
            <span className="font-medium">GST (18%):</span> ₹{booking.gst || 0}
          </p>
          <p>
            <span className="font-medium">Entertainment Tax (5%):</span> ₹
            {booking.entertainmentTax || 0}
          </p>
          <p>
            <span className="font-medium">Convenience Fee:</span> ₹
            {booking.convenienceFee || 0}
          </p>
          <p className="text-lg font-semibold text-navy-700 dark:text-white">
            Total Paid: ₹{booking.amount || 0}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Booking Time: {booking.bookedAt || "-"}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Please show this confirmation at the theater entrance.
          </p>
        </div>
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
