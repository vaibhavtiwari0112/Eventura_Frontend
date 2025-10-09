import React from "react";
import { motion } from "framer-motion";
import { Film, Star, X } from "lucide-react";
import { Link } from "react-router-dom";
import Overlay from "../Overlay";

export default function MovieDetailOverlay({ movie, onClose }) {
  if (!movie) return null;

  return (
    <Overlay>
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="relative bg-white dark:bg-navy-900 rounded-2xl shadow-2xl 
                   w-full max-w-4xl mx-4 overflow-hidden flex flex-col md:flex-row"
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-white/30 dark:bg-white/20 rounded-full 
                     backdrop-blur-md hover:bg-white/50 dark:hover:bg-white/30 transition"
          aria-label="Close"
        >
          <X className="w-5 h-5 text-gray-800 dark:text-white" />
        </button>

        {/* Poster */}
        <div className="md:w-1/2 bg-gray-100 dark:bg-navy-800 flex items-center justify-center">
          {movie.posterUrl ? (
            <img
              src={movie.posterUrl}
              alt={movie.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <Film className="text-gray-400 dark:text-gray-500 w-16 h-16" />
          )}
        </div>

        {/* Details */}
        <div className="p-6 md:w-1/2 flex flex-col justify-between">
          <div>
            <h2 className="text-2xl font-bold text-navy-700 dark:text-white mb-3">
              {movie.title}
            </h2>

            <p className="text-gray-700 dark:text-gray-300 mb-4">
              {movie.description || "No description available for this movie."}
            </p>

            {/* Rating */}
            <div className="flex items-center mb-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Star
                  key={i}
                  className="w-5 h-5 text-yellow-400 fill-yellow-400"
                />
              ))}
              {movie.rating && (
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  {movie.rating.toFixed(1)} / 5
                </span>
              )}
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-400">
              {movie.genres?.join(", ") || "Genre"} • {movie.duration || "120"}{" "}
              mins
            </p>
          </div>

          <div className="mt-6">
            <Link
              to={`/movie/${movie.id}/${encodeURIComponent(movie.title)}/shows`}
              className="block w-full text-center px-4 py-3 text-sm font-medium rounded-xl 
                         bg-gradient-to-r from-navy-600 to-navy-800 text-white shadow-md
                         hover:from-navy-500 hover:to-navy-700 
                         dark:from-navy-700 dark:to-navy-900 dark:hover:from-navy-600 dark:hover:to-navy-800 
                         transition-all"
              onClick={onClose}
            >
              View Shows
            </Link>
          </div>
        </div>
      </motion.div>
    </Overlay>
  );
}
