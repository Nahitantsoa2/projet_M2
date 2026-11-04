import { useEffect, useState, useRef, useCallback } from "react";
import api from "../services/api";
import { Bell, X, Trash2 } from "lucide-react";
import "../styles/notifications.css";

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [ouvert, setOuvert] = useState(false);
  const dropdownRef = useRef(null);

  const chargerNotifications = useCallback(() => {
<<<<<<< HEAD
    api.get("/notifications").then(({ data }) => setNotifications(data)).catch(console.error);
=======
    // Évite les requêtes inutiles si la fenêtre/l'onglet est en arrière-plan
    if (typeof document !== "undefined" && document.hidden) return;
    api
      .get("/notifications")
      .then(({ data }) => setNotifications(data))
      .catch(() => {});
>>>>>>> origin/main
  }, []);

  useEffect(() => {
    chargerNotifications();
<<<<<<< HEAD
    const intervalId = setInterval(() => chargerNotifications(), 30000);

=======
    const intervalId = setInterval(chargerNotifications, 60000); // 60s au lieu de 30s pour économiser les ressources

    function handleVisibilityChange() {
      if (!document.hidden) {
        chargerNotifications();
      }
    }
    document.addEventListener("visibilitychange", handleVisibilityChange);

>>>>>>> origin/main
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOuvert(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      clearInterval(intervalId);
    };
  }, [chargerNotifications]);

  const marquerLu = async (id) => {
    try {
      await api.patch(`/notifications/${id}/lu`);
      setNotifications((prev) =>
        prev.map(n => n.id_notification === id ? { ...n, lu: true } : n)
      );
    } catch (error) {
      console.error(error);
    }
  };

  const supprimer = async (id) => {
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications((prev) => prev.filter(n => n.id_notification !== id));
    } catch (error) {
      console.error(error);
    }
  };

  const nonLues = notifications.filter(n => !n.lu).length;

  return (
    <div className="notification-bell-container" ref={dropdownRef}>
      <button
        className="notification-bell-btn"
        onClick={() => setOuvert(!ouvert)}
        title="Notifications"
      >
        <Bell size={20} className="text-gray-500" />
        {nonLues > 0 && (
          <span className="notification-badge">
            {nonLues > 9 ? '9+' : nonLues}
          </span>
        )}
      </button>

      {ouvert && (
        <div className="notification-dropdown">
          <div className="notification-header">
            <h3>Notifications</h3>
            <div className="notification-header-actions">
              {nonLues > 0 && <span className="notification-count">{nonLues} non lue(s)</span>}
              <button
                type="button"
                className="notification-close-btn"
                onClick={() => setOuvert(false)}
                title="Fermer"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          <div className="notification-list">
            {notifications.length === 0 ? (
              <div className="notification-empty">
                <p>Aucune notification</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id_notification}
                  className={`notification-item ${!notif.lu ? 'unread' : ''}`}
                  onClick={() => {
                    if (!notif.lu) marquerLu(notif.id_notification);
                  }}
                >
                  <div className="notification-item-content">
                    <p className="notification-msg">{notif.message}</p>
                    <span className="notification-date">
                      {new Date(notif.date_envoi).toLocaleString('fr-FR')}
                    </span>
                  </div>
                  <button
                    type="button"
                    className="notification-delete-btn"
                    title="Effacer"
                    onClick={(e) => {
                      e.stopPropagation();
                      supprimer(notif.id_notification);
                    }}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
