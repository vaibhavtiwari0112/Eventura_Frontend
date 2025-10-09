import React, { useState } from "react";
import { Film } from "lucide-react";
import MovieDetailOverlay from "./common/MovieDetailOverlay";

export default function MovieCard({ movie }) {
  const [showOverlay, setShowOverlay] = useState(false);

  return (
    <>
      <div
        className="bg-white dark:bg-navy-900 rounded-2xl shadow-md hover:shadow-xl 
                   transition-transform transform hover:scale-105 duration-300 
                   w-56 overflow-hidden group border border-gray-200 dark:border-navy-700"
      >
        <div className="w-full h-72 bg-gray-100 dark:bg-navy-800 flex items-center justify-center relative">
          {movie.posterUrl ? (
            <img
              src={movie.posterUrl}
              alt={movie.title}
              className="w-full h-full object-cover group-hover:opacity-90 transition"
            />
          ) : (
            <Film className="text-gray-400 dark:text-gray-500 w-12 h-12" />
          )}
        </div>

        <div className="p-4">
          <h3 className="font-bold text-base text-navy-700 dark:text-white line-clamp-2">
            {movie.title}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
            {movie.genres?.join(", ") || "Genre"} • {movie.duration || "120"}m
          </p>

          <button
            onClick={() => setShowOverlay(true)}
            className="block w-full text-center px-4 py-2.5 text-sm font-medium rounded-xl 
                       bg-gradient-to-r from-navy-600 to-navy-800 text-white shadow-md
                       hover:from-navy-500 hover:to-navy-700 
                       dark:from-navy-700 dark:to-navy-900 dark:hover:from-navy-600 dark:hover:to-navy-800 
                       transition-all"
          >
            View
          </button>
        </div>
      </div>

      {showOverlay && (
        <MovieDetailOverlay
          movie={movie}
          onClose={() => setShowOverlay(false)}
        />
      )}
    </>
  );
}
