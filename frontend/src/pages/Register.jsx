import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api, { initialiserCsrf } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { ArrowRight, HelpCircle } from "lucide-react";
import "../styles/auth.css";

const STATUTS = [
  {
    titre: "Demande n° 4521",
    detail: "Autorisation de voyage · 12/10",
    etat: "Validée",
    variante: "ok",
  },
  {
    titre: "Dossier suivi n° 1002",
    detail: "Actes administratifs · 15/10",
    etat: "En cours",
    variante: "wait",
  },
  {
    titre: "Réclamation n° 88",
    detail: "Réponse du service · 15/10",
    etat: "Répondue",
    variante: "info",
  },
];

export default function Register() {
  const [form, setForm] = useState({
    nom: "",
    prenom: "",
    email: "",
    matricule: "",
    password: "",
    password_confirmation: "",
  });
  const [voirMdp, setVoirMdp] = useState(false);
  const [erreur, setErreur] = useState(null);
  const [envoi, setEnvoi] = useState(false);
  const navigate = useNavigate();
  const { register } = useAuth();

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErreur(null);

    if (form.password.length < 8) {
      setErreur("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }
    if (!/[A-Za-z]/.test(form.password) || !/[0-9]/.test(form.password)) {
      setErreur("Le mot de passe doit contenir au moins une lettre et un chiffre.");
      return;
    }
    if (form.password !== form.password_confirmation) {
      setErreur("Les mots de passe ne correspondent pas.");
      return;
    }

    setEnvoi(true);
    try {
      await register(form);
      navigate("/fonctionnaire", { replace: true });
    } catch (err) {
      const messages = err?.response?.data?.errors;
      const apiMessage = err?.response?.data?.message;
      const networkErreur = !err.response
        ? "Impossible de contacter le serveur backend. Vérifiez que l'API est démarrée."
        : null;

      setErreur(
        networkErreur ||
        (messages ? Object.values(messages).flat().join(" ") : null) ||
        apiMessage ||
        "Une erreur est survenue lors de l'inscription."
      );
    } finally {
      setEnvoi(false);
    }
  }

  return (
    <main className="auth-page">
      {/* Colonne gauche — présentation */}
      <section className="auth-brand">
        <div className="auth-brand-content">
          <span className="auth-brand-label">Espace Services</span>

          <h1>Tous vos dossiers, au même endroit.</h1>

          <p className="auth-brand-sub">
            Suivez vos démarches en temps réel, posez vos questions à
            l'assistant IA et recevez des alertes instantanées.
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

      {/* Colonne droite — inscription */}
      <section className="auth-form-section">
        <div className="auth-card">
          <header className="auth-card-header">
            <h2>Créer un compte</h2>
            <p>Réservé aux fonctionnaires de l'administration.</p>
          </header>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="auth-form-grid">
              <div className="auth-field">
                <label htmlFor="nom">Nom</label>
                <div className="auth-input-wrapper">
                  <input
                    id="nom"
                    name="nom"
                    value={form.nom}
                    onChange={handleChange}
                    placeholder="Rakoto"
                    required
                    autoComplete="family-name"
                  />
                </div>
              </div>

              <div className="auth-field">
                <label htmlFor="prenom">Prénom</label>
                <div className="auth-input-wrapper">
                  <input
                    id="prenom"
                    name="prenom"
                    value={form.prenom}
                    onChange={handleChange}
                    placeholder="Jean"
                    required
                    autoComplete="given-name"
                  />
                </div>
              </div>
            </div>

            <div className="auth-field">
              <label htmlFor="email">Adresse email</label>
              <div className="auth-input-wrapper">
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="vous@exemple.com"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="auth-field">
              <label htmlFor="matricule">
                IM (matricule) <span>(facultatif)</span>
              </label>
              <div className="auth-input-wrapper">
                <input
                  id="matricule"
                  name="matricule"
                  type="text"
                  value={form.matricule}
                  onChange={handleChange}
                  placeholder="Ex : 482296"
                  autoComplete="off"
                />
              </div>
              <p className="auth-field-hint">
                Requis si votre compte possède un IM — permet d'afficher vos
                dossiers.
              </p>
            </div>

            <div className="auth-field">
              <label htmlFor="password">Mot de passe</label>
              <div className="auth-input-wrapper auth-input-wrapper--toggle">
                <input
                  id="password"
                  name="password"
                  type={voirMdp ? "text" : "password"}
                  value={form.password}
                  onChange={handleChange}
                  placeholder="8 caractères minimum"
                  required
                  minLength={8}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="auth-toggle-password"
                  onClick={() => setVoirMdp(!voirMdp)}
                  aria-pressed={voirMdp}
                >
                  {voirMdp ? "Masquer" : "Afficher"}
                </button>
              </div>
            </div>

            <div className="auth-field">
              <label htmlFor="password_confirmation">
                Confirmer le mot de passe
              </label>
              <div className="auth-input-wrapper">
                <input
                  id="password_confirmation"
                  name="password_confirmation"
                  type={voirMdp ? "text" : "password"}
                  value={form.password_confirmation}
                  onChange={handleChange}
                  placeholder="Retapez le mot de passe"
                  required
                  minLength={8}
                  autoComplete="new-password"
                />
              </div>
            </div>

            {erreur && (
              <div className="auth-error" role="alert">
                <span className="auth-error-dot" />
                {erreur}
              </div>
            )}

            <button type="submit" className="auth-submit" disabled={envoi}>
              {envoi ? (
                <span className="auth-loading">
                  <span className="auth-spinner" />
                  Création du compte...
                </span>
              ) : (
                <>
                  Créer mon compte
                  <ArrowRight size={18} strokeWidth={2} />
                </>
              )}
            </button>
          </form>

          <p className="auth-footer">
            Déjà un compte ? <Link to="/login">Se connecter</Link>
          </p>

          <p className="auth-help">
            <HelpCircle size={14} strokeWidth={2} />
            <span>Besoin d'aide ? Contactez votre service informatique.</span>
          </p>
        </div>
      </section>
    </main>
  );
}
