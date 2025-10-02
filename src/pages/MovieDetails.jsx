// import React, { useState, useMemo, useEffect } from "react";
// import { useParams, useNavigate, useLocation } from "react-router-dom";
// import SeatSelector from "../components/SeatSelector";
// import PaymentModal from "../components/PaymentModal";
// import { useDispatch, useSelector } from "react-redux";
// import {
//   createPaymentOrder,
//   verifyPayment,
// } from "../store/slices/paymentSlice";
// import {
//   fetchSeatMap,
//   clearSeats,
//   fetchShowsByMovie,
// } from "../store/slices/showSlice";
// import {
//   lockSeats,
//   createBooking,
//   fetchSeatmap,
// } from "../store/slices/bookingSlice";
// import SuccessOverlay from "../components/common/SuccessOverlay";
// import ErrorOverlay from "../components/common/ErrorOverlay";

// export default function MovieDetails() {
//   const { id, showId } = useParams();
//   const location = useLocation();
//   const navigate = useNavigate();
//   const dispatch = useDispatch();

//   const storedAuth2 = JSON.parse(localStorage.getItem("auth"));
//   const currentUserObj = storedAuth2?.user || null;
//   const currentUserIdUUID =
//     currentUserObj?.id || currentUserObj?.email || "guest";

//   const { list: shows, status, error } = useSelector((s) => s.shows);
//   const { seatLayout, seatStatus, seatError } = useSelector((s) => s.shows);
//   const { bookedSeats, lockedSeats } = useSelector((s) => s.booking);

//   const [selected, setSelected] = useState([]);
//   const [payOpen, setPayOpen] = useState(false);

//   /** Overlay state per action */
//   const [overlay, setOverlay] = useState({
//     visible: false,
//     type: "success", // success | error
//     message: "",
//   });

//   /** Helper to show overlay */
//   const showOverlay = (type, message, duration = 2000) => {
//     setOverlay({ visible: true, type, message });
//     setTimeout(
//       () => setOverlay((prev) => ({ ...prev, visible: false })),
//       duration
//     );
//   };

//   /** ─────────── SHOWS ─────────── */
//   useEffect(() => {
//     if (status === "idle") {
//       dispatch(fetchShowsByMovie(id));
//     }
//   }, [dispatch, id, status]);

//   const showDetails = shows.find((s) => s.id === showId);

//   useEffect(() => {
//     if (showDetails && !showDetails.error) {
//       dispatch(
//         fetchSeatMap({
//           movieId: id,
//           hallId: showDetails.hallId,
//           showTime: showDetails.startTime,
//         })
//       );
//     }
//     return () => dispatch(clearSeats());
//   }, [dispatch, id, showDetails]);

//   /** ─────────── SEAT HANDLING ─────────── */
//   function handleSeatClick(seat) {
//     if (seat.status === "booked") return;
//     if (seat.lockedBy && seat.lockedBy !== currentUserIdUUID) return;

//     setSelected((prev) =>
//       prev.includes(seat.id)
//         ? prev.filter((s) => s !== seat.id)
//         : [...prev, seat.id]
//     );
//   }

//   async function handleLock() {
//     if (selected.length === 0) return;

//     try {
//       const payload = {
//         showId,
//         seatIds: selected,
//         userId: currentUserIdUUID,
//         hallId: showDetails?.hallId,
//       };
//       const resultAction = await dispatch(lockSeats(payload));

//       if (lockSeats.fulfilled.match(resultAction)) {
//         showOverlay("success", "✅ Seats locked successfully!");
//         setSelected([]);
//         dispatch(fetchSeatmap({ showId }));
//       } else {
//         const err = resultAction.payload || resultAction.error?.message;
//         showOverlay("error", "❌ Failed to lock seats: " + (err || ""));
//       }
//     } catch (err) {
//       showOverlay("error", "❌ Failed to lock seats.");
//     }
//   }

//   /** ─────────── PAYMENT ─────────── */
//   function loadRazorpayScript() {
//     return new Promise((resolve) => {
//       if (window.Razorpay) {
//         resolve(true);
//         return;
//       }
//       const script = document.createElement("script");
//       script.src = "https://checkout.razorpay.com/v1/checkout.js";
//       script.onload = () => resolve(true);
//       script.onerror = () => resolve(false);
//       document.body.appendChild(script);
//     });
//   }

