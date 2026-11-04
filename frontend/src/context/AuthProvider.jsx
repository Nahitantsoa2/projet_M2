import { useEffect, useState } from "react";
import api, { initialiserCsrf } from "../services/api";
import { authContext } from "./AuthContext";

export function AuthProvider({ children }) {
  const [utilisateur, setUtilisateur] = useState(() => {
    const stored = localStorage.getItem("utilisateur");
    return stored ? JSON.parse(stored) : null;
  });
  const [chargement, setChargement] = useState(false);
  const [erreur, setErreur] = useState(null);

  useEffect(() => {
    let annule = false;
    const token = localStorage.getItem("auth_token");
    const storedUser = localStorage.getItem("utilisateur");

    if (!token && !storedUser) {
      return;
    }

    api
      .get("/moi")
      .then(({ data }) => {
        if (annule) return;
        setUtilisateur(data);
        localStorage.setItem("utilisateur", JSON.stringify(data));
      })
      .catch((err) => {
        // Ne déconnecte QUE si le serveur répond explicitement 401 Non autorisé
        if (!annule && err?.response?.status === 401) {
          localStorage.removeItem("auth_token");
          localStorage.removeItem("utilisateur");
          setUtilisateur(null);
        }
      });
    return () => {
      annule = true;
    };
  }, []);

  async function login(email, password, matricule) {
    setChargement(true);
    setErreur(null);
    try {
      const { data } = await api.post("/login", { email, password, matricule });
      if (data.token) {
        localStorage.setItem("auth_token", data.token);
      }
      localStorage.setItem("utilisateur", JSON.stringify(data.utilisateur));
      setUtilisateur(data.utilisateur);
      return data.utilisateur;
    } catch (err) {
      const apiErrors = err.response?.data?.errors;
      const apiMessage = err.response?.data?.message;
      const networkErreur = !err.response
        ? "Impossible de contacter le serveur backend. Veuillez vérifier votre connexion ou réessayez dans quelques secondes (le serveur est en cours de réveil)."
        : null;

      const message =
        networkErreur ||
        (apiErrors ? Object.values(apiErrors).flat().join(" ") : null) ||
        apiMessage ||
        "Identifiants incorrects.";

      setErreur(message);
      throw err;
    } finally {
      setChargement(false);
    }
  }

  async function register(form) {
    setChargement(true);
    setErreur(null);
    try {
      await initialiserCsrf();
      const { data } = await api.post("/register", form);
      if (data?.token) {
        localStorage.setItem("auth_token", data.token);
      }
      if (data?.utilisateur) {
        localStorage.setItem("utilisateur", JSON.stringify(data.utilisateur));
        setUtilisateur(data.utilisateur);
        return data.utilisateur;
      }
      return await actualiserUtilisateur();
    } catch (err) {
      const apiErrors = err.response?.data?.errors;
      const apiMessage = err.response?.data?.message;
      const networkErreur = !err.response
        ? "Impossible de contacter le serveur backend. Veuillez vérifier votre connexion ou réessayez dans quelques secondes (le serveur est en cours de réveil)."
        : null;

      const message =
        networkErreur ||
        (apiErrors ? Object.values(apiErrors).flat().join(" ") : null) ||
        apiMessage ||
        "Une erreur est survenue lors de l'inscription.";

      setErreur(message);
      throw err;
    } finally {
      setChargement(false);
    }
  }

  async function actualiserUtilisateur() {
    try {
      const { data } = await api.get("/moi");
      localStorage.setItem("utilisateur", JSON.stringify(data));
      setUtilisateur(data);
      return data;
    } catch {
      return null;
    }
  }

  async function logout() {
    try {
      await api.post("/logout");
    } finally {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("utilisateur");
      setUtilisateur(null);
    }
  }

  return (
    <authContext.Provider
      value={{
        utilisateur,
        login,
        register,
        logout,
        actualiserUtilisateur,
        chargement,
        erreur,
        setErreur,
      }}
    >
      {children}
    </authContext.Provider>
  );
}
