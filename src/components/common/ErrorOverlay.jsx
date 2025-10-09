import React, { useState } from "react";
import Overlay from "../Overlay";
import { XCircle, X } from "lucide-react";
import { motion } from "framer-motion";

const ErrorOverlay = ({
  message = "Something went wrong!",
  onClose, // optional parent handler
}) => {
  const [isVisible, setIsVisible] = useState(true);

  const handleClose = () => {
    if (typeof onClose === "function") {
      onClose(); // let parent handle it
    } else {
      setIsVisible(false); // close locally if no handler provided
    }
  };

  if (!isVisible) return null;

  return (
    <Overlay onClick={handleClose}>
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="relative flex flex-col items-center gap-4 bg-white dark:bg-navy-800 p-6 rounded-2xl shadow-xl"
        onClick={(e) => e.stopPropagation()} // prevent closing when clicking inside
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          aria-label="Close"
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
