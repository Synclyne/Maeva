import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

/* ── Attach JWT on every request ─────────────────────────── */
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/* ── Global response error handling ─────────────────────── */
api.interceptors.response.use(
  response => response,
  error => {
    const status = error.response?.status;

    // Session expired — clear token so user is prompted to log in
    if (status === 401) {
      const token = localStorage.getItem('token');
      if (token) {
        localStorage.removeItem('token');
        // Reload only if we had a token (i.e. a genuinely expired session)
        window.dispatchEvent(new CustomEvent('maeva:session-expired'));
      }
    }

    // Build a human-readable message
    if (!error.response) {
      error.friendlyMessage = 'Unable to connect to the server. Please check your internet connection and try again.';
    } else {
      const serverMsg = error.response.data?.message;
      const statusMessages = {
        400: serverMsg || 'The request was invalid. Please check your input and try again.',
        401: 'Your session has expired. Please sign in again.',
        403: serverMsg || "You don't have permission to perform this action.",
        404: serverMsg || 'The requested resource was not found.',
        409: serverMsg || 'A conflict occurred — this item may already exist.',
        413: 'The file you tried to upload is too large.',
        422: serverMsg || 'The data you submitted was invalid.',
        429: 'Too many requests. Please wait a moment before trying again.',
        500: 'A server error occurred. Our team has been notified. Please try again shortly.',
        502: 'The server is temporarily unavailable. Please try again in a moment.',
        503: 'The service is temporarily unavailable. Please try again shortly.',
      };
      error.friendlyMessage = statusMessages[status] || serverMsg || `An unexpected error occurred (${status}).`;
    }

    // Broadcast server/network errors so the global toast listener can show them.
    // Skip 4xx client errors — components handle those locally with context-specific messages.
    const shouldBroadcast = !error.response || error.response.status >= 500;
    if (shouldBroadcast && !error.config?._silent) {
      window.dispatchEvent(new CustomEvent('maeva:api-error', {
        detail: { message: error.friendlyMessage }
      }));
    }

    return Promise.reject(error);
  }
);

export default api;
