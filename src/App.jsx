import React from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import MovieDetails from "./pages/MovieDetails";
import Profile from "./pages/Profile";
import NotificationBanner from "./components/NotificationBanner";
import ProtectedRoute from "./components/ProtectedRoutes";
import Footer from "./components/Footer";
import ShowList from "./pages/ShowList";
import BookingStatusPage from "./pages/BookingStatusPage";

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-navy-900 transition-colors duration-300">
      <Navbar />
      <NotificationBanner />
      <main className="max-w-6xl mx-auto p-4">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/movie/:id/shows/:showId/book"
            element={<MovieDetails />}
          />
          <Route path="/movie/:id/:title/shows" element={<ShowList />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          <Route
            path="/booking/:id"
            element={
              <ProtectedRoute>
                <BookingStatusPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
