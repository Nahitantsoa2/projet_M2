import axios from "axios";

// Détection de l'URL du backend Render / local
// Priorité : VITE_API_URL -> VITE_API_BASE_URL -> fallback Render (prod) / localhost (dev)
const rawBaseUrl =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.PROD
    ? "https://srsp-backend-1.onrender.com"
    : "http://localhost:8000");

// Suppression d'un éventuel trailing slash ou /api accidentel
export const API_BASE_URL = rawBaseUrl.replace(/\/api\/?$/, "").replace(/\/+$/, "");

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  withCredentials: true,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

function lireCookieXsrf() {
  const match = document.cookie.match(/(?:^|; )XSRF-TOKEN=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

// Intercepteur requête : ajoute le token Bearer Sanctum et le jeton CSRF
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("auth_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  const xsrf = lireCookieXsrf();
  if (xsrf) {
    config.headers["X-XSRF-TOKEN"] = xsrf;
  }

  return config;
});

// Récupère le cookie CSRF avant une authentification si nécessaire (pour session stateful).
export async function initialiserCsrf() {
  try {
    if (!lireCookieXsrf()) {
      await axios.get(`${API_BASE_URL}/sanctum/csrf-cookie`, { withCredentials: true });
    }
  } catch {
    // Si le cookie CSRF échoue en cross-domain (Vercel -> Render), le Bearer token assure l'authentification.
  }
}

// Intercepteur réponse : gère la perte de session et le rafraîchissement CSRF
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;
    const estProbeSession = config?.url === "/moi" || config?.url?.endsWith("/moi");

    // Redirige vers /login seulement si 401 sur une vraie action utilisateur (pas lors de la vérification initiale)
    if (error.response?.status === 401 && !estProbeSession) {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("utilisateur");
      window.location.href = "/login";
      return Promise.reject(error);
    }

    // Gestion du jeton CSRF périmé (419)
    if (error.response?.status === 419 && config && !config._csrfRejoue) {
      config._csrfRejoue = true;
      try {
        await axios.get(`${API_BASE_URL}/sanctum/csrf-cookie`, { withCredentials: true });
        return api(config);
      } catch {
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
