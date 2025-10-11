// store/slices/bookingSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { apiRequest } from "../../utils/api";

// ------------------- Thunks -------------------

export const lockSeats = createAsyncThunk(
  "booking/lockSeats",
  async (
    { showId, seatIds, userId, hallId },
    { getState, rejectWithValue }
  ) => {
    try {
      const token = getState().auth?.token || null;
      const res = await apiRequest(
        "bookings/lock",
        "POST",
        { showId, seatIds, userId, hallId },
        token
      );
      return res.data ?? res;
    } catch (err) {
      return rejectWithValue(err.message || "Failed to lock seats");
    }
  }
);

// Create booking
export const createBooking = createAsyncThunk(
  "booking/create",
  async (
    { userId, showId, seatIds, amount, hallId, paymentId },
    { getState, rejectWithValue }
  ) => {
    try {
      const token = getState().auth?.token || null;
      const res = await apiRequest(
        "bookings",
        "POST",
        { userId, showId, seatIds, amount, hallId, paymentId },
        token
      );
      console.log("createBooking Response:", res);
      return res.data ?? res;
    } catch (err) {
      return rejectWithValue(err.message || "Failed to create booking");
    }
  }
);

// Fetch full seatmap
export const fetchSeatmap = createAsyncThunk(
  "booking/fetchSeatmap",
  async ({ showId }, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth?.token || null;
      const res = await apiRequest(
        `shows/${showId}/seatmap`,
        "GET",
        null,
        token
      );
      return res.data ?? res;
    } catch (err) {
      return rejectWithValue(err.message || "Failed to fetch seatmap");
    }
  }
);

// Fetch all bookings for a user
export const fetchUserBookings = createAsyncThunk(
  "booking/fetchUserBookings",
  async (userId, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth?.token || null;
      const res = await apiRequest(
        `bookings/user/${userId}`,
        "GET",
        null,
        token
      );
      const data = res.data ?? res;

      return data.map((b) => {
        const gstRate = 0.18;
        const entertainmentRate = 0.05;
        const convenienceFee = 30;

        let basePrice = Math.round(
          b.totalAmount / (1 + gstRate + entertainmentRate) - convenienceFee
        );
        let gst = Math.round((basePrice + convenienceFee) * gstRate);
        let entertainmentTax = Math.round(basePrice * entertainmentRate);

        let calculatedTotal =
          basePrice + gst + entertainmentTax + convenienceFee;
        if (calculatedTotal !== b.totalAmount) {
          const diff = b.totalAmount - calculatedTotal;
          basePrice += diff;
          gst = Math.round((basePrice + convenienceFee) * gstRate);
          entertainmentTax = Math.round(basePrice * entertainmentRate);
          calculatedTotal = basePrice + gst + entertainmentTax + convenienceFee;
        }

        const bookedAtIST = new Date(b.createdAt || Date.now()).toLocaleString(
          "en-IN",
          {
            timeZone: "Asia/Kolkata",
            hour12: false,
          }
        );

        const timeIST = b.time
          ? new Date(b.time).toLocaleString("en-IN", {
              timeZone: "Asia/Kolkata",
              hour12: false,
            })
          : "-";

        return {
          id: b.id,
          movieTitle: b.movieTitle || "Unknown",
          hall: b.hallName || "Hall",
          location: b.location || "-",
          time: timeIST,
          seats: b.seatIds || [],
          basePrice,
          gst,
          entertainmentTax,
          convenienceFee,
          amount: b.totalAmount,
          status: b.status ? b.status.toLowerCase() : "pending",
          bookedAt: bookedAtIST,
        };
      });
    } catch (err) {
      return rejectWithValue(err.message || "Failed to fetch bookings");
    }
  }
);

// Fetch booking status by ID
export const fetchBookingStatus = createAsyncThunk(
  "booking/fetchStatus",
  async (bookingId, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth?.token || null;
      const res = await apiRequest(
        `bookings/${bookingId}/status`,
        "GET",
        null,
        token
      );
      console.log("user bookings data ", res);
      return res.data ?? res; // { id, status }
    } catch (err) {
      return rejectWithValue(err.message || "Failed to fetch booking status");
    }
  }
);

// ------------------- Slice -------------------
const bookingSlice = createSlice({
  name: "booking",
  initialState: {
    currentBooking: null,
    history: [],
    bookings: [],
    loading: false,
    lockStatus: "idle",
    createStatus: "idle",
    lockedSeats: [],
    bookedSeats: [],
    availableSeats: [],
    hallSeats: [],
    error: null,
    statusById: {}, // store latest status of bookings
  },
  reducers: {
    addHistory: (state, action) => {
      state.history.unshift(action.payload);
    },
    setCurrent: (state, action) => {
      state.currentBooking = action.payload;
    },
    clearCurrent: (state) => {
      state.currentBooking = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Lock seats
      .addCase(lockSeats.pending, (s) => {
        s.lockStatus = "loading";
        s.error = null;
      })
      .addCase(lockSeats.fulfilled, (s, action) => {
        s.lockStatus = "succeeded";
        s.lockedSeats = action.payload || s.lockedSeats;
      })
      .addCase(lockSeats.rejected, (s, action) => {
        s.lockStatus = "failed";
        s.error = action.payload || action.error.message;
      })

      // Create booking
      .addCase(createBooking.pending, (s) => {
        s.createStatus = "loading";
        s.error = null;
      })
      .addCase(createBooking.fulfilled, (s, action) => {
        s.createStatus = "succeeded";
        s.currentBooking = action.payload;
      })
      .addCase(createBooking.rejected, (s, action) => {
        s.createStatus = "failed";
        s.error = action.payload || action.error.message;
      })

      // Fetch seatmap
      .addCase(fetchSeatmap.fulfilled, (s, action) => {
        s.hallSeats = action.payload.hallSeats || [];
        s.lockedSeats = action.payload.lockedSeats || [];
        s.bookedSeats = action.payload.bookedSeats || [];
        s.availableSeats = action.payload.availableSeats || [];
      })

      // Fetch user bookings
      .addCase(fetchUserBookings.pending, (s) => {
        s.loading = true;
      })
      .addCase(fetchUserBookings.fulfilled, (s, action) => {
        s.loading = false;
        s.bookings = action.payload;
      })
      .addCase(fetchUserBookings.rejected, (s, action) => {
        s.loading = false;
        s.error = action.payload || action.error.message;
      })

      // Fetch booking status
      .addCase(fetchBookingStatus.fulfilled, (s, action) => {
        const { id, status } = action.payload;
        s.statusById[id] = status.toLowerCase();
      })
      .addCase(fetchBookingStatus.rejected, (s, action) => {
        s.error = action.payload || action.error.message;
      });
  },
});

export const { addHistory, setCurrent, clearCurrent } = bookingSlice.actions;
export default bookingSlice.reducer;
