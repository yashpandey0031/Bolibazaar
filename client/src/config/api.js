import axios from "axios";

const AUTH_TOKEN_KEY = "auth_token";

const getStorage = () => {
  if (typeof window === "undefined") return null;
  return window.localStorage;
};

export const getAuthToken = () => {
  const storage = getStorage();
  if (!storage) return null;
  return storage.getItem(AUTH_TOKEN_KEY);
};

export const setAuthToken = (token) => {
  const storage = getStorage();
  if (!storage || !token) return;
  storage.setItem(AUTH_TOKEN_KEY, token);
};

export const clearAuthToken = () => {
  const storage = getStorage();
  if (!storage) return;
  storage.removeItem(AUTH_TOKEN_KEY);
};

export const api = axios.create({
  baseURL: import.meta.env.VITE_API,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = getAuthToken();

  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});
