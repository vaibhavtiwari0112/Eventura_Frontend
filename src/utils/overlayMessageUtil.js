// utils/overlayMessageUtil.js
// Handles all error codes produced by the gateway filter suite

export function formatOverlayMessage(error, context = "general") {
  if (!error) return getContextMessage(context, "default");

  const msg = error.toLowerCase();

  // Extract HTTP status from "Some message (Status: 401)" format
  const statusMatch = msg.match(/\(status:\s*(\d{3})\)/);
  const status = statusMatch ? parseInt(statusMatch[1]) : null;

  // Extract gateway error code from response body if present
  // e.g. {"code":"CIRCUIT_OPEN"} or {"code":"RATE_LIMIT_PAYMENT"}
  const codeMatch = error.match(/"code"\s*:\s*"([^"]+)"/);
  const code = codeMatch ? codeMatch[1] : null;

  // ── Gateway-specific codes (highest priority) ──────────────────────────

  if (code === "DUPLICATE_PAYMENT") {
    return "⚠️ This payment was already submitted. Please check your bookings before trying again.";
  }
  if (code === "MISSING_IDEMPOTENCY_KEY") {
    return "⚠️ Payment could not be submitted securely. Please refresh and try again.";
  }
  if (code === "RATE_LIMIT_PAYMENT") {
    return "⏳ Too many payment attempts. Please wait a minute before trying again.";
  }
  if (code === "RATE_LIMIT") {
    return "⏳ You've made too many requests. Please wait a moment and try again.";
  }
  if (code === "CIRCUIT_OPEN") {
    // Use the message from the gateway directly — it's already service-specific
    const gatewayMsg = extractGatewayMessage(error);
    return (
      gatewayMsg ||
      "⚠️ This service is temporarily unavailable. Please try again shortly."
    );
  }
  if (code === "TIMEOUT") {
    const gatewayMsg = extractGatewayMessage(error);
    return gatewayMsg || "⏳ The request took too long. Please try again.";
  }
  if (code === "SEAT_CONFLICT") {
    return "🎭 These seats were just taken. Please go back and select different seats.";
  }
  if (code === "PAYMENT_ERROR") {
    return "💳 Payment encountered an error. No charges were made. Please try again.";
  }
  if (code === "AUTH_ERROR" || code === "TOKEN_EXPIRED") {
    return "🔒 Your session has expired. Please log in again to continue.";
  }

  // ── HTTP status codes ───────────────────────────────────────────────────

  if (
    status === 401 ||
    msg.includes("unauthorized") ||
    msg.includes("authentication required")
  ) {
    if (msg.includes("expired"))
      return "🔒 Your session has expired. Please log in again.";
    if (msg.includes("required") || msg.includes("please log in"))
      return "🔒 Please log in to view this page.";
    return "🔒 Authentication required. Please log in to continue.";
  }
  if (
    status === 403 ||
    msg.includes("forbidden") ||
    msg.includes("permission")
  ) {
    return "🚫 You don't have permission to perform this action.";
  }
  if (status === 404 || msg.includes("not found")) {
    if (msg.includes("booking"))
      return "📋 Booking not found. It may have expired.";
    if (msg.includes("show")) return "🎬 This show is no longer available.";
    return "🔍 We couldn't find what you were looking for.";
  }
  if (status === 409 || msg.includes("conflict")) {
    if (msg.includes("seat"))
      return "🎭 These seats are no longer available. Please select different seats.";
    if (msg.includes("payment"))
      return "💳 A payment for this booking already exists.";
    return "⚠️ A conflict occurred. Please refresh and try again.";
  }
  if (status === 422) {
    return "⚠️ We couldn't process your request. Please check your input and try again.";
  }
  if (status === 429 || msg.includes("too many")) {
    return "⏳ Too many requests. Please wait a moment and try again.";
  }
  if (status === 500 || msg.includes("internal server error")) {
    if (msg.includes("payment"))
      return "💳 Payment processing failed. No charges were made. Please try again.";
    if (msg.includes("booking"))
      return "📋 Booking could not be completed. Please try again.";
    return "💥 Something went wrong on our end. Please try again later.";
  }
  if (status === 502) {
    return "⚠️ A service returned an unexpected response. Please try again.";
  }
  if (status === 503 || msg.includes("unavailable")) {
    return "🔧 This service is temporarily unavailable. Please try again shortly.";
  }
  if (status === 504 || msg.includes("timeout") || msg.includes("timed out")) {
    return "⏳ The request took too long. Please try again in a moment.";
  }

  // ── Network errors (thrown by apiRequest before any HTTP response) ──────

  if (
    msg.includes("network request failed") ||
    msg.includes("failed to fetch")
  ) {
    return "📶 No internet connection. Please check your network and try again.";
  }
  if (msg.includes("connection refused")) {
    return "⚠️ Could not reach the server. Please try again shortly.";
  }

  // ── Context-specific fallback ────────────────────────────────────────────

  return getContextMessage(context, "fallback");
}

// Returns true when the error is auth-related (used by components to show Login button)
export function isAuthError(error) {
  if (!error) return false;
  const msg = error.toLowerCase();
  const statusMatch = msg.match(/\(status:\s*(\d{3})\)/);
  const status = statusMatch ? parseInt(statusMatch[1]) : null;
  const codeMatch = error.match(/"code"\s*:\s*"([^"]+)"/);
  const code = codeMatch ? codeMatch[1] : null;

  return (
    status === 401 ||
    status === 403 ||
    code === "AUTH_ERROR" ||
    code === "TOKEN_EXPIRED" ||
    msg.includes("unauthorized") ||
    msg.includes("forbidden") ||
    msg.includes("session has expired") ||
    msg.includes("please log in")
  );
}

// Returns true for payment-specific errors (components can show "Check Bookings" button)
export function isPaymentError(error) {
  if (!error) return false;
  const msg = error.toLowerCase();
  const codeMatch = error.match(/"code"\s*:\s*"([^"]+)"/);
  const code = codeMatch ? codeMatch[1] : null;

  return (
    code === "PAYMENT_ERROR" ||
    code === "DUPLICATE_PAYMENT" ||
    code === "RATE_LIMIT_PAYMENT" ||
    msg.includes("payment") ||
    msg.includes("charge")
  );
}

// Returns true for seat conflict errors (components can redirect to seat selection)
export function isSeatConflict(error) {
  if (!error) return false;
  const msg = error.toLowerCase();
  const codeMatch = error.match(/"code"\s*:\s*"([^"]+)"/);
  const code = codeMatch ? codeMatch[1] : null;

  return (
    code === "SEAT_CONFLICT" || msg.includes("seat") || msg.includes("409")
  );
}

// Pulls the "message" field out of a JSON error string from the gateway
function extractGatewayMessage(error) {
  try {
    const match = error.match(/"message"\s*:\s*"([^"]+)"/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

function getContextMessage(context, type) {
  const messages = {
    login: {
      default: "Please enter your details to log in.",
      fallback: "We couldn't log you in. Please try again.",
    },
    signup: {
      default: "Please check your details before signing up.",
      fallback: "We couldn't create your account. Please try again.",
    },
    showlist: {
      default: "Fetching shows failed. Please refresh the page.",
      fallback: "We couldn't load the shows. Try again later.",
    },
    home: {
      default: "We couldn't load the movies right now.",
      fallback: "Something went wrong while loading movies. Please try again.",
    },
    booking: {
      default: "We couldn't load your booking details.",
      fallback: "Something went wrong with your booking. Please try again.",
    },
    payment: {
      default: "Payment details could not be loaded.",
      fallback: "Something went wrong with payment. No charges were made.",
    },
    general: {
      default: "Something went wrong. Please try again later.",
      fallback: "We're having a problem right now. Please try again soon.",
    },
  };
  return messages[context]?.[type] ?? messages.general[type];
}
