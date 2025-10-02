import React from "react";

const Overlay = ({ children }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/70 backdrop-blur-sm">
      {children}
    </div>
  );
};

export default Overlay;
