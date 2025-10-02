// utils/api.js
const BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

export const apiRequest = async (
  endpoint,
  method = "GET",
  body = null,
  token = null
) => {
  const headers = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  console.log("headers --  ", headers);

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  // Handle non-2xx responses
  if (!res.ok) {
    let errorMsg;
    try {
      const errorData = await res.json();
      errorMsg = errorData.message || JSON.stringify(errorData);
    } catch {
      errorMsg = await res.text();
    }
    throw new Error(errorMsg || "Request failed");
  }

  return res.json();
};
