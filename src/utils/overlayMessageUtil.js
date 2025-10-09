export function formatOverlayMessage(error, context = "general") {
  if (!error) return getContextMessage(context, "default");

  const msg = error.toLowerCase();

  // 🌐 Network / Connectivity
  if (msg.includes("connection refused"))
    return "⚠️ We’re having trouble connecting to the server. Please try again soon.";
  if (msg.includes("timeout"))
    return "⏳ It’s taking longer than usual. Please try again in a moment.";
  if (msg.includes("network"))
    return "📶 It looks like you’re offline. Please check your internet connection.";

  // 🔐 Authentication
  if (msg.includes("unauthorized"))
    return "🔒 You need to log in again to continue.";
  if (msg.includes("invalid credentials") || msg.includes("bad credentials"))
    return "❌ Your email or password seems incorrect.";

  // 🔍 Not found / Missing data
  if (msg.includes("not found") || msg.includes("404"))
    return "🎬 We couldn’t find what you were looking for.";

  // 🖥️ Backend / Server issues
  if (msg.includes("internal server error") || msg.includes("500"))
    return "💥 Oops! Something went wrong on our end. Please try again later.";

  // 📦 Database / Data conflicts
  if (msg.includes("duplicate") || msg.includes("exists"))
    return "⚠️ This information already exists. Try using something different.";

  // 🧭 Custom fallback per context
  return getContextMessage(context, "fallback");
}

function getContextMessage(context, type) {
  const messages = {
    login: {
      default: "Please enter your details correctly to log in.",
      fallback: "We couldn’t log you in. Please try again.",
    },
    signup: {
      default: "Please check your details before signing up.",
      fallback: "We couldn’t create your account. Please try again.",
    },
    showlist: {
      default: "Fetching shows failed. Please refresh the page.",
      fallback: "We couldn’t load the shows. Try again later.",
    },
    home: {
      default: "We couldn’t load the movies right now.",
      fallback: "Something went wrong while loading movies. Please try again.",
    },
    general: {
      default: "Something went wrong. Please try again later.",
      fallback: "We’re having a problem right now. Please try again soon.",
    },
  };

  return messages[context]?.[type] || messages.general[type];
}
