import React, { useEffect, useRef, useState } from "react";
import MovieCard from "../components/MovieCard";
import LoadingOverlay from "../components/common/LoadingOverlay";
import ErrorOverlay from "../components/common/ErrorOverlay";
import SuccessOverlay from "../components/common/SuccessOverlay";
import { useLocation } from "react-router-dom";

// ---------- Scrollable Genre Row ----------
function ScrollRow({ title, movies }) {
  const scrollRef = useRef(null);
  const [isPaused, setIsPaused] = useState(false);
  const resumeTimerRef = useRef(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const step = 1;
    const timer = setInterval(() => {
      if (isPaused) return;
      el.scrollLeft += step;
      if (el.scrollLeft >= el.scrollWidth / 2) el.scrollLeft = 0;
    }, 15);
    return () => clearInterval(timer);
  }, [isPaused]);

  const scrollManual = (dir = 1) => {
    const el = scrollRef.current;
    if (!el) return;
    setIsPaused(true);
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    const dist = Math.round(el.clientWidth * 0.5) || 300;
    el.scrollBy({ left: dir * dist, behavior: "smooth" });
    resumeTimerRef.current = setTimeout(() => setIsPaused(false), 1500);
  };

  if (movies.length === 0) return null;

  return (
    <div className="mb-12">
      <h2 className="text-2xl font-semibold text-navy-700 dark:text-white mb-4">
        {title}
      </h2>

      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-white/90 dark:from-navy-900/70 to-transparent z-10" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-white/90 dark:from-navy-900/70 to-transparent z-10" />

        {movies.length > 3 && (
          <>
            <button
              onClick={() => scrollManual(-1)}
              className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center h-12 w-12 rounded-full shadow-lg bg-white/90 dark:bg-navy-800/70 text-navy-700 dark:text-white"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>

            <button
              onClick={() => scrollManual(1)}
              className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center h-12 w-12 rounded-full shadow-lg bg-white/90 dark:bg-navy-800/70 text-navy-700 dark:text-white"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </>
        )}

        {/* Movie cards */}
        <div
          ref={scrollRef}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          className="flex overflow-x-scroll no-scrollbar space-x-6 relative py-4"
        >
          {movies.map((m, i) => (
            <div
              key={m.id + "-" + i}
              className="shrink-0 w-1/3 max-w-sm hover:scale-105 transition-transform duration-300"
            >
              <MovieCard movie={m} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---------- Main Search Page ----------
export default function SearchPage() {
  const { search } = useLocation();
  const query = new URLSearchParams(search).get("query") || "";
  const [results, setResults] = useState([]);
  const [status, setStatus] = useState("idle");

  useEffect(() => {
    if (!query) return;

    const fetchData = async () => {
      try {
        setStatus("loading");
        const res = await fetch(
          `${
            import.meta.env.VITE_AUTOCOMPLETE_API ||
            "https://eventura-search-service.vercel.app"
          }/autocomplete?q=${encodeURIComponent(query)}`
        );
        const data = await res.json();

        // ✅ Normalize data
        const normalized = (data?.suggestions || []).map((movie) => ({
          ...movie,
          genres: Array.isArray(movie.genres)
            ? movie.genres
            : movie.genres
            ? [movie.genres]
            : ["Other"],
          rating: Number(movie.rating) || 0,
          posterUrl:
            movie.poster_url ||
            "https://via.placeholder.com/300x450?text=No+Poster", // <--- map here
        }));

        setResults(normalized);
        setStatus("succeeded");
      } catch (err) {
        console.error(err);
        setStatus("failed");
      }
    };

    fetchData();
  }, [query]);

  // Group by genre
  const grouped = results.reduce((acc, movie) => {
    const genre = movie.genres?.[0] || "Other";
    if (!acc[genre]) acc[genre] = [];
    acc[genre].push(movie);
    return acc;
  }, {});

  // ✅ Merge small groups (less than 3 movies) into a combined row
  const finalGroups = {};
  const mixed = [];

  Object.entries(grouped).forEach(([genre, movies]) => {
    if (movies.length < 3) mixed.push(...movies);
    else finalGroups[genre] = movies;
  });

  if (mixed.length > 0) {
    finalGroups["All Results (Mixed Genres)"] = mixed;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-navy-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-navy-700 dark:text-white">
            Search Results for: "{query}"
          </h1>
          <div className="w-20 h-1 bg-navy-500 dark:bg-navy-400 mt-2 rounded"></div>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Found {results.length} matching movies
          </p>
        </div>

        {/* Grouped scroll rows */}
        {Object.entries(finalGroups).length > 0 ? (
          Object.entries(finalGroups).map(([genre, movies]) => (
            <ScrollRow key={genre} title={genre} movies={movies} />
          ))
        ) : (
          <p className="text-gray-600 dark:text-gray-300">No movies found.</p>
        )}
      </div>

      {/* Status Overlays */}
      {status === "loading" && <LoadingOverlay />}
      {status === "succeeded" && <SuccessOverlay message="Search completed!" />}
      {status === "failed" && (
        <ErrorOverlay message="Failed to load search results." />
      )}
    </div>
  );
}