//   async function handlePay(result) {
//     setPayOpen(false);
//     if (result.status !== "success") return;

//     try {
//       const isLoaded = await loadRazorpayScript();
//       if (!isLoaded || !window.Razorpay)
//         throw new Error("Razorpay SDK failed to load.");

//       const bookingAction = await dispatch(
//         createBooking({
//           userId: currentUserIdUUID,
//           showId,
//           seatIds: selected,
//           amount: result.breakdown.total,
//           hallId: showDetails?.hallId,
//           status: "PENDING",
//         })
//       );
//       if (!createBooking.fulfilled.match(bookingAction))
//         throw new Error("Booking creation failed");
//       const bookingId = bookingAction.payload;

//       const orderAction = await dispatch(
//         createPaymentOrder({
//           amount: result.breakdown.total,
//           receipt: bookingId,
//           notes: { bookingId, hallId: showDetails?.hallId },
//         })
//       );
//       if (!createPaymentOrder.fulfilled.match(orderAction))
//         throw new Error(orderAction.payload || "Order creation failed");

//       const orderData = orderAction.payload;

//       const options = {
//         key: orderData.key,
//         amount: orderData.order.amount,
//         currency: "INR",
//         name: "Eventura",
//         description: `Booking for ${showDetails.movieTitle}`,
//         order_id: orderData.order.id,
//         handler: async function (response) {
//           const verifyAction = await dispatch(
//             verifyPayment({
//               razorpay_order_id: response.razorpay_order_id,
//               razorpay_payment_id: response.razorpay_payment_id,
//               razorpay_signature: response.razorpay_signature,
//               paymentDocId: orderData.paymentId,
//               bookingId,
//               hallId: showDetails?.hallId,
//             })
//           );

//           if (
//             !verifyPayment.fulfilled.match(verifyAction) ||
//             !verifyAction.payload.success
//           ) {
//             showOverlay("error", "❌ Payment verification failed");
//             return;
//           }

//           const booking = {
//             id: bookingId,
//             movieTitle: showDetails.movieTitle,
//             hall: showDetails.hallName,
//             location: showDetails.location,
//             time: showDetails.time,
//             seats: selected,
//             amount: result.breakdown.total,
//             bookedAt: new Date().toISOString(),
//           };

//           setSelected([]);
//           showOverlay("success", "✅ Payment successful!");
//           setTimeout(
//             () => navigate(`/booking/${booking.id}`, { state: { booking } }),
//             1500
//           );
//         },
//         theme: { color: "#1e3a8a" },
//       };

//       const rzp = new window.Razorpay(options);
//       rzp.open();
//     } catch (err) {
//       showOverlay("error", "❌ Payment error: " + err.message);
//     }
//   }

//   /** ─────────── POLLING ─────────── */
//   useEffect(() => {
//     if (!showId) return;
//     const fetchSeats = () => dispatch(fetchSeatmap({ showId }));
//     fetchSeats();
//     const interval = setInterval(() => {
//       if (!document.hidden) fetchSeats();
//     }, 5000);
//     return () => clearInterval(interval);
//   }, [dispatch, showId]);

//   /** ─────────── ENRICHED SEATS ─────────── */
//   const enrichedLayout = useMemo(() => {
//     if (!seatLayout || seatLayout.length === 0) return [];

//     return seatLayout.map((row) =>
//       row.map((seat) => {
//         if (!seat) return null;
//         const isBooked = bookedSeats.includes(seat.id);
//         const isLocked = lockedSeats.includes(seat.id);
//         return {
//           ...seat,
//           status: isBooked ? "booked" : seat.status || "available",
//           lockedBy: isLocked ? "other" : null,
//         };
//       })
//     );
//   }, [seatLayout, bookedSeats, lockedSeats]);

//   /** ─────────── PRICE CALCULATION ─────────── */
//   const basePrice =
//     selected.length * ((showDetails && showDetails?.price) || 150);
//   const convenienceFee = selected.length > 0 ? 30 : 0;
//   const gst = Math.round((basePrice + convenienceFee) * 0.18);
//   const entertainmentTax = Math.round(basePrice * 0.05);
//   const finalAmount = basePrice + convenienceFee + gst + entertainmentTax;

//   /** ─────────── RENDER ─────────── */
//   if (status === "failed" || showDetails?.error) {
//     return (
//       <div className="max-w-lg mx-auto mt-12 p-6 rounded-xl bg-white dark:bg-navy-900 shadow-lg text-center">
//         <h2 className="text-xl font-bold text-red-600 dark:text-red-400">
//           Show not found
//         </h2>
//         <p className="mt-2 text-gray-600 dark:text-gray-300">
//           Please go back and select a valid show.
//         </p>
//         <button
//           onClick={() => navigate("/")}
//           className="mt-4 px-6 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
//         >
//           ⬅ Back to Home
//         </button>
//       </div>
//     );
//   }

//   if (status === "loading" || !showDetails) {
//     return (
//       <div className="flex justify-center items-center h-64 text-gray-500 dark:text-gray-300">
//         Loading show details...
//       </div>
//     );
//   }

//   return (
//     <>
//       <div className="max-w-7xl mx-auto px-6 py-8 grid md:grid-cols-3 gap-8">
//         {/* Left: Movie + Seat selection */}
//         <div className="md:col-span-2 bg-white dark:bg-navy-900 rounded-2xl shadow-lg p-6 transition-colors">
//           <h2 className="text-2xl font-bold text-navy-700 dark:text-white mb-2">
//             🎬 {showDetails.movieTitle}
//           </h2>
//           <p className="text-sm text-gray-600 dark:text-gray-300">
//             📍 {showDetails.hall}, {showDetails.location}
//           </p>
//           <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
//             🕒 {showDetails.time}
//           </p>

//           {seatStatus === "loading" && (
//             <p className="text-gray-500 dark:text-gray-300">Loading seats...</p>
//           )}
//           {seatStatus === "failed" && (
//             <div className="text-center">
//               <p className="text-red-500 dark:text-red-400">
//                 ❌ Failed to load seats: {seatError}
//               </p>
//               <button
//                 onClick={() => navigate("/")}
//                 className="mt-4 px-6 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
//               >
//                 ⬅ Back to Home
//               </button>
//             </div>
//           )}
//           {seatStatus === "succeeded" && (
//             <SeatSelector
//               layout={enrichedLayout}
//               selected={selected}
//               onSeatClick={handleSeatClick}
//               currentUserId={currentUserIdUUID}
//             />
//           )}

//           {/* Action buttons */}
//           <div className="mt-6 flex space-x-4">
//             <button
//               disabled={selected.length === 0}
//               onClick={() => setPayOpen(true)}
//               className={`px-6 py-2.5 rounded-xl font-medium transition ${
//                 selected.length === 0
//                   ? "bg-gray-400 text-gray-200 cursor-not-allowed"
//                   : "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md hover:shadow-lg hover:scale-105"
//               }`}
//             >
//               Pay Now ₹{finalAmount}
//             </button>

//             <button
//               disabled={selected.length === 0}
//               onClick={handleLock}
//               className={`px-6 py-2.5 rounded-xl font-medium transition ${
//                 selected.length === 0
//                   ? "bg-gray-400 text-gray-200 cursor-not-allowed"
//                   : "bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-md hover:shadow-lg hover:scale-105"
//               }`}
//             >
//               Lock Seats
//             </button>
//           </div>
//         </div>

//         {/* Right: Booking Summary */}
//         <div className="bg-white dark:bg-navy-900 rounded-2xl shadow-lg p-6 h-fit transition-colors">
//           <h3 className="text-lg font-semibold text-navy-700 dark:text-white mb-4">
//             📝 Booking Summary
//           </h3>

//           <p className="text-gray-700 dark:text-gray-300 mb-2">
//             <span className="font-medium">Seats:</span>{" "}
//             {selected.length > 0 ? selected.join(", ") : "None selected"}
//           </p>

//           <p className="text-gray-700 dark:text-gray-300 mb-2">
//             <span className="font-medium">Base Price:</span> ₹{basePrice}
//           </p>

//           <p className="text-gray-700 dark:text-gray-300 mb-2">
//             <span className="font-medium">GST (18%):</span> ₹{gst}
//           </p>

//           <p className="text-gray-700 dark:text-gray-300 mb-2">
//             <span className="font-medium">Entertainment Tax (5%):</span> ₹
//             {entertainmentTax}
//           </p>

//           <p className="text-gray-700 dark:text-gray-300 mb-2">
//             <span className="font-medium">Convenience Fee:</span> ₹
//             {convenienceFee}
//           </p>

