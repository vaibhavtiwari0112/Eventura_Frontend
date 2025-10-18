import React, { useState } from "react";
import Overlay from "../Overlay";
import { motion } from "framer-motion";
import { XCircle, MessageSquare } from "lucide-react";

const ConfirmCancelOverlay = ({ onConfirm, onClose }) => {
  const [step, setStep] = useState(1); // 1 = confirm, 2 = reason
  const [selectedReason, setSelectedReason] = useState(null);
  const [customReason, setCustomReason] = useState("");

  const reasons = [
    { id: "user_cancelled", label: "Change of plans" },
    { id: "found_other_show", label: "Found another showtime" },
    { id: "mistaken_booking", label: "Booked by mistake" },
    { id: "technical_issue", label: "Technical issue" },
    { id: "other", label: "Other reason" },
  ];

  const handleConfirm = () => {
    if (!selectedReason) return;
    const finalReason =
      selectedReason === "other" && customReason.trim()
        ? customReason.trim()
        : selectedReason;
    onConfirm(finalReason);
  };

  return (
    <Overlay>
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col items-center gap-5 bg-white dark:bg-navy-800 p-6 rounded-2xl shadow-xl max-w-sm text-center"
      >
        {step === 1 ? (
          <>
            <XCircle className="h-16 w-16 text-red-500 dark:text-red-400" />
            <p className="text-navy-800 dark:text-navy-200 font-semibold text-lg">
              Are you sure you want to cancel this booking?
            </p>
            <div className="flex gap-3 mt-4">
              <button
                onClick={onClose}
                className="px-5 py-2 rounded-lg bg-gray-200 dark:bg-navy-700 text-navy-700 dark:text-navy-200 hover:bg-gray-300 dark:hover:bg-navy-600 transition"
              >
                No, Keep It
              </button>
              <button
                onClick={() => setStep(2)}
                className="px-5 py-2 rounded-lg bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold hover:from-red-700 hover:to-red-800 transition"
              >
                Yes, Cancel
              </button>
            </div>
          </>
        ) : (
          <>
            <MessageSquare className="h-14 w-14 text-navy-500 dark:text-navy-300" />
            <p className="text-navy-800 dark:text-navy-200 font-semibold text-lg">
              Please select a reason for cancellation
            </p>

            <div className="flex flex-col w-full gap-3 mt-2">
              {reasons.map((r) => (
                <button
                  key={r.id}
                  onClick={() => setSelectedReason(r.id)}
                  className={`w-full px-4 py-2 rounded-lg border text-sm font-medium transition ${
                    selectedReason === r.id
                      ? "bg-red-600 text-white border-red-600"
                      : "border-gray-300 dark:border-navy-600 text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-navy-700 hover:bg-gray-100 dark:hover:bg-navy-600"
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>

            {selectedReason === "other" && (
              <input
                type="text"
                placeholder="Enter your reason..."
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                className="w-full border border-gray-300 dark:border-navy-600 bg-gray-50 dark:bg-navy-700 text-gray-800 dark:text-gray-200 rounded-lg px-3 py-2 mt-2 focus:ring-2 focus:ring-red-500"
              />
            )}

            <div className="flex gap-3 mt-5">
              <button
                onClick={() => setStep(1)}
                className="px-5 py-2 rounded-lg bg-gray-200 dark:bg-navy-700 text-navy-700 dark:text-navy-200 hover:bg-gray-300 dark:hover:bg-navy-600 transition"
              >
                Back
              </button>
              <button
                onClick={handleConfirm}
                disabled={
                  !selectedReason ||
                  (selectedReason === "other" && !customReason.trim())
                }
                className="px-5 py-2 rounded-lg bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold hover:from-red-700 hover:to-red-800 disabled:opacity-50 transition"
              >
                Confirm Cancellation
              </button>
            </div>
          </>
        )}
      </motion.div>
    </Overlay>
  );
};

export default ConfirmCancelOverlay;
