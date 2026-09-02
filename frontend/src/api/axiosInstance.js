import axios from 'axios';

// VITE_* variables are baked in at BUILD time, not read at runtime.
// After changing this in the Vercel dashboard you must redeploy.
const configured = import.meta.env.VITE_API_URL;

const isLocalhost =
  typeof window !== 'undefined' &&
  /^(localhost|127\.0\.0\.1|\[::1\])$/.test(window.location.hostname);

// Falling back to localhost on a deployed site points every visitor at their
// OWN machine, which the browser blocks as a private/loopback request. Fail
// loudly with instructions instead of leaving a confusing CORS error.
if (!configured && !isLocalhost) {
  console.error(
    '[MathTech] VITE_API_URL is not set for this build.\n' +
    'The app is falling back to http://localhost:5000/api, which cannot work ' +
    'on a deployed site.\n\n' +
    'Fix: Vercel > Settings > Environment Variables >\n' +
    '  VITE_API_URL = https://<your-backend>.onrender.com/api\n' +
    'then redeploy (VITE_* is applied at build time).'
  );
}

const baseURL = configured || 'http://localhost:5000/api';

const api = axios.create({ baseURL });

// Attach token to every request
api.interceptors.request.use((config) => {
  const user = localStorage.getItem('dw_user');
  if (user) {
    try {
      const { token } = JSON.parse(user);
      if (token) config.headers.Authorization = `Bearer ${token}`;
    } catch {
      localStorage.removeItem('dw_user');
    }
  }
  return config;
});

// Global 401 handler — redirect to login
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('dw_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
