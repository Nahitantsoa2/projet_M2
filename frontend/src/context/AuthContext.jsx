import { createContext, useContext, useState } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [utilisateur, setUtilisateur] = useState(() => {
    const stored = localStorage.getItem("utilisateur");
    return stored ? JSON.parse(stored) : null;
  });
  const [chargement, setChargement] = useState(false);
  const [erreur, setErreur] = useState(null);

  async function login(email, password) {
    setChargement(true);
    setErreur(null);
    try {
      const { data } = await api.post("/login", { email, password });
      localStorage.setItem("token", data.token);
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

  async function logout() {
    try {
      await api.post("/logout");
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("utilisateur");
      setUtilisateur(null);
    }
  }

  return (
    <AuthContext.Provider
      value={{ utilisateur, login, logout, chargement, erreur }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
