import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { FiLogOut, FiSearch } from "react-icons/fi";
import { logout } from "../store/slices/authSlice";
import DarkModeToggle from "../helper/DarkModeToggel";

export default function Navbar() {
  const user = useSelector((s) => s.auth.user);
  const dispatch = useDispatch();
  const nav = useNavigate();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);

  const handleLogout = () => {
    dispatch(logout());
    nav("/login");
  };

  // Fetch autocomplete suggestions
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timeout = setTimeout(async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `${
            import.meta.env.VITE_AUTOCOMPLETE_API ||
            "https://eventura-search-service.vercel.app"
          }?q=${encodeURIComponent(query)}`
        );
        const data = await res.json();
        setResults(data?.suggestions || []); // ✅ correct mapping
      } catch (err) {
        console.error("Autocomplete error:", err);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timeout);
  }, [query]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      nav(`/search?query=${encodeURIComponent(query)}`);
      setShowDropdown(false);
      setQuery("");
    }
  };

  const handleSelectMovie = (title) => {
    nav(`/search?query=${encodeURIComponent(title)}`);
    setShowDropdown(false);
    setQuery("");
  };

  return (
    <nav className="bg-white dark:bg-navy-900 shadow-md transition-colors duration-300 relative">
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link
          to="/"
          className="text-2xl font-bold text-navy-700 dark:text-white hover:text-navy-900 dark:hover:text-gray-300 transition-colors"
        >
          Eventura
        </Link>

        {/* Center Search Bar */}
        <div className="relative flex-1 max-w-md mx-4 hidden sm:flex items-center">
          <form onSubmit={handleSearchSubmit} className="w-full relative">
            <FiSearch
              className="absolute left-3 top-2.5 text-gray-500 dark:text-gray-300"
              size={18}
            />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search movies..."
              onFocus={() => setShowDropdown(true)}
              className="w-full pl-9 pr-4 py-2 rounded-full border border-gray-300 dark:border-gray-700 
              bg-gray-50 dark:bg-navy-800 text-gray-800 dark:text-gray-100 
              focus:outline-none focus:ring-2 focus:ring-navy-500 transition-all"
            />
          </form>

          {/* Dropdown */}
          {showDropdown && query && results.length > 0 && (
            <div className="absolute top-11 left-0 w-full bg-white dark:bg-navy-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg max-h-64 overflow-y-auto z-50">
              {results.map((movie) => (
                <div
                  key={movie.id}
                  onClick={() => handleSelectMovie(movie.title)}
                  className="flex items-center gap-3 px-4 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-navy-700"
                >
                  <img
                    src={movie.poster_url}
                    alt={movie.title}
                    className="w-8 h-10 object-cover rounded"
                  />
                  <div>
                    <p className="text-gray-800 dark:text-gray-100 font-medium">
                      {movie.title}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {movie.genres} • ⭐ {movie.rating}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* No Results */}
          {showDropdown && query && !loading && results.length === 0 && (
            <div className="absolute top-11 left-0 w-full bg-white dark:bg-navy-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-md p-3 text-gray-600 dark:text-gray-300 text-sm">
              No results found.
            </div>
          )}
        </div>

        {/* Right side - Links, Auth, Dark Mode */}
        <div className="flex items-center space-x-6">
          <Link
            to="/"
            className="text-gray-700 dark:text-gray-200 font-medium hover:text-navy-700 dark:hover:text-gray-300"
          >
            Home
          </Link>
          <Link
            to="/profile"
            className="text-gray-700 dark:text-gray-200 font-medium hover:text-navy-700 dark:hover:text-gray-300"
          >
            Profile
          </Link>

          {user ? (
            <div className="flex items-center space-x-3">
              <span className="px-4 py-1.5 bg-navy-50 dark:bg-navy-800 text-navy-700 dark:text-gray-200 font-medium rounded-full border border-navy-200 dark:border-navy-700">
                {user.name}
              </span>
              <button
                onClick={handleLogout}
                className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 transition-colors"
                title="Logout"
              >
                <FiLogOut size={20} />
              </button>
            </div>
          ) : (
            <>
              <Link
                to="/login"
                className="text-gray-700 dark:text-gray-200 font-medium hover:text-navy-700 dark:hover:text-gray-300"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="text-gray-700 dark:text-gray-200 font-medium hover:text-navy-700 dark:hover:text-gray-300"
              >
                Signup
              </Link>
            </>
          )}

          <DarkModeToggle />
        </div>
      </div>
    </nav>
  );
}
