import React from "react";
import { useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const user = useSelector((s) => s.auth.user);
  const location = useLocation();

  if (!user) {
    // redirect to login but remember where user came from
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
