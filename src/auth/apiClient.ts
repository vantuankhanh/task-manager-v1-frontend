import axios from "axios";

/**
 * The one axios instance every service uses. It carries no authentication by
 * itself: the provider of the active mode installs its interceptors on it
 * (see authentication.ts).
 */
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
  timeout: 5000,
  headers: {
    "Content-Type": "application/json",
  },
});
