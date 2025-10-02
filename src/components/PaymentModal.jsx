import React, { useMemo } from "react";

export default function PaymentModal({ open, onClose, onPay, amount }) {
  if (!open) return null;

  // Breakdown calculations
  const breakdown = useMemo(() => {
    const convenienceFee = 30; // flat fee (can also be %)
    const subTotal = amount + convenienceFee;

    const gst = +(subTotal * 0.18).toFixed(2); // 18% GST
    const entertainmentTax = +(amount * 0.05).toFixed(2); // ~5% of base ticket

    const total = subTotal + gst + entertainmentTax;

    return { convenienceFee, gst, entertainmentTax, total };
  }, [amount]);

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="relative bg-white dark:bg-navy-900 rounded-2xl shadow-2xl p-6 w-96 z-10 transform transition-all scale-100 animate-fadeIn">
        {/* Header */}
        <h3 className="text-xl font-bold text-navy-700 dark:text-white mb-4">
          💳 Payment Summary
        </h3>

        {/* Breakdown */}
        <div className="mb-6 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-700 dark:text-gray-300">Base Price</span>
            <span className="font-medium text-navy-700 dark:text-white">
              ₹{amount}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-700 dark:text-gray-300">
              Convenience Fee
            </span>
            <span className="text-gray-600 dark:text-gray-400">
              ₹{breakdown.convenienceFee}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-700 dark:text-gray-300">GST (18%)</span>
            <span className="text-gray-600 dark:text-gray-400">
              ₹{breakdown.gst}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-700 dark:text-gray-300">
              Entertainment Tax (5%)
            </span>
            <span className="text-gray-600 dark:text-gray-400">
              ₹{breakdown.entertainmentTax}
            </span>
          </div>

          <hr className="my-3 border-gray-300 dark:border-gray-600" />

          <div className="flex justify-between text-lg font-bold">
            <span className="text-navy-700 dark:text-white">Total Payable</span>
            <span className="text-indigo-600 dark:text-indigo-400">
              ₹{breakdown.total}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium hover:bg-red-100 dark:hover:bg-red-900/40 hover:text-red-600 dark:hover:text-red-400 transition"
          >
            Cancel
          </button>
          <button
            onClick={() => onPay({ status: "success", breakdown })}
            className="px-5 py-2.5 rounded-xl font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 shadow-md hover:shadow-lg hover:scale-105 transition"
          >
            Proceed to Pay ₹{breakdown.total.toFixed(2)}
          </button>
        </div>
      </div>
    </div>
  );
}
