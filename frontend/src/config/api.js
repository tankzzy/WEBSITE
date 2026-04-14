const configuredApiUrl = (import.meta.env.VITE_API_URL || "")
  .trim()
  .replace(/\/+$/, "");
const API_BASE_URL =
  configuredApiUrl ||
  (import.meta.env.DEV
    ? ""
    : typeof window !== "undefined"
      ? window.location.origin
      : "");

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
