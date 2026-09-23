import axios from 'axios';

// If VITE_API_URL is set (separate deployments), use it. Otherwise call same-origin
// "/api", which vite.config.ts proxies to the Express server in development.
const baseURL = import.meta.env.VITE_API_URL || '/api';

export const api = axios.create({ baseURL });

const TOKEN_KEY = 'ets-token';

export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY)
};

api.interceptors.request.use((config) => {
  const token = tokenStore.get();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// If the token is rejected anywhere, drop it so the app falls back to the login screen.
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) tokenStore.clear();
    return Promise.reject(err);
  }
);
