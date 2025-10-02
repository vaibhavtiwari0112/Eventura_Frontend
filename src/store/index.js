import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import moviesReducer from "./slices/moviesSlice";
import bookingReducer from "./slices/bookingSlice";
import showReducer from "./slices/showSlice";

export default configureStore({
  reducer: {
    auth: authReducer,
    movies: moviesReducer,
    booking: bookingReducer,
    shows: showReducer,
  },
});
