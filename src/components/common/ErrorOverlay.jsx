import React from "react";
import Overlay from "../Overlay";
import { XCircle, X } from "lucide-react";
import { motion } from "framer-motion";

const ErrorOverlay = ({ message = "Something went wrong!" }) => {
  const handleClose = () => {
    window.location.reload(); // refresh to restore previous state
  };

  return (
    <Overlay>
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="relative flex flex-col items-center gap-4 bg-white dark:bg-navy-800 p-6 rounded-2xl shadow-xl"
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white"
        >
          <X size={22} />
        </button>

        <XCircle className="h-20 w-20 text-red-600 animate-pulse" />
        <p className="text-center text-red-700 dark:text-red-400 font-semibold text-lg">
          {message}
        </p>
      </motion.div>
    </Overlay>
  );
};

export default ErrorOverlay;
