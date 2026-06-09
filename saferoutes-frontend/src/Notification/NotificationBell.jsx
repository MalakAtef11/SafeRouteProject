import { useEffect, useState } from "react";
import axios from "axios";
import "./notification.css";

export default function NotificationBell({ userId }) {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);

  // 🔥 جلب الإشعارات
  const fetchNotifications = async () => {
    try {
      const res = await axios.get(
        `https://corral-purple-tamer.ngrok-free.dev/api/v1/notifications/user/${userId}`
      );
      setNotifications(res.data);
    } catch (err) {
      console.error("❌ error fetching notifications", err);
    }
  };

  useEffect(() => {
    fetchNotifications();

    // 🔥 تحديث كل 5 ثواني
    const interval = setInterval(fetchNotifications, 5000);
    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  // ✅ mark as read
  const markAsRead = async (id) => {
    await axios.put(
      `https://corral-purple-tamer.ngrok-free.dev/api/v1/notifications/read/${id}`
    );

    setNotifications(prev =>
      prev.map(n => (n.notificationID === id ? { ...n, isRead: true } : n))
    );
  };

  // ❌ delete
  const deleteNotification = async (id) => {
    await axios.delete(
      `https://corral-purple-tamer.ngrok-free.dev/api/v1/notifications/${id}`
    );

    setNotifications(prev => prev.filter(n => n.notificationID !== id));
  };

  return (
    <div className="notif-container">
      <div className="bell" onClick={() => setOpen(!open)}>
        🔔
        {unreadCount > 0 && <span className="badge"></span>}
      </div>

      {open && (
        <div className="notif-dropdown">
          {notifications.length === 0 ? (
            <p>لا يوجد إشعارات</p>
          ) : (
            notifications.map((n) => (
              <div
                key={n.notificationID}
                className={`notif-item ${n.isRead ? "read" : "unread"}`}
              >
                <h4>{n.title}</h4>
                <p>{n.body}</p>

                <div className="actions">
                  {!n.isRead && (
                    <button onClick={() => markAsRead(n.notificationID)}>
                      ✅
                    </button>
                  )}

                  <button onClick={() => deleteNotification(n.notificationID)}>
                    ❌
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}