import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { apiRequest } from "../utils/api";
import LoadingOverlay from "../components/common/LoadingOverlay"; // ✅ Import overlay

export default function Signup() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [overlayMessage, setOverlayMessage] = useState("");

  const nav = useNavigate();

  function validate() {
    const newErrors = {};

    if (!form.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!form.email) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "Enter a valid email";
    }

    if (!form.password) {
      newErrors.password = "Password is required";
    } else if (form.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    } else if (!/[A-Z]/.test(form.password)) {
      newErrors.password = "Must contain at least one uppercase letter";
    } else if (!/[a-z]/.test(form.password)) {
      newErrors.password = "Must contain at least one lowercase letter";
    } else if (!/[0-9]/.test(form.password)) {
      newErrors.password = "Must contain at least one number";
    } else if (!/[!@#$%^&*(),.?\":{}|<>]/.test(form.password)) {
      newErrors.password = "Must contain at least one special character";
    }

    if (!form.confirmPassword) {
      newErrors.confirmPassword = "Confirm your password";
    } else if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function submit(e) {
    e.preventDefault();
    if (!validate()) {
      toast.error("Please fix the highlighted errors.");
      return;
    }

    try {
      setStatus("loading");
      setOverlayMessage("Creating your account...");

      const data = await apiRequest("user/register", "POST", {
        username: form.name,
        email: form.email,
        password: form.password,
      });

      console.log("Signup Response:", data);

      setStatus("success");
      setOverlayMessage("Signup successful! Redirecting...");

      toast.success("Signup successful! Please log in.");

      setTimeout(() => {
        nav("/login");
      }, 2000);
    } catch (err) {
      console.error("Signup failed:", err.message);
      setStatus("error");
      setOverlayMessage(err.message || "Signup failed. Try again.");
      toast.error(err.message || "Signup failed");

      setTimeout(() => {
        setStatus("idle");
      }, 2000);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-navy-900 transition-colors duration-300 px-4 relative">
      {/* ✅ Overlay Component */}
      {status !== "idle" && (
        <LoadingOverlay type={status} message={overlayMessage} />
      )}

      <div className="w-full max-w-md bg-white dark:bg-navy-800 rounded-2xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-center text-navy-700 dark:text-white mb-6">
          Create Account
        </h2>
        <form onSubmit={submit} className="space-y-5">
          {/* Name */}
          <div>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Full Name"
              className={`w-full p-3 rounded-lg border ${
                errors.name
                  ? "border-red-500"
                  : "border-gray-300 dark:border-gray-600"
              } bg-gray-50 dark:bg-navy-700 text-navy-900 dark:text-white`}
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="Email Address"
              className={`w-full p-3 rounded-lg border ${
                errors.email
                  ? "border-red-500"
                  : "border-gray-300 dark:border-gray-600"
              } bg-gray-50 dark:bg-navy-700 text-navy-900 dark:text-white`}
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="Password"
              className={`w-full p-3 rounded-lg border ${
                errors.password
                  ? "border-red-500"
                  : "border-gray-300 dark:border-gray-600"
              } bg-gray-50 dark:bg-navy-700 text-navy-900 dark:text-white`}
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <input
              type="password"
              value={form.confirmPassword}
              onChange={(e) =>
                setForm({ ...form, confirmPassword: e.target.value })
              }
              placeholder="Confirm Password"
              className={`w-full p-3 rounded-lg border ${
                errors.confirmPassword
                  ? "border-red-500"
                  : "border-gray-300 dark:border-gray-600"
              } bg-gray-50 dark:bg-navy-700 text-navy-900 dark:text-white`}
            />
            {errors.confirmPassword && (
              <p className="text-red-500 text-sm mt-1">
                {errors.confirmPassword}
              </p>
            )}
          </div>

          {/* Button */}
          <button
            type="submit"
            className="w-full py-3 rounded-lg font-semibold text-white bg-navy-600 hover:bg-navy-700 dark:bg-navy-500 dark:hover:bg-navy-400 transition"
          >
            Signup
          </button>
        </form>

        <p className="text-sm text-center text-gray-600 dark:text-gray-400 mt-6">
          Already have an account?{" "}
          <span
            onClick={() => nav("/login")}
            className="text-navy-600 dark:text-navy-400 font-semibold cursor-pointer hover:underline"
          >
            Login
          </span>
        </p>
      </div>
    </div>
  );
}
