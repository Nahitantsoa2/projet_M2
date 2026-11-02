import axios from "axios";

const API_BASE_URL = "http://localhost:8000";

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

// Ajoute le jeton CSRF (nécessaire pour les sessions cookie httpOnly)
api.interceptors.request.use((config) => {
  const xsrf = lireCookieXsrf();
  if (xsrf) {
    config.headers["X-XSRF-TOKEN"] = xsrf;
  }
  return config;
});

// Récupère le cookie CSRF avant une authentification.
// La route sanctum/csrf-cookie est hors du préfixe /api.
// Inutile de refaire la requête si le jeton XSRF est déjà présent.
export async function initialiserCsrf() {
  if (!lireCookieXsrf()) {
    await axios.get(`${API_BASE_URL}/sanctum/csrf-cookie`, { withCredentials: true });
  }
}

// Si la session est invalide/expirée, redirige vers le login automatiquement.
// Si le jeton CSRF est périmé (419), on le rafraîchit puis on rejoue la requête une seule fois.
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;
    const estProbeSession = config?.url === "/moi";
    if (error.response?.status === 401 && !estProbeSession) {
      localStorage.removeItem("utilisateur");
      window.location.href = "/login";
      return Promise.reject(error);
    }

    if (error.response?.status === 419 && config && !config._csrfRejoue) {
      config._csrfRejoue = true;
      await axios.get(`${API_BASE_URL}/sanctum/csrf-cookie`, { withCredentials: true });
      return api(config);
    }

    return Promise.reject(error);
  }
);

export default api;