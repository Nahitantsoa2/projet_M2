import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";

const field =
  "w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/15";
const label =
  "mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500";

export default function Register() {
  const [form, setForm] = useState({
    nom: "",
    prenom: "",
    email: "",
    password: "",
    password_confirmation: "",
  });
  const [erreur, setErreur] = useState(null);
  const [envoi, setEnvoi] = useState(false);
  const navigate = useNavigate();

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
    if (form.password !== form.password_confirmation) {
      setErreur("Les mots de passe ne correspondent pas.");
      return;
    }

    setEnvoi(true);
    try {
      const { data } = await api.post("/register", form);

      if (data?.token) localStorage.setItem("token", data.token);
      if (data?.utilisateur)
        localStorage.setItem("utilisateur", JSON.stringify(data.utilisateur));

      navigate("/fonctionnaire", { replace: true });
    } catch (err) {
      const messages = err?.response?.data?.errors;
      setErreur(
        messages
          ? Object.values(messages).flat().join(" ")
          : err?.response?.data?.message ||
              "Une erreur est survenue lors de l'inscription."
      );
    } finally {
      setEnvoi(false);
    }
  }

  return (
    <main className="grid min-h-screen bg-slate-50 lg:grid-cols-[1.05fr_1fr]">
      <section className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-blue-800 to-sky-500 p-12 lg:flex">
        <span className="inline-flex w-fit items-center rounded-full border border-white/25 px-3 py-1 text-xs font-medium text-white/90">
          Espace Services
        </span>
        <div className="max-w-md">
          <h2 className="text-4xl font-semibold leading-tight text-white">
            Une administration connectée, un accès unique.
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-white/80">
            Gérez vos demandes, suivez vos dossiers et collaborez avec votre
            service depuis une plateforme sécurisée.
          </p>
        </div>
        <p className="text-xs text-white/70">
          © {new Date().getFullYear()} Espace Services
        </p>
      </section>

      <section className="flex items-center justify-center px-5 py-12">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-900/5"
        >
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Créer un compte
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-500">
            Réservé aux fonctionnaires — les comptes chef de service et
            administrateur sont créés par l'administration.
          </p>

          <div className="mt-7 grid gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="nom" className={label}>Nom</label>
                <input
                  id="nom"
                  name="nom"
                  value={form.nom}
                  onChange={handleChange}
                  required
                  className={field}
                />
              </div>
              <div>
                <label htmlFor="prenom" className={label}>Prénom</label>
                <input
                  id="prenom"
                  name="prenom"
                  value={form.prenom}
                  onChange={handleChange}
                  required
                  className={field}
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className={label}>Email</label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={handleChange}
                required
                className={field}
              />
            </div>

            <div>
              <label htmlFor="password" className={label}>Mot de passe</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                value={form.password}
                onChange={handleChange}
                required
                minLength={8}
                className={field}
              />
            </div>

            <div>
              <label htmlFor="password_confirmation" className={label}>
                Confirmer le mot de passe
              </label>
              <input
                id="password_confirmation"
                name="password_confirmation"
                type="password"
                autoComplete="new-password"
                value={form.password_confirmation}
                onChange={handleChange}
                required
                minLength={8}
                className={field}
              />
            </div>
          </div>

          {erreur && (
            <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {erreur}
            </p>
          )}

          <button
            type="submit"
            disabled={envoi}
            className="mt-6 w-full rounded-lg bg-gradient-to-r from-blue-700 to-sky-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {envoi ? "Création du compte..." : "Créer mon compte"}
          </button>

          <p className="mt-5 text-center text-sm text-slate-500">
            Déjà un compte ?{" "}
            <Link to="/login" className="font-medium text-blue-700 hover:underline">
              Se connecter
            </Link>
          </p>
        </form>
      </section>
    </main>
  );
}
