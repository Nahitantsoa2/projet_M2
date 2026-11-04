import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import NotificationBell from "./NotificationBell";
import SettingsMenu from "./SettingsMenu";

export default function AppHeader({
  icon,
  iconClass = "from-slate-600 to-slate-500 shadow-slate-500/20",
  title,
  subtitle,
  onBack,
  extra,
  maxWidth = "max-w-7xl",
  titleClass = "text-sm",
}) {
  const navigate = useNavigate();

  return (
    <header className="bg-white dark:bg-surface-800 shadow-sm border-b border-gray-200 dark:border-surface-700 sticky top-0 z-40">
      <div
        className={`${maxWidth} mx-auto px-4 sm:px-6 lg:px-8 min-h-16 py-2 flex flex-wrap items-center justify-between gap-2`}
      >
        <div className="flex items-center gap-3 min-w-0">
          {onBack && (
            <button
              onClick={onBack ?? (() => navigate(-1))}
              aria-label="Retour"
              title="Retour"
              className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-surface-700 transition-all"
            >
              <ArrowLeft size={20} />
            </button>
          )}
          <div className="flex items-center gap-2.5 min-w-0">
            {icon && (
              <div
                className={`w-10 h-10 rounded-xl bg-gradient-to-br ${iconClass} flex items-center justify-center text-white shadow-lg flex-shrink-0`}
              >
                {icon}
              </div>
            )}
            <div className="min-w-0">
              <h1
                className={`${titleClass} font-bold text-gray-900 dark:text-white leading-tight truncate`}
              >
                {title}
              </h1>
              {subtitle && (
                <div className="text-xs text-gray-500 dark:text-surface-400">
                  {subtitle}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-end">
          {extra}
          <NotificationBell />
          <SettingsMenu />
        </div>
      </div>
    </header>
  );
}
