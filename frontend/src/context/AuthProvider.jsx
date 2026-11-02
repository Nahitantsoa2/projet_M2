import { useEffect, useState, useMemo, useCallback } from "react";
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
    api
      .get("/moi")
      .then(({ data }) => {
        if (annule) return;
        setUtilisateur(data);
        localStorage.setItem("utilisateur", JSON.stringify(data));
      })
      .catch(() => {
        if (!annule) {
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
      await initialiserCsrf();
      const { data } = await api.post("/login", { email, password, matricule });
      localStorage.setItem("utilisateur", JSON.stringify(data.utilisateur));
      setUtilisateur(data.utilisateur);
      return data.utilisateur;
    } catch (err) {
      setErreur(
        err.response?.data?.message || "Identifiants incorrects."
      );
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
      localStorage.removeItem("utilisateur");
      setUtilisateur(null);
    }
  }

  const value = useMemo(
    () => ({ utilisateur, login, logout, actualiserUtilisateur, chargement, erreur }),
    [utilisateur, chargement, erreur]
  );

  return (
    <authContext.Provider value={value}>
      {children}
    </authContext.Provider>
  );
}
