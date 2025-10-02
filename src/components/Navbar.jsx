import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { FiLogOut } from "react-icons/fi";
import { logout } from "../store/slices/authSlice";
import DarkModeToggle from "../helper/DarkModeToggel";

export default function Navbar() {
  const user = useSelector((s) => s.auth.user);
  const dispatch = useDispatch();
  const nav = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    nav("/login");
  };

  return (
    <nav className="bg-white dark:bg-navy-900 shadow-md transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
        {/* Logo / Brand */}
        <Link
          to="/"
          className="text-2xl font-bold text-navy-700 dark:text-white hover:text-navy-900 dark:hover:text-gray-300 transition-colors"
        >
          Eventura
        </Link>

        {/* Links + Auth + Dark Mode */}
        <div className="flex items-center space-x-6">
          <Link
            to="/"
            className="relative text-gray-700 dark:text-gray-200 font-medium transition-colors 
             hover:text-navy-700 dark:hover:text-gray-300 
             after:content-[''] after:absolute after:left-0 after:-bottom-1 
             after:w-full after:h-[2px] after:bg-navy-700 dark:after:bg-gray-300 
             after:scale-x-0 after:origin-left after:transition-transform after:duration-300 
             hover:after:scale-x-100"
          >
            Home
          </Link>
          <Link
            to="/profile"
            className="relative text-gray-700 dark:text-gray-200 font-medium transition-colors 
             hover:text-navy-700 dark:hover:text-gray-300 
             after:content-[''] after:absolute after:left-0 after:-bottom-1 
             after:w-full after:h-[2px] after:bg-navy-700 dark:after:bg-gray-300 
             after:scale-x-0 after:origin-left after:transition-transform after:duration-300 
             hover:after:scale-x-100"
          >
            Profile
          </Link>

          {/* User or Auth Buttons */}
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
                className="relative text-gray-700 dark:text-gray-200 font-medium transition-colors 
             hover:text-navy-700 dark:hover:text-gray-300 
             after:content-[''] after:absolute after:left-0 after:-bottom-1 
             after:w-full after:h-[2px] after:bg-navy-700 dark:after:bg-gray-300 
             after:scale-x-0 after:origin-left after:transition-transform after:duration-300 
             hover:after:scale-x-100"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="relative text-gray-700 dark:text-gray-200 font-medium transition-colors 
             hover:text-navy-700 dark:hover:text-gray-300 
             after:content-[''] after:absolute after:left-0 after:-bottom-1 
             after:w-full after:h-[2px] after:bg-navy-700 dark:after:bg-gray-300 
             after:scale-x-0 after:origin-left after:transition-transform after:duration-300 
             hover:after:scale-x-100"
              >
                Signup
              </Link>
            </>
          )}

          {/* Dark Mode Toggle */}
          <DarkModeToggle />
        </div>
      </div>
    </nav>
  );
}
