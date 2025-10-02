import React, { useEffect, useState } from "react";
import Overlay from "../Overlay";
import { CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const SuccessOverlay = ({ message = "Action Successful!", onClose }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      if (onClose) onClose(); // notify parent to hide overlay
    }, 2000); // auto-close after 2 seconds

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <AnimatePresence>
      {visible && (
        <Overlay>
          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.7, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center gap-4 bg-white dark:bg-navy-800 p-6 rounded-2xl shadow-xl"
          >
            <CheckCircle2 className="h-20 w-20 text-green-500 dark:text-green-400 animate-bounce" />
            <p className="text-navy-700 dark:text-navy-200 font-semibold text-lg text-center">
              {message}
            </p>
          </motion.div>
        </Overlay>
      )}
    </AnimatePresence>
  );
};

export default SuccessOverlay;
