import React from "react";
import Overlay from "../Overlay";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";

const LoadingOverlay = ({ message = "Fetching data..." }) => {
  return (
    <Overlay>
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col items-center gap-4 bg-white dark:bg-navy-800 p-6 rounded-2xl shadow-xl"
      >
        <Loader2 className="h-16 w-16 animate-spin text-navy-500 dark:text-navy-300" />
        <p className="text-navy-700 dark:text-navy-200 font-semibold text-lg">
          {message}
        </p>
      </motion.div>
    </Overlay>
  );
};

export default LoadingOverlay;
