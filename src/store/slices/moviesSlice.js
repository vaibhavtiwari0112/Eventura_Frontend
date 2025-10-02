// src/store/slices/moviesSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { apiRequest } from "../../utils/api";
import { mapMovies } from "../../utils/movieMapper";

// Fetch all movies
export const fetchMovies = createAsyncThunk(
  "movies/fetchAll",
  async (_, { getState }) => {
    const token = getState().auth?.token || null;
    const res = await apiRequest("catalog/movies", "GET", null, token);
    return mapMovies(res);
  }
);

// Fetch single movie by ID
export const fetchMovieById = createAsyncThunk(
  "movies/fetchById",
  async (id, { getState }) => {
    const token = getState().auth?.token || null;
    const res = await apiRequest(`catalog/movies/${id}`, "GET", null, token);
    return mapMovies([res])[0]; // map single movie
  }
);

const moviesSlice = createSlice({
  name: "movies",
  initialState: {
    list: [],
    status: "idle", // idle | loading | succeeded | failed
    error: null,
    currentMovie: null,
    currentStatus: "idle", // separate loading for movie details
  },
  reducers: {
    clearCurrentMovie: (state) => {
      state.currentMovie = null;
      state.currentStatus = "idle";
    },
    setDummyMovies: (state, action) => {
      state.list = action.payload;
      state.status = "succeeded";
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all movies
      .addCase(fetchMovies.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchMovies.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.list = action.payload;
      })
      .addCase(fetchMovies.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })

      // Fetch movie by ID
      .addCase(fetchMovieById.pending, (state) => {
        state.currentStatus = "loading";
        state.error = null;
      })
      .addCase(fetchMovieById.fulfilled, (state, action) => {
        state.currentStatus = "succeeded";
        state.currentMovie = action.payload;
      })
      .addCase(fetchMovieById.rejected, (state, action) => {
        state.currentStatus = "failed";
        state.error = action.error.message;
      });
  },
});

export const { clearCurrentMovie, setDummyMovies } = moviesSlice.actions;
export default moviesSlice.reducer;
