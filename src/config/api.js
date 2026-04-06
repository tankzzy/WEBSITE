const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export function apiUrl(path) {
  return `${API_BASE_URL}${path}`;
}

export async function parseApiResponse(response) {
  const contentType = response.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    return response.json();
  }

  const text = await response.text();
  return { message: text || "Unexpected server response." };
}

export function createAuthHeaders(storageKey = "authToken") {
  const token = localStorage.getItem(storageKey);

  return token
    ? {
        Authorization: `Bearer ${token}`,
      }
    : {};
}
