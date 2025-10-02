import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import MovieCard from "../components/MovieCard";
import { fetchMovies } from "../store/slices/moviesSlice";
import LoadingOverlay from "../components/common/LoadingOverlay";
import SuccessOverlay from "../components/common/SuccessOverlay";
import ErrorOverlay from "../components/common/ErrorOverlay";

const genres = [
  "Action",
  "Romance",
  "Thriller",
  "Animation",
  "Adventure",
  "Comedy",
  "Horror",
  "Sci-Fi",
  "Drama",
];

function GenreCarousel({ title, movies }) {
  const scrollRef = useRef(null);
  const resumeTimerRef = useRef(null);
  const [isPaused, setIsPaused] = useState(false);

  // auto-scroll loop
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const stepPx = 1;
    const timer = setInterval(() => {
      if (isPaused) return;
      container.scrollLeft += stepPx;
      if (container.scrollLeft >= container.scrollWidth / 2) {
        container.scrollLeft = 0;
      }
    }, 15);

    return () => clearInterval(timer);
  }, [isPaused]);

  function manualScroll(dir = 1) {
    const container = scrollRef.current;
    if (!container) return;
    setIsPaused(true);
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);

    const amount = Math.round(container.clientWidth * 0.5) || 300;
    container.scrollBy({ left: dir * amount, behavior: "smooth" });

    resumeTimerRef.current = setTimeout(() => {
      setIsPaused(false);
      resumeTimerRef.current = null;
    }, 1500);
  }

  return (
    <div className="mb-12">
      {/* Genre Header */}
      <h2 className="text-2xl font-semibold text-navy-700 dark:text-white mb-4">
        {title}
      </h2>

      <div className="relative">
        {/* left gradient */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-white/90 dark:from-navy-900/70 to-transparent z-10" />
        {/* right gradient */}
        <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-white/90 dark:from-navy-900/70 to-transparent z-10" />

        {/* left arrow */}
        {movies.length > 3 && (
          <button
            onClick={() => manualScroll(-1)}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => {
              if (!resumeTimerRef.current) setIsPaused(false);
            }}
            aria-label="Scroll left"
            className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 z-20
                     flex items-center justify-center h-12 w-12 rounded-full
                     shadow-lg bg-white/90 dark:bg-navy-800/70 text-navy-700 dark:text-white"
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
        )}
        {/* right arrow */}
        {movies.length > 3 && (
          <button
            onClick={() => manualScroll(1)}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => {
              if (!resumeTimerRef.current) setIsPaused(false);
            }}
            aria-label="Scroll right"
            className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 z-20
                     flex items-center justify-center h-12 w-12 rounded-full
                     shadow-lg bg-white/90 dark:bg-navy-800/70 text-navy-700 dark:text-white"
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
        )}
        {/* scrollable row */}
        <div
          ref={scrollRef}
          className="flex overflow-x-scroll no-scrollbar space-x-6 relative py-4"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => {
            if (!resumeTimerRef.current) setIsPaused(false);
          }}
        >
          {movies.map((m, i) => (
            <div
              key={m.id + "-" + i}
              className="shrink-0 w-1/3 max-w-sm transition-transform duration-300 transform hover:scale-105"
            >
              <MovieCard movie={m} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const dispatch = useDispatch();
  const { list: movies, status, error } = useSelector((s) => s.movies);

  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchMovies());
    }
  }, [dispatch, status]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-navy-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Main Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-navy-700 dark:text-white">
            Now Showing
          </h1>
          <div className="w-20 h-1 bg-navy-500 dark:bg-navy-400 mt-2 rounded"></div>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Book tickets for the latest movies in theaters now
          </p>
        </div>

        {genres.map((g) => {
          const genreMovies = movies.filter((m) => m.genres?.includes(g));
          if (genreMovies.length === 0) return null;
          return <GenreCarousel key={g} title={g} movies={genreMovies} />;
        })}
      </div>

      {/* Overlays */}
      {status === "loading" && <LoadingOverlay />}
      {status === "succeeded" && <SuccessOverlay message="Movies loaded!" />}
      {status === "failed" && (
        <ErrorOverlay message={error || "Failed to load movies"} />
      )}
    </div>
  );
}
