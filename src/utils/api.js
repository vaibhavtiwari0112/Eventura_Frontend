const BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api/";

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

  const url = `${BASE_URL}${endpoint}`;

  let res;
  try {
    res = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (networkErr) {
    throw new Error(
      "Network request failed. Please check your internet connection."
    );
  }

  // 🔴 Non-2xx responses
  if (!res.ok) {
    let errorMsg = `Request failed (${res.status})`;
    try {
      const data = await res.json();
      if (data?.message) errorMsg = data.message;
      else if (typeof data === "object") errorMsg = JSON.stringify(data);
    } catch {
      const text = await res.text();
      if (text) errorMsg = text;
    }

    throw new Error(`${errorMsg} (Status: ${res.status})`);
  }

  // ✅ Successful response
  try {
    return await res.json();
  } catch {
    throw new Error("Invalid JSON response from server");
  }
};
