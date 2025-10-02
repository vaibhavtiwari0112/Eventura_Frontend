// src/components/Footer.jsx
import React from "react";
import { FaFacebookF, FaTwitter, FaInstagram, FaYoutube } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-gray-100 dark:bg-navy-800 text-gray-700 dark:text-gray-300 mt-16">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10">
          {/* Brand / About */}
          <div>
            <h2 className="text-2xl font-bold text-navy-700 dark:text-white">
              Eventura
            </h2>
            <p className="mt-3 text-sm leading-6">
              Your one-stop destination for booking the latest movies, concerts,
              and events. Experience entertainment like never before.
            </p>
          </div>

          {/* Explore */}
          <div>
            <h3 className="text-lg font-semibold text-navy-600 dark:text-white mb-4">
              Explore
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="/"
                  className="hover:text-navy-500 dark:hover:text-navy-300"
                >
                  Movies
                </a>
              </li>
              <li>
                <a
                  href="/"
                  className="hover:text-navy-500 dark:hover:text-navy-300"
                >
                  Events
                </a>
              </li>
              <li>
                <a
                  href="/"
                  className="hover:text-navy-500 dark:hover:text-navy-300"
                >
                  Genres
                </a>
              </li>
              <li>
                <a
                  href="/"
                  className="hover:text-navy-500 dark:hover:text-navy-300"
                >
                  Upcoming
                </a>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-lg font-semibold text-navy-600 dark:text-white mb-4">
              Support
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="/"
                  className="hover:text-navy-500 dark:hover:text-navy-300"
                >
                  Help Center
                </a>
              </li>
              <li>
                <a
                  href="/"
                  className="hover:text-navy-500 dark:hover:text-navy-300"
                >
                  FAQs
                </a>
              </li>
              <li>
                <a
                  href="/"
                  className="hover:text-navy-500 dark:hover:text-navy-300"
                >
                  Contact Us
                </a>
              </li>
              <li>
                <a
                  href="/"
                  className="hover:text-navy-500 dark:hover:text-navy-300"
                >
                  Cancellation & Refund
                </a>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-lg font-semibold text-navy-600 dark:text-white mb-4">
              Company
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="/"
                  className="hover:text-navy-500 dark:hover:text-navy-300"
                >
                  About Us
                </a>
              </li>
              <li>
                <a
                  href="/"
                  className="hover:text-navy-500 dark:hover:text-navy-300"
                >
                  Careers
                </a>
              </li>
              <li>
                <a
                  href="/"
                  className="hover:text-navy-500 dark:hover:text-navy-300"
                >
                  Privacy Policy
                </a>
              </li>
              <li>
                <a
                  href="/"
                  className="hover:text-navy-500 dark:hover:text-navy-300"
                >
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-300 dark:border-navy-700 my-8"></div>

        {/* Bottom row */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm">
            © {new Date().getFullYear()} Eventura. All Rights Reserved.
          </p>

          <div className="flex space-x-5 text-xl">
            <a
              href="/"
              aria-label="Facebook"
              className="hover:text-navy-500 dark:hover:text-navy-300"
            >
              <FaFacebookF />
            </a>
            <a
              href="/"
              aria-label="Twitter"
              className="hover:text-navy-500 dark:hover:text-navy-300"
            >
              <FaTwitter />
            </a>
            <a
              href="/"
              aria-label="Instagram"
              className="hover:text-navy-500 dark:hover:text-navy-300"
            >
              <FaInstagram />
            </a>
            <a
              href="/"
              aria-label="YouTube"
              className="hover:text-navy-500 dark:hover:text-navy-300"
            >
              <FaYoutube />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
