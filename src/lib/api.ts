import axios, { type AxiosInstance } from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const TOKEN_KEY = 'novawear_token';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

let onUnauthorized: (() => void) | null = null;
export function setOnUnauthorized(handler: () => void) {
  onUnauthorized = handler;
}

export const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      clearToken();
      onUnauthorized?.();
    }
    return Promise.reject(err);
  }
);
