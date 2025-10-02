import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { apiRequest } from "../../utils/api";

// Fetch shows for a movie
export const fetchShowsByMovie = createAsyncThunk(
  "shows/fetchByMovie",
  async (movieId, { getState }) => {
    const token = getState().auth?.token || null;
    const res = await apiRequest(`shows/movie/${movieId}`, "GET", null, token);

    return res.map((s) => {
      // Format time nicely (example: "21 Sep 2025, 7:30 PM")
      const startTime = new Date(s.startTime);
      const formattedTime = startTime.toLocaleString("en-IN", {
        weekday: "short",
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });

      return {
        id: s.showId,
        startTime: s.startTime,
        endTime: s.endTime,
        price: s.basePrice,

        hallId: s.hall?.id || undefined,
        hallName: s.hall?.name || "Unknown Screen",

        theatreName: s.theatre?.name || "Unknown Theatre",
        theatreCity: s.theatre?.city || "",
        theatreAddress: s.theatre?.address || "",

        // ✅ Added fields
        movieTitle: s.movieTitle || "Untitled Movie",
        time: formattedTime,
      };
    });
  }
);

// Fetch seatmap for a specific show
export const fetchSeatMap = createAsyncThunk(
  "shows/fetchSeatMap",
  async ({ movieId, hallId, showTime }, { getState }) => {
    const token = getState().auth?.token || null;
    const res = await apiRequest(
      `shows/seatmap?movieId=${movieId}&hallId=${hallId}&showTime=${encodeURIComponent(
        showTime
      )}`,
      "GET",
      null,
      token
    );

    const { availableSeats, bookedSeats } = res;

    const rows = "ABCDEFGHI"; // 9 rows
    const cols = 9;

    return rows.split("").map((row) =>
      Array.from({ length: cols }).map((_, c) => {
        const id = `${row}${c + 1}`;
        return {
          id,
          label: id,
          status: bookedSeats.includes(id) ? "booked" : "available",
          lockedBy: null,
          lockExpiresAt: null,
        };
      })
    );
  }
);

const showsSlice = createSlice({
  name: "shows",
  initialState: {
    list: [],
    status: "idle",
    error: null,
    seatLayout: [],
    seatStatus: "idle",
    seatError: null,
  },
  reducers: {
    clearShows: (state) => {
      state.list = [];
      state.status = "idle";
      state.error = null;
    },
    clearSeats: (state) => {
      state.seatLayout = [];
      state.seatStatus = "idle";
      state.seatError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // shows
      .addCase(fetchShowsByMovie.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchShowsByMovie.fulfilled, (state, action) => {
        state.status = "succeeded";

        state.list = action.payload.map((s) => {
          const mapped = {
            id: s.id,
            startTime: s.startTime,
            endTime: s.endTime,
            price: s.price,
            hallName: s.hallName,
            theatreName: s.theatreName,
            hallId: s.hallId,
            movieTitle: s.movieTitle || "Untitled Movie",
            time: s.time,
            location: `${s.theatreAddress}, ${s.theatreCity}`,
          };

          return mapped;
        });
      })
      .addCase(fetchShowsByMovie.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })

      // seats
      .addCase(fetchSeatMap.pending, (state) => {
        state.seatStatus = "loading";
        state.seatError = null;
      })
      .addCase(fetchSeatMap.fulfilled, (state, action) => {
        state.seatStatus = "succeeded";
        state.seatLayout = action.payload;
      })
      .addCase(fetchSeatMap.rejected, (state, action) => {
        state.seatStatus = "failed";
        state.seatError = action.error.message;
      });
  },
});

export const { clearShows, clearSeats } = showsSlice.actions;

export default showsSlice.reducer;
