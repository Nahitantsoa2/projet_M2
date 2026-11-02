import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { REDIRECTIONS_ROLE } from "../constants/roles";
import { ArrowRight, HelpCircle } from "lucide-react";
import "../styles/auth.css";

const STATUTS = [
  {
    titre: "Demande n° 4521",
    detail: "Autorisation de voyage · déposée le 12/10",
    etat: "Validée",
    variante: "ok",
  },
  {
    titre: "Dossier n° 1002",
    detail: "Actes administratifs · en attente d'avis",
    etat: "En cours",
    variante: "wait",
  },
  {
    titre: "Réclamation n° 88",
    detail: "Réponse envoyée par votre service",
    etat: "Répondue",
    variante: "info",
  },
];

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [matricule, setMatricule] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { login, chargement, erreur } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const utilisateur = await login(email, password, matricule);
      navigate(REDIRECTIONS_ROLE[utilisateur.role] || "/");
    } catch {
      // l'erreur est déjà affichée via le contexte
    }
  }

  return (
    <main className="auth-page">
      {/* Colonne gauche — présentation */}
      <section className="auth-brand">
        <div className="auth-brand-content">
          <span className="auth-brand-label">Espace Services</span>

          <h1>Ici, vous savez toujours où en est votre dossier.</h1>

          <p className="auth-brand-sub">
            Déposez votre demande, suivez son avancement et recevez un message
            dès qu'un agent s'en occupe. Plus besoin de relancer par téléphone.
          </p>

          <div className="auth-status-list">
            {STATUTS.map((statut) => (
              <article className="auth-status" key={statut.titre}>
                <div>
                  <p className="auth-status-title">{statut.titre}</p>
                  <p className="auth-status-sub">{statut.detail}</p>
                </div>
                <span className={`auth-badge auth-badge--${statut.variante}`}>
                  {statut.etat}
                </span>
              </article>
            ))}
          </div>
        </div>

        <p className="auth-brand-footer">
          © {new Date().getFullYear()} Espace Services — Tous droits réservés
        </p>
      </section>

      {/* Colonne droite — connexion */}
      <section className="auth-form-section">
        <div className="auth-card">
          <header className="auth-card-header">
            <h2>Connexion</h2>
            <p>Retrouvez vos dossiers et les messages de vos agents.</p>
          </header>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="auth-field">
              <label htmlFor="email">Adresse email</label>
              <div className="auth-input-wrapper">
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="vous@exemple.com"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="auth-field">
              <label htmlFor="password">Mot de passe</label>
              <div className="auth-input-wrapper auth-input-wrapper--toggle">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Votre mot de passe"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="auth-toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-pressed={showPassword}
                >
                  {showPassword ? "Masquer" : "Afficher"}
                </button>
              </div>
            </div>

            <div className="auth-field">
              <label htmlFor="matricule">IM (matricule)</label>
              <div className="auth-input-wrapper">
                <input
                  id="matricule"
                  name="matricule"
                  type="text"
                  value={matricule}
                  onChange={(e) => setMatricule(e.target.value)}
                  placeholder="Ex : 482296"
                  autoComplete="off"
                />
              </div>
              <p className="auth-field-hint">
                Requis si votre compte possède un IM — permet d'afficher vos
                dossiers.
              </p>
            </div>

            {erreur && (
              <div className="auth-error" role="alert">
                <span className="auth-error-dot" />
                {erreur}
              </div>
            )}

            <button type="submit" className="auth-submit" disabled={chargement}>
              {chargement ? (
                <span className="auth-loading">
                  <span className="auth-spinner" />
                  Connexion...
                </span>
              ) : (
                <>
                  Se connecter
                  <ArrowRight size={18} strokeWidth={2} />
                </>
              )}
            </button>
          </form>

          <p className="auth-footer">
            Pas encore de compte ?{" "}
            <Link to="/register">Créer un compte</Link>
          </p>

          <p className="auth-help">
            <HelpCircle size={14} strokeWidth={2} />
            <span>
              Une question sur votre compte ? Votre service informatique peut
              vous aider.
            </span>
          </p>
        </div>
      </section>
    </main>
  );
}
