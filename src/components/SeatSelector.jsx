import React, { useMemo } from "react";

export default function SeatSelector({
  layout = [],
  selected = [],
  onSeatClick = () => {},
  currentUserId = null,
}) {
  // compute maximum columns across all rows so headers & placeholders align
  const maxCols = useMemo(
    () =>
      layout && layout.length ? Math.max(...layout.map((r) => r.length)) : 0,
    [layout]
  );

  return (
    <div className="inline-block">
      <div className="mt-6 text-center">
        <div className="h-2 w-2/3 mx-auto bg-gray-300 rounded-full" />
        <p className="text-xs text-gray-500 mt-1">SCREEN</p>
      </div>

      <div className="flex justify-center mb-2">
        <div className="w-6" />
        {Array.from({ length: maxCols }).map((_, c) => (
          <div
            key={`col-${c}`}
            className="w-10 text-center text-xs text-gray-500"
          >
            {c + 1}
          </div>
        ))}
      </div>

      {/* Rows */}
      {layout.map((row, rIdx) => (
        <div key={`row-${rIdx}`} className="flex items-center mb-2">
          {/* Row label */}
          <div className="w-6 text-right pr-1 font-medium text-gray-600">
            {String.fromCharCode(65 + rIdx)}
          </div>

          {Array.from({ length: maxCols }).map((_, c) => {
            const seat = (row && row[c]) || null;

            if (!seat) {
              return (
                <div key={`empty-${rIdx}-${c}`} className="w-10 h-10 mx-1" />
              );
            }

            const isSelected = selected.includes(seat.id);
            // locked is a simple boolean now: lockedBy exists -> locked
            const isLockedByOther = Boolean(
              seat.lockedBy && seat.lockedBy !== currentUserId
            );
            const isBooked = seat.status === "booked";

            let classes =
              "w-10 h-10 mx-1 flex items-center justify-center rounded-md text-xs font-medium transition select-none";

            if (isBooked) {
              classes += " bg-red-500 text-white cursor-not-allowed opacity-95";
            } else if (isSelected) {
              classes += " bg-navy-600 text-white shadow-md cursor-pointer";
            } else if (isLockedByOther) {
              classes += " bg-gray-300 text-gray-700 cursor-not-allowed";
            } else {
              classes +=
                " bg-white border border-gray-200 text-gray-800 hover:bg-navy-600 hover:text-white cursor-pointer";
            }

            const label =
              seat.label ?? `${String.fromCharCode(65 + rIdx)}${c + 1}`;

            return (
              <button
                key={seat.id ?? `seat-${rIdx}-${c}`}
                type="button"
                aria-pressed={isSelected}
                aria-label={`Seat ${label}${
                  isBooked ? " booked" : isLockedByOther ? " locked" : ""
                }`}
                disabled={isBooked || isLockedByOther}
                onClick={() => {
                  if (isBooked || isLockedByOther) return;
                  onSeatClick(seat);
                }}
                className={classes}
              >
                {isLockedByOther ? "🔒" : label}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}
