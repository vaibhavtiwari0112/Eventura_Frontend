import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { setCredentials } from "../store/slices/authSlice";
import { useNavigate, useLocation } from "react-router-dom";
import { apiRequest } from "../utils/api";

// overlays
import LoadingOverlay from "../components/common/LoadingOverlay";
import SuccessOverlay from "../components/common/SuccessOverlay";
import ErrorOverlay from "../components/common/ErrorOverlay";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle");
  // idle | loading | success | error
  const [errorMsg, setErrorMsg] = useState("");

  const dispatch = useDispatch();
  const nav = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  function validateForm() {
    const newErrors = {};

    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Enter a valid email";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    } else if (!/[A-Z]/.test(password)) {
      newErrors.password =
        "Password must contain at least one uppercase letter";
    } else if (!/[0-9]/.test(password)) {
      newErrors.password = "Password must contain at least one number";
    } else if (!/[!@#$%^&*(),.?\":{}|<>]/.test(password)) {
      newErrors.password =
        "Password must contain at least one special character";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function submit(e) {
    e.preventDefault();
    if (!validateForm()) {
      setStatus("error");
      setErrorMsg("Please fix the errors and try again.");
      return;
    }

    try {
      setStatus("loading");
      const data = await apiRequest("user/login", "POST", { email, password });

      const userData = {
        user: {
          name: data.username,
          email: data.email,
          role: data.role,
          id: data.id,
        },
        token: data.token,
      };

      dispatch(setCredentials(userData));
      localStorage.setItem("auth", JSON.stringify(userData));

      setStatus("success");
      setTimeout(() => {
        nav(from, { replace: true });
      }, 1500); // auto-redirect after success
    } catch (err) {
      console.error("Login failed:", err.message);
      setErrorMsg(err.message || "Invalid email or password");
      setStatus("error");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-navy-900 transition-colors duration-300 px-4">
      <div className="w-full max-w-md bg-white dark:bg-navy-800 rounded-2xl shadow-xl p-8">
        {/* Header */}
        <h2 className="text-2xl font-bold text-center text-navy-700 dark:text-white">
          Welcome Back
        </h2>
        <p className="text-center text-gray-500 dark:text-gray-400 mt-1 mb-6">
          Login to continue booking your favorite movies
        </p>

        {/* Form */}
        <form onSubmit={submit} className="space-y-4">
          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-navy-700 dark:text-gray-300"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className={`mt-1 w-full p-3 rounded-lg border ${
                errors.email
                  ? "border-red-500"
                  : "border-gray-300 dark:border-navy-600"
              } bg-white dark:bg-navy-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-navy-500 focus:outline-none`}
            />
            {errors.email && (
              <p className="text-sm text-red-500 mt-1">{errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-navy-700 dark:text-gray-300"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="********"
              className={`mt-1 w-full p-3 rounded-lg border ${
                errors.password
                  ? "border-red-500"
                  : "border-gray-300 dark:border-navy-600"
              } bg-white dark:bg-navy-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-navy-500 focus:outline-none`}
            />
            {errors.password && (
              <p className="text-sm text-red-500 mt-1">{errors.password}</p>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-lg bg-navy-500 hover:bg-navy-600 text-white font-semibold transition-colors"
          >
            Login
          </button>
        </form>

        {/* Footer links */}
        <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
          Don’t have an account?{" "}
          <a
            href="/signup"
            className="text-navy-600 dark:text-navy-400 font-medium hover:underline"
          >
            Sign up
          </a>
        </div>
      </div>

      {/* Overlays */}
      {status === "loading" && <LoadingOverlay />}
      {status === "success" && <SuccessOverlay message="Login successful!" />}
      {status === "error" && <ErrorOverlay message={errorMsg} />}
    </div>
  );
}
