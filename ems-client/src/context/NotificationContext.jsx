import { createContext, useContext, useEffect, useState } from "react";

const NotificationContext = createContext({
  notifications: [],
  unreadCount: 0,
  addNotification: () => {},
  markAllRead: () => {},
  markOneRead: () => {},
});

const API_BASE = "http://localhost:8000";

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  useEffect(() => {
    async function loadNotifications() {
      try {
        const res = await fetch(`${API_BASE}/api/notifications`, {
          credentials: "include",
        });
        if (!res.ok) throw new Error("Failed to load notifications");
        const data = await res.json();

        const normalized = (Array.isArray(data) ? data : []).map((n) => ({
          ...n,
          isRead: n.isRead === true || n.isRead === 1 || n.isRead === "1",
        }));

        setNotifications(normalized);
      } catch (err) {
        console.error("Notifications error:", err);
        setNotifications([]);
      }
    }
    loadNotifications();
  }, []);
  
  const addNotification = (notif) => {
    setNotifications((prev) => [
      {
        id: Date.now(),
        isRead: false,
        createdAt: new Date().toISOString(),
        ...notif,
      },
      ...prev,
    ]);
  };

  const markAllRead = async () => {
    try {
      await fetch(`${API_BASE}/api/notifications/mark-all-read`, {
        method: "POST",
        credentials: "include",
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error("Mark all read error:", err);
    }
  };

  const markOneRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  return (
    <NotificationContext.Provider
      value={{ notifications, unreadCount, addNotification, markAllRead, markOneRead }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useNotifications = () => useContext(NotificationContext);

