import { useEffect, useRef, useState } from "react";
import { Settings, Sun, Moon, LogOut, Mail, Hash, Building2, User } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { libelleRole, COULEURS_ROLE } from "../constants/roles";

function InfoRow({ icon, label, value }) {
  if (!value) return null;
  return (
    <p className="flex items-center gap-2 text-xs text-gray-500 dark:text-surface-400">
      <span className="text-gray-400 dark:text-surface-500 flex-shrink-0">{icon}</span>
      {label && <span className="text-gray-400 dark:text-surface-500">{label} :</span>}
      <span className="truncate">{value}</span>
    </p>
  );
}

export default function SettingsMenu() {
  const { utilisateur, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const [ouvert, setOuvert] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (ref.current && !ref.current.contains(event.target)) {
        setOuvert(false);
      }
    }
    function handleEscape(event) {
      if (event.key === "Escape") setOuvert(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOuvert((v) => !v)}
        title="Paramètres"
        aria-label="Paramètres"
        aria-expanded={ouvert}
        className="relative w-10 h-10 flex items-center justify-center rounded-xl text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-all dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800"
      >
        <Settings
          size={20}
          className={`transition-transform duration-300 ${ouvert ? "rotate-90" : "rotate-0"}`}
        />
      </button>

      {ouvert && (
        <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-surface-800 rounded-2xl shadow-xl border border-gray-100 dark:border-surface-700 overflow-hidden z-50">
          {/* Mon profil */}
          <div className="px-4 py-3 border-b border-gray-100 dark:border-surface-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                {utilisateur?.prenom ? utilisateur.prenom.charAt(0).toUpperCase() : <User size={18} />}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                  {utilisateur?.prenom} {utilisateur?.nom}
                </p>
                {utilisateur?.role && (
                  <span
                    className={`inline-block mt-0.5 text-[10px] font-semibold px-2 py-0.5 rounded-full ${COULEURS_ROLE[utilisateur.role] ?? ""}`}
                  >
                    {libelleRole(utilisateur.role)}
                  </span>
                )}
              </div>
            </div>

            <div className="mt-3 space-y-1.5">
              <InfoRow icon={<Mail size={13} />} value={utilisateur?.email} />
              <InfoRow icon={<Hash size={13} />} label="IM" value={utilisateur?.matricule} />
              <InfoRow
                icon={<Building2 size={13} />}
                value={utilisateur?.service?.nom_service}
              />
            </div>
          </div>

          {/* Thème */}
          <button
            onClick={toggleTheme}
            className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-surface-700 transition-colors"
          >
            <span className="flex items-center gap-2.5">
              {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
              Thème {isDarkMode ? "clair" : "sombre"}
            </span>
            <span
              className={`w-9 h-5 rounded-full relative transition-colors ${isDarkMode ? "bg-blue-600" : "bg-gray-300"}`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${isDarkMode ? "translate-x-4" : "translate-x-0"}`}
              />
            </span>
          </button>

          {/* Déconnexion */}
          <button
            onClick={logout}
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors border-t border-gray-100 dark:border-surface-700"
          >
            <LogOut size={16} />
            Déconnexion
          </button>
        </div>
      )}
    </div>
  );
}
