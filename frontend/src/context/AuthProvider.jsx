import { useEffect, useState, useMemo, useCallback } from "react";
import api, { initialiserCsrf } from "../services/api";
import { authContext } from "./AuthContext";

export function AuthProvider({ children }) {
  const [utilisateur, setUtilisateur] = useState(() => {
    try {
      const stored = localStorage.getItem("utilisateur");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [chargement, setChargement] = useState(false);
  const [erreur, setErreur] = useState(null);

  // Vérification de la session active au chargement
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
        // Ne déconnecte QUE si le serveur répond explicitement 401
        // (si le serveur est en cours de réveil ou problème réseau, on garde les données locales)
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

  const login = useCallback(async (email, password, matricule) => {
    setChargement(true);
    setErreur(null);
    try {
      await initialiserCsrf();
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
  }, []);

  const register = useCallback(async (form) => {
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
  }, []);

  const actualiserUtilisateur = useCallback(async () => {
    try {
      const { data } = await api.get("/moi");
      localStorage.setItem("utilisateur", JSON.stringify(data));
      setUtilisateur(data);
      return data;
    } catch {
      return null;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post("/logout");
    } catch {
      // Ignorer l'erreur réseau éventuelle lors du logout
    } finally {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("utilisateur");
      setUtilisateur(null);
    }
  }, []);

  const value = useMemo(
    () => ({
      utilisateur,
      login,
      register,
      logout,
      actualiserUtilisateur,
      chargement,
      erreur,
      setErreur,
    }),
    [utilisateur, login, register, logout, actualiserUtilisateur, chargement, erreur]
  );

  return (
    <authContext.Provider value={value}>
      {children}
    </authContext.Provider>
  );
}
