import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Login.css";

const REDIRECTIONS = {
  fonctionnaire: "/fonctionnaire",
  chef_service: "/chef",
  administrateur: "/admin",
};

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, chargement, erreur } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const utilisateur = await login(email, password);
      navigate(REDIRECTIONS[utilisateur.role] || "/");
    } catch {
      // l'erreur est déjà affichée via le contexte
    }
  }

  return (
    <div className="login-page">
      <form className="login-card" onSubmit={handleSubmit}>
        <h1>Connexion</h1>
        <p className="login-subtitle">
          Système d'assistance aux démarches administratives
        </p>

        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="vous@administration.mg"
          required
        />

        <label htmlFor="password">Mot de passe</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
        />

        {erreur && <p className="login-error">{erreur}</p>}

        <button type="submit" disabled={chargement}>
          {chargement ? "Connexion..." : "Se connecter"}
        </button>
        
        <p style={{ marginTop: "15px", textAlign: "center" }}>
          Vous n'avez pas de compte ?{" "}
          <Link to="/register" style={{ color: "var(--primary-color)", textDecoration: "none" }}>
            Créer un compte
          </Link>
        </p>
      </form>
    </div>
  );
}
