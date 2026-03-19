import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { FiLogOut, FiSearch, FiX, FiMenu } from "react-icons/fi";
import { logout } from "../store/slices/authSlice";
import DarkModeToggle from "../helper/DarkModeToggel"; // ✅ Fixed typo: Toggel → Toggle

const AUTOCOMPLETE_URL =
  import.meta.env.VITE_AUTOCOMPLETE_API ||
  "https://eventura-search-service.vercel.app";

export default function Navbar() {
  const user = useSelector((s) => s.auth.user);
  const dispatch = useDispatch();
  const nav = useNavigate();
  const location = useLocation();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1); // ✅ keyboard nav
  const [mobileSearch, setMobileSearch] = useState(false); // ✅ mobile search panel
  const [mobileMenu, setMobileMenu] = useState(false); // ✅ mobile nav menu

  const inputRef = useRef(null);
  const searchRef = useRef(null);
  const abortRef = useRef(null); // ✅ cancel in-flight fetch on new keystroke

  // ✅ Clear query on route change
  useEffect(() => {
    setQuery("");
    setResults([]);
    setShowDropdown(false);
    setMobileSearch(false);
    setMobileMenu(false);
  }, [location.pathname]);

  // ✅ Close dropdown on outside click or Escape
  useEffect(() => {
    const onClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowDropdown(false);
        setActiveIndex(-1);
      }
    };
    const onEsc = (e) => {
      if (e.key === "Escape") {
        setShowDropdown(false);
        setActiveIndex(-1);
        setMobileSearch(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onEsc);
    };
  }, []);

  // ✅ Focus input when mobile search opens
  useEffect(() => {
    if (mobileSearch && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [mobileSearch]);

  // ✅ Debounced autocomplete with abort controller to cancel stale requests
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setShowDropdown(false);
      return;
    }

    const timeout = setTimeout(async () => {
      // Cancel previous in-flight request
      if (abortRef.current) abortRef.current.abort();
      abortRef.current = new AbortController();

      try {
        setLoading(true);
        const res = await fetch(
          `${AUTOCOMPLETE_URL}/autocomplete?q=${encodeURIComponent(query)}`,
          { signal: abortRef.current.signal },
        );
        const data = await res.json();
        setResults(data?.suggestions || []);
        setShowDropdown(true);
        setActiveIndex(-1);
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("Autocomplete error:", err);
          setResults([]);
        }
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timeout);
  }, [query]);

  // ✅ Keyboard navigation: arrow keys + enter in dropdown
  const handleKeyDown = (e) => {
    if (!showDropdown || results.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, -1));
    } else if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault();
      handleSelectMovie(results[activeIndex]);
    }
  };

  const incrementPopularity = useCallback(async (movieId) => {
    try {
      await fetch(`${AUTOCOMPLETE_URL}/movie/${movieId}/view`, {
        method: "POST",
      });
    } catch (err) {
      console.error("Failed to increment popularity:", err);
    }
  }, []);

  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    const matchedMovie = results.find(
      (m) => m.title.toLowerCase() === query.trim().toLowerCase(),
    );
    if (matchedMovie) await incrementPopularity(matchedMovie.id);

    nav(`/search?query=${encodeURIComponent(query)}`);
    setShowDropdown(false);
    setQuery("");
  };

  const handleSelectMovie = async (movie) => {
    await incrementPopularity(movie.id);
    nav(`/search?query=${encodeURIComponent(movie.title)}`);
    setShowDropdown(false);
    setQuery("");
  };

  const handleLogout = () => {
    dispatch(logout());
    nav("/login");
  };

  const clearSearch = () => {
    setQuery("");
    setResults([]);
    setShowDropdown(false);
    inputRef.current?.focus();
  };

  // ── Search input — shared between desktop and mobile ─────────────────────
  const SearchInput = ({ autoFocus = false }) => (
    <form onSubmit={handleSearchSubmit} className="w-full relative">
      <FiSearch
        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-400 pointer-events-none"
        size={16}
      />
      <input
        ref={inputRef}
        type="text"
        value={query}
        autoFocus={autoFocus}
        onChange={(e) => {
          setQuery(e.target.value);
          setShowDropdown(true);
        }}
        onFocus={() => query && setShowDropdown(true)}
        onKeyDown={handleKeyDown}
        placeholder="Search movies..."
        aria-label="Search movies"
        aria-autocomplete="list"
        aria-expanded={showDropdown}
        className="w-full pl-9 pr-9 py-2 rounded-full border border-gray-200 dark:border-gray-700
                   bg-gray-50 dark:bg-navy-800 text-gray-800 dark:text-gray-100
                   placeholder-gray-400 dark:placeholder-gray-500
                   focus:outline-none focus:ring-2 focus:ring-navy-400 dark:focus:ring-navy-500
                   text-sm transition-all"
      />
      {/* ✅ Clear button — only shows when query is non-empty */}
      {query && (
        <button
          type="button"
          onClick={clearSearch}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400
                     hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          aria-label="Clear search"
        >
          <FiX size={14} />
        </button>
      )}
    </form>
  );

  // ── Dropdown results — shared ─────────────────────────────────────────────
  const SearchDropdown = () => (
    <>
      {/* ✅ Loading skeleton */}
      {showDropdown && query && loading && (
        <div
          className="absolute top-11 left-0 w-full bg-white dark:bg-navy-800
                        border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg
                        overflow-hidden z-[9999]"
        >
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3">
              <div className="w-8 h-10 rounded bg-gray-200 dark:bg-navy-700 animate-pulse" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 w-3/4 rounded bg-gray-200 dark:bg-navy-700 animate-pulse" />
                <div className="h-2.5 w-1/2 rounded bg-gray-200 dark:bg-navy-700 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ✅ Results list */}
      {showDropdown && query && !loading && results.length > 0 && (
        <ul
          role="listbox"
          className="absolute top-11 left-0 w-full bg-white dark:bg-navy-800
                     border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg
                     max-h-64 overflow-y-auto z-[9999]"
        >
          {results.map((movie, idx) => (
            <li
              key={movie.id}
              role="option"
              aria-selected={idx === activeIndex}
              onClick={() => handleSelectMovie(movie)}
              onMouseEnter={() => setActiveIndex(idx)}
              className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors
                ${
                  idx === activeIndex
                    ? "bg-navy-50 dark:bg-navy-700"
                    : "hover:bg-gray-50 dark:hover:bg-navy-700/60"
                }`}
            >
              {/* ✅ Image with fallback on broken URL */}
              <img
                src={movie.poster_url}
                alt={movie.title}
                className="w-8 h-10 object-cover rounded flex-shrink-0"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                  e.currentTarget.nextSibling.style.display = "flex";
                }}
              />
              {/* ✅ Fallback placeholder when image fails */}
              <div
                className="w-8 h-10 rounded bg-gray-200 dark:bg-navy-600 flex-shrink-0
                            items-center justify-center text-gray-400 text-xs"
                style={{ display: "none" }}
              >
                ?
              </div>
              <div className="min-w-0">
                <p className="text-gray-800 dark:text-gray-100 font-medium text-sm truncate">
                  {movie.title}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {movie.genres} {movie.rating ? `• ⭐ ${movie.rating}` : ""}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* ✅ No results */}
      {showDropdown && query && !loading && results.length === 0 && (
        <div
          className="absolute top-11 left-0 w-full bg-white dark:bg-navy-800
                        border border-gray-200 dark:border-gray-700 rounded-xl shadow-md
                        p-3 text-gray-500 dark:text-gray-400 text-sm text-center z-[9999]"
        >
          No results for &ldquo;{query}&rdquo;
        </div>
      )}
    </>
  );

  return (
    <>
      <nav className="bg-white dark:bg-navy-900 shadow-md transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link
            to="/"
            className="text-xl sm:text-2xl font-bold text-navy-700 dark:text-white
                       hover:text-navy-900 dark:hover:text-gray-300 transition-colors flex-shrink-0"
          >
            Eventura
          </Link>

          {/* ✅ Desktop search bar — hidden on mobile */}
          <div
            ref={searchRef}
            className="relative flex-1 max-w-md hidden sm:block"
          >
            <SearchInput />
            <SearchDropdown />
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3 sm:gap-5 flex-shrink-0">
            {/* ✅ Mobile search icon — shows full-width search panel */}
            <button
              className="sm:hidden text-gray-600 dark:text-gray-300 hover:text-navy-700
                         dark:hover:text-white transition-colors"
              onClick={() => setMobileSearch(true)}
              aria-label="Open search"
            >
              <FiSearch size={20} />
            </button>

            {/* ✅ Desktop nav links — hidden on mobile */}
            <div className="hidden sm:flex items-center gap-5">
              <Link
                to="/"
                className="text-gray-700 dark:text-gray-200 font-medium text-sm
                           hover:text-navy-700 dark:hover:text-gray-300 transition-colors"
              >
                Home
              </Link>
              <Link
                to="/profile"
                className="text-gray-700 dark:text-gray-200 font-medium text-sm
                           hover:text-navy-700 dark:hover:text-gray-300 transition-colors"
              >
                Profile
              </Link>
            </div>

            {/* Auth — always visible */}
            {user ? (
              <div className="flex items-center gap-2">
                <span
                  className="hidden sm:inline-block px-3 py-1 bg-navy-50 dark:bg-navy-800
                                  text-navy-700 dark:text-gray-200 text-sm font-medium rounded-full
                                  border border-navy-200 dark:border-navy-700 max-w-[120px] truncate"
                >
                  {user.name}
                </span>
                <button
                  onClick={handleLogout}
                  className="text-red-500 dark:text-red-400 hover:text-red-700
                             dark:hover:text-red-300 transition-colors"
                  title="Logout"
                  aria-label="Logout"
                >
                  <FiLogOut size={18} />
                </button>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-4">
                <Link
                  to="/login"
                  className="text-gray-700 dark:text-gray-200 text-sm font-medium
                             hover:text-navy-700 dark:hover:text-gray-300 transition-colors"
                >
                  Login
                </Link>
                {/* <Link
                  to="/signup"
                  className="text-gray-700 dark:text-gray-200 text-sm font-medium
                             hover:text-navy-700 dark:hover:text-gray-300 transition-colors"
                >
                  Signup
                </Link> */}
              </div>
            )}

            <DarkModeToggle />

            {/* ✅ Mobile hamburger */}
            <button
              className="sm:hidden text-gray-600 dark:text-gray-300 hover:text-navy-700
                         dark:hover:text-white transition-colors"
              onClick={() => setMobileMenu((v) => !v)}
              aria-label="Toggle menu"
            >
              <FiMenu size={22} />
            </button>
          </div>
        </div>

        {/* ✅ Mobile nav menu */}
        {mobileMenu && (
          <div
            className="sm:hidden border-t border-gray-100 dark:border-navy-800
                          bg-white dark:bg-navy-900 px-4 py-3 flex flex-col gap-3"
          >
            <Link
              to="/"
              className="text-gray-700 dark:text-gray-200 font-medium py-1"
              onClick={() => setMobileMenu(false)}
            >
              Home
            </Link>
            <Link
              to="/profile"
              className="text-gray-700 dark:text-gray-200 font-medium py-1"
              onClick={() => setMobileMenu(false)}
            >
              Profile
            </Link>
            {!user && (
              <>
                <Link
                  to="/login"
                  className="text-gray-700 dark:text-gray-200 font-medium py-1"
                  onClick={() => setMobileMenu(false)}
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="text-gray-700 dark:text-gray-200 font-medium py-1"
                  onClick={() => setMobileMenu(false)}
                >
                  Signup
                </Link>
              </>
            )}
          </div>
        )}
      </nav>

      {/* ✅ Mobile full-screen search overlay */}
      {mobileSearch && (
        <div className="fixed inset-0 z-[9998] bg-white dark:bg-navy-900 sm:hidden flex flex-col">
          <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 dark:border-navy-800">
            <div className="relative flex-1">
              <SearchInput autoFocus />
            </div>
            <button
              onClick={() => {
                setMobileSearch(false);
                setQuery("");
                setResults([]);
                setShowDropdown(false);
              }}
              className="text-gray-600 dark:text-gray-300 hover:text-gray-900
                         dark:hover:text-white flex-shrink-0 transition-colors"
              aria-label="Close search"
            >
              <FiX size={22} />
            </button>
          </div>

          {/* Mobile results — full page list, not absolute dropdown */}
          {loading && (
            <div className="flex flex-col gap-2 p-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center gap-3 py-2">
                  <div className="w-10 h-12 rounded bg-gray-200 dark:bg-navy-700 animate-pulse flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-2/3 rounded bg-gray-200 dark:bg-navy-700 animate-pulse" />
                    <div className="h-2.5 w-1/2 rounded bg-gray-200 dark:bg-navy-700 animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && results.length > 0 && (
            <ul className="flex-1 overflow-y-auto divide-y divide-gray-100 dark:divide-navy-800">
              {results.map((movie) => (
                <li
                  key={movie.id}
                  onClick={() => {
                    handleSelectMovie(movie);
                    setMobileSearch(false);
                  }}
                  className="flex items-center gap-3 px-4 py-3 cursor-pointer
                             hover:bg-gray-50 dark:hover:bg-navy-800 transition-colors"
                >
                  <img
                    src={movie.poster_url}
                    alt={movie.title}
                    className="w-10 h-12 object-cover rounded flex-shrink-0"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                  <div className="min-w-0">
                    <p className="text-gray-800 dark:text-gray-100 font-medium truncate">
                      {movie.title}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                      {movie.genres}{" "}
                      {movie.rating ? `• ⭐ ${movie.rating}` : ""}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {!loading && query && results.length === 0 && (
            <div className="flex flex-col items-center justify-center flex-1 text-gray-400 dark:text-gray-500 gap-2">
              <FiSearch size={32} className="opacity-30" />
              <p className="text-sm">No results for &ldquo;{query}&rdquo;</p>
            </div>
          )}

          {!query && (
            <div className="flex flex-col items-center justify-center flex-1 text-gray-400 dark:text-gray-500 gap-2">
              <FiSearch size={32} className="opacity-20" />
              <p className="text-sm">Search for movies, shows...</p>
            </div>
          )}
        </div>
      )}
    </>
  );
}