//           <hr className="my-3 border-gray-300 dark:border-gray-700" />

//           <p className="text-lg font-semibold text-navy-700 dark:text-white">
//             Final Amount: ₹{finalAmount}
//           </p>

//           <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
//             Locked seats must be paid at least 4 hours before showtime.
//           </p>
//         </div>

//         <PaymentModal
//           open={payOpen}
//           onClose={() => setPayOpen(false)}
//           onPay={handlePay}
//           amount={basePrice}
//         />
//       </div>

//       {/* Overlays */}
//       {overlay.visible && overlay.type === "success" && (
//         <SuccessOverlay message={overlay.message} />
//       )}
//       {overlay.visible && overlay.type === "error" && (
//         <ErrorOverlay message={overlay.message} />
//       )}
//     </>
//   );
// }

import React, { useState, useMemo, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import SeatSelector from "../components/SeatSelector";
import PaymentModal from "../components/PaymentModal";
import { useDispatch, useSelector } from "react-redux";
import {
  createPaymentOrder,
  verifyPayment,
} from "../store/slices/paymentSlice";
import {
  fetchShowsByMovie,
  fetchSeatMap,
  clearSeats,
} from "../store/slices/showSlice";
import {
  lockSeats,
  createBooking,
  fetchSeatmap,
} from "../store/slices/bookingSlice";
import SuccessOverlay from "../components/common/SuccessOverlay";
import ErrorOverlay from "../components/common/ErrorOverlay";

export default function MovieDetails() {
  const { id, showId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  /** Current logged-in user */
  const storedAuth2 = JSON.parse(localStorage.getItem("auth"));
  const currentUserObj = storedAuth2?.user || null;
  const currentUserIdUUID =
    currentUserObj?.id || currentUserObj?.email || "guest";

  /** Redux state */
  const { list: shows, status, error } = useSelector((s) => s.shows);
  const { seatLayout, seatStatus, seatError } = useSelector((s) => s.shows);
  const { bookedSeats, lockedSeats } = useSelector((s) => s.booking);

  /** Local UI state */
  const [selected, setSelected] = useState([]);
  const [payOpen, setPayOpen] = useState(false);

  /** Overlay state per action */
  const [overlay, setOverlay] = useState({
    visible: false,
    type: "success", // success | error
    message: "",
  });

  /** Helper to show overlay */
  const showOverlay = (type, message, duration = 2000) => {
    setOverlay({ visible: true, type, message });
    setTimeout(
      () => setOverlay((prev) => ({ ...prev, visible: false })),
      duration
    );
  };

  /** ─────────── LOAD SHOWS ─────────── */
  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchShowsByMovie(id));
    }
  }, [dispatch, id, status]);

  const showDetails = shows.find((s) => s.id === showId);

  /** ─────────── LOAD INITIAL SEATMAP ─────────── */
  useEffect(() => {
    if (showDetails && !showDetails.error) {
      dispatch(
        fetchSeatMap({
          movieId: id,
          hallId: showDetails.hallId,
          showTime: showDetails.startTime,
        })
      );
      dispatch(fetchSeatmap({ showId })); // 🔥 fetch from Booking Service (Redis)
    }
    return () => dispatch(clearSeats());
  }, [dispatch, id, showDetails, showId]);

  /** ─────────── HANDLE SEAT CLICK ─────────── */
  function handleSeatClick(seat) {
    if (seat.status === "booked") return;
    if (seat.lockedBy && seat.lockedBy !== currentUserIdUUID) return;

    setSelected((prev) =>
      prev.includes(seat.id)
        ? prev.filter((s) => s !== seat.id)
        : [...prev, seat.id]
    );
  }

  /** ─────────── LOCK SEATS ─────────── */
  async function handleLock() {
    if (selected.length === 0) return;
    try {
      const payload = {
        showId,
        seatIds: selected,
        userId: currentUserIdUUID,
        hallId: showDetails?.hallId,
      };
      const resultAction = await dispatch(lockSeats(payload));

      if (lockSeats.fulfilled.match(resultAction)) {
        showOverlay("success", "✅ Seats locked successfully!");
        setSelected([]);
        dispatch(fetchSeatmap({ showId })); // refresh redis-backed seatmap
      } else {
        const err = resultAction.payload || resultAction.error?.message;
        showOverlay("error", "❌ Failed to lock seats: " + (err || ""));
      }
    } catch (err) {
      showOverlay("error", "❌ Failed to lock seats.");
    }
  }

  /** ─────────── RAZORPAY SCRIPT ─────────── */
  function loadRazorpayScript() {
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
  }

  /** ─────────── PAYMENT FLOW ─────────── */
  async function handlePay(result) {
    setPayOpen(false);
    if (result.status !== "success") return;

    try {
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded || !window.Razorpay)
        throw new Error("Razorpay SDK failed to load.");

      /** Step 1: Create booking (PENDING) */
      const bookingAction = await dispatch(
        createBooking({
          userId: currentUserIdUUID,
          showId,
          seatIds: selected,
          amount: result.breakdown.total,
          hallId: showDetails?.hallId,
          status: "PENDING",
        })
      );
      if (!createBooking.fulfilled.match(bookingAction))
        throw new Error("Booking creation failed");
      const bookingId = bookingAction.payload;

      /** Step 2: Create Razorpay order */
      const orderAction = await dispatch(
        createPaymentOrder({
          amount: result.breakdown.total,
          receipt: bookingId,
          notes: { bookingId, hallId: showDetails?.hallId },
        })
      );
      if (!createPaymentOrder.fulfilled.match(orderAction))
        throw new Error(orderAction.payload || "Order creation failed");

      const orderData = orderAction.payload;

      /** Step 3: Open Razorpay */
      const options = {
        key: orderData.key,
        amount: orderData.order.amount,
        currency: "INR",
        name: "Eventura",
        description: `Booking for ${showDetails.movieTitle}`,
        order_id: orderData.order.id,
        handler: async function (response) {
          const verifyAction = await dispatch(
            verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              paymentDocId: orderData.paymentId,
              bookingId,
              hallId: showDetails?.hallId,
            })
          );

          if (
            !verifyPayment.fulfilled.match(verifyAction) ||
            !verifyAction.payload.success
          ) {
            showOverlay("error", "❌ Payment verification failed");
            return;
          }

          /** Final booking object */
          const booking = {
            id: bookingId,
            movieTitle: showDetails.movieTitle,
            hall: showDetails.hallName,
            location: showDetails.location,
            time: showDetails.time,
            seats: selected,
            amount: result.breakdown.total,
            bookedAt: new Date().toISOString(),
          };

          setSelected([]);
          showOverlay("success", "✅ Payment successful!");
          setTimeout(
            () => navigate(`/booking/${booking.id}`, { state: { booking } }),
            1500
          );
        },
        theme: { color: "#1e3a8a" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      showOverlay("error", "❌ Payment error: " + err.message);
    }
  }

  /** ─────────── POLLING (every 5s) ─────────── */
  useEffect(() => {
    if (!showId) return;
    const fetchSeats = () => dispatch(fetchSeatmap({ showId }));
    fetchSeats();
    const interval = setInterval(() => {
      if (!document.hidden) fetchSeats();
    }, 5000);
    return () => clearInterval(interval);
  }, [dispatch, showId]);

  /** ─────────── ENRICHED SEATS ─────────── */
  const enrichedLayout = useMemo(() => {
    if (!seatLayout || seatLayout.length === 0) return [];

    return seatLayout.map((row) =>
      row.map((seat) => {
        if (!seat) return null;
        const isBooked = bookedSeats.includes(seat.id);
        const isLocked = lockedSeats.includes(seat.id);
        return {
          ...seat,
          status: isBooked ? "booked" : seat.status || "available",
          lockedBy: isLocked ? "other" : null,
        };
      })
    );
  }, [seatLayout, bookedSeats, lockedSeats]);

  /** ─────────── PRICE CALCULATION ─────────── */
  const basePrice =
    selected.length * ((showDetails && showDetails?.price) || 150);
  const convenienceFee = selected.length > 0 ? 30 : 0;
  const gst = Math.round((basePrice + convenienceFee) * 0.18);
  const entertainmentTax = Math.round(basePrice * 0.05);
  const finalAmount = basePrice + convenienceFee + gst + entertainmentTax;

  /** ─────────── RENDER ─────────── */
  if (status === "failed" || showDetails?.error) {
    return (
      <div className="max-w-lg mx-auto mt-12 p-6 rounded-xl bg-white dark:bg-navy-900 shadow-lg text-center">
        <h2 className="text-xl font-bold text-red-600 dark:text-red-400">
          Show not found
        </h2>
        <p className="mt-2 text-gray-600 dark:text-gray-300">
          Please go back and select a valid show.
        </p>
        <button
          onClick={() => navigate("/")}
          className="mt-4 px-6 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
        >
          ⬅ Back to Home
        </button>
      </div>
    );
  }

  if (status === "loading" || !showDetails) {
    return (
      <div className="flex justify-center items-center h-64 text-gray-500 dark:text-gray-300">
        Loading show details...
      </div>
    );
  }

  return (
    <>
      <div className="max-w-7xl mx-auto px-6 py-8 grid md:grid-cols-3 gap-8">
        {/* Left: Movie + Seat selection */}
        <div className="md:col-span-2 bg-white dark:bg-navy-900 rounded-2xl shadow-lg p-6 transition-colors">
          <h2 className="text-2xl font-bold text-navy-700 dark:text-white mb-2">
            🎬 {showDetails.movieTitle}
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            📍 {showDetails.hall}, {showDetails.location}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
            🕒 {showDetails.time}
          </p>

          {seatStatus === "loading" && (
            <p className="text-gray-500 dark:text-gray-300">Loading seats...</p>
          )}
          {seatStatus === "failed" && (
            <div className="text-center">
              <p className="text-red-500 dark:text-red-400">
                ❌ Failed to load seats: {seatError}
              </p>
              <button
                onClick={() => navigate("/")}
                className="mt-4 px-6 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
              >
                ⬅ Back to Home
              </button>
            </div>
          )}
          {seatStatus === "succeeded" && (
            <SeatSelector
              layout={enrichedLayout}
              selected={selected}
              onSeatClick={handleSeatClick}
              currentUserId={currentUserIdUUID}
            />
          )}

          {/* Action buttons */}
          <div className="mt-6 flex space-x-4">
            <button
              disabled={selected.length === 0}
              onClick={() => setPayOpen(true)}
              className={`px-6 py-2.5 rounded-xl font-medium transition ${
                selected.length === 0
                  ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                  : "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md hover:shadow-lg hover:scale-105"
              }`}
            >
              Pay Now ₹{finalAmount}
            </button>

            <button
              disabled={selected.length === 0}
              onClick={handleLock}
              className={`px-6 py-2.5 rounded-xl font-medium transition ${
                selected.length === 0
                  ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                  : "bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-md hover:shadow-lg hover:scale-105"
              }`}
            >
              Lock Seats
            </button>
          </div>
        </div>

        {/* Right: Booking Summary */}
        <div className="bg-white dark:bg-navy-900 rounded-2xl shadow-lg p-6 h-fit transition-colors">
          <h3 className="text-lg font-semibold text-navy-700 dark:text-white mb-4">
            📝 Booking Summary
          </h3>

          <p className="text-gray-700 dark:text-gray-300 mb-2">
            <span className="font-medium">Seats:</span>{" "}
            {selected.length > 0 ? selected.join(", ") : "None selected"}
          </p>

          <p className="text-gray-700 dark:text-gray-300 mb-2">
            <span className="font-medium">Base Price:</span> ₹{basePrice}
          </p>

          <p className="text-gray-700 dark:text-gray-300 mb-2">
            <span className="font-medium">GST (18%):</span> ₹{gst}
          </p>

          <p className="text-gray-700 dark:text-gray-300 mb-2">
            <span className="font-medium">Entertainment Tax (5%):</span> ₹
            {entertainmentTax}
          </p>

          <p className="text-gray-700 dark:text-gray-300 mb-2">
            <span className="font-medium">Convenience Fee:</span> ₹
            {convenienceFee}
          </p>

          <hr className="my-3 border-gray-300 dark:border-gray-700" />

          <p className="text-lg font-semibold text-navy-700 dark:text-white">
            Final Amount: ₹{finalAmount}
          </p>

          <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
            Locked seats must be paid at least 4 hours before showtime.
          </p>
        </div>

        <PaymentModal
          open={payOpen}
          onClose={() => setPayOpen(false)}
          onPay={handlePay}
          amount={basePrice}
        />
      </div>

      {/* Overlays */}
      {overlay.visible && overlay.type === "success" && (
        <SuccessOverlay message={overlay.message} />
      )}
      {overlay.visible && overlay.type === "error" && (
        <ErrorOverlay message={overlay.message} />
      )}
    </>
  );
}
