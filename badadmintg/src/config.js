const configuredApiUrl = import.meta.env.VITE_API_URL;
const defaultApiUrl = configuredApiUrl || 'http://localhost:5000';

export const API_URL = defaultApiUrl;

export function apiUrl(path) {
  const isLocalBrowser =
    typeof window !== 'undefined' && /https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(window.location.origin);

  if (isLocalBrowser) {
    return path.startsWith('/api') ? path : `/api${path}`;
  }

  return `${API_URL}${path}`;
}

export function createAuthHeaders() {
  const token = localStorage.getItem('adminAuthToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function parseApiResponse(response) {
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return response.json();
  }
  const text = await response.text();
  return { message: text || 'Unexpected server response.' };
}
