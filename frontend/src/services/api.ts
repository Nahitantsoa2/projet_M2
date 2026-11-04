import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://srsp-backend-1.onrender.com";

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

// Ajoute le token Bearer et le jeton CSRF
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

// Récupère le cookie CSRF avant une authentification si possible.
// La route sanctum/csrf-cookie est hors du préfixe /api.
export async function initialiserCsrf() {
  try {
    if (!lireCookieXsrf()) {
      await axios.get(`${API_BASE_URL}/sanctum/csrf-cookie`, { withCredentials: true });
    }
  } catch {
    // Si le cookie CSRF échoue (cross-domain), le Bearer token assurera l'authentification.
  }
}

// Si la session est invalide/expirée, redirige vers le login automatiquement.
// Si le jeton CSRF est périmé (419), on le rafraîchit puis on rejoue la requête une seule fois.
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;
    const estProbeSession = config?.url === "/moi" || config?.url?.endsWith("/moi");
    if (error.response?.status === 401 && !estProbeSession) {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("utilisateur");
      window.location.href = "/login";
      return Promise.reject(error);
    }

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