import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchUserBookings } from "../store/slices/bookingSlice";
import {
  User,
  Mail,
  Ticket,
  ChevronDown,
  ChevronUp,
  Calendar,
  MapPin,
  Film,
} from "lucide-react";

export default function Profile() {
  const user = useSelector((s) => s.auth.user);
  const { bookings, loading } = useSelector((s) => s.booking);
  const dispatch = useDispatch();
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchUserBookings(user.id));
    }
  }, [dispatch, user]);

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const statusGradients = {
    confirmed: "bg-gradient-to-r from-green-600 to-green-700 text-white",
    cancelled: "bg-gradient-to-r from-red-600 to-red-700 text-white",
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

      {/* Account Details */}
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

        {loading ? (
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
                {/* Booking Summary Row */}
                <div
                  className="p-4 flex justify-between items-center cursor-pointer"
                  onClick={() => toggleExpand(h.id)}
                >
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {h.movieTitle || "Booking"} #{h.id}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {h.seats.length} seats — {h.seats.join(", ")}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold shadow-md ${
                        statusGradients[h.status] || statusGradients.default
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

                {/* Expanded Booking Details */}
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

                    <div className="border-t border-gray-300 dark:border-gray-700 pt-3">
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
                    </div>

                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      Booked at: {new Date(h.bookedAt).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
