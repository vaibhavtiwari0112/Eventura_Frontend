import React from "react";
import { createPortal } from "react-dom";

export default function Overlay({ children }) {
  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center 
                 bg-black/50 backdrop-blur-sm p-4"
    >
      {children}
    </div>,
    document.body // Mounts at the root level, outside any card/container
  );
}
