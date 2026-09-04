import { useEffect, useState, useRef } from "react";
import api from "../services/api";
import { Bell } from "lucide-react";
import "../styles/notifications.css";

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [ouvert, setOuvert] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    chargerNotifications();

    // Actualiser les notifications toutes les 30 secondes
    const intervalId = setInterval(() => {
      chargerNotifications();
    }, 30000);

    // Fermer le dropdown si on clique en dehors
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOuvert(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      clearInterval(intervalId);
    };
  }, []);

  const chargerNotifications = () => {
    api.get("/notifications").then(({ data }) => {
      setNotifications(data);
    }).catch(console.error);
  };

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

  const nonLues = notifications.filter(n => !n.lu).length;

  return (
    <div className="notification-bell-container" ref={dropdownRef}>
      <button
        className="notification-bell-btn"
        onClick={() => setOuvert(!ouvert)}
        title="Notifications"
      >
        <Bell size={24} color="#ffffff" />
        {nonLues > 0 && <span className="notification-badge">{nonLues}</span>}
      </button>

      {ouvert && (
        <div className="notification-dropdown">
          <div className="notification-header">
            <h3>Notifications</h3>
            {nonLues > 0 && <span className="notification-count">{nonLues} non lue(s)</span>}
          </div>

          <div className="notification-list">
            {notifications.length === 0 ? (
              <p className="notification-empty">Aucune notification.</p>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id_notification}
                  className={`notification-item ${!notif.lu ? 'unread' : ''}`}
                  onClick={() => {
                    if (!notif.lu) marquerLu(notif.id_notification);
                  }}
                >
                  <p className="notification-msg">{notif.message}</p>
                  <span className="notification-date">
                    {new Date(notif.date_envoi).toLocaleString('fr-FR')}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
