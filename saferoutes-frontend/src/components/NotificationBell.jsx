import { useEffect, useState, useRef } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import "./notification.css";
import API_BASE from "../api/config";
import highSound from "../sounds/high.mp3";
import mediumSound from "../sounds/medium.mp3";
import lowSound from "../sounds/low.mp3";

const translations = {
  ar: {
    noNotifs: "لا يوجد إشعارات حالياً",
    markRead: "تمت القراءة",
    delete: "حذف",
    defaultTitle: "إشعار جديد"
  },
  en: {
    noNotifs: "No notifications currently",
    markRead: "Mark as read",
    delete: "Delete",
    defaultTitle: "New Notification"
  }
};

// Play real audio files based on priority
const playNotificationSound = (priority) => {
  try {
    let soundSrc = lowSound;
    if (priority === 'high') soundSrc = highSound;
    else if (priority === 'medium') soundSrc = mediumSound;
    
    const audio = new Audio(soundSrc);
    audio.play().catch(e => console.warn("Browser blocked audio playback:", e));
  } catch (e) {
    console.warn("Audio playback failed:", e);
  }
};

// Detect priority from notification title/body
const detectPriority = (title, body) => {
  const text = `${title} ${body}`.toLowerCase();
  if (text.includes('طارئ') || text.includes('عاجل') || text.includes('خطير') || text.includes('حريق') || text.includes('حادث') || text.includes('emergency') || text.includes('urgent')) return 'high';
  if (text.includes('متوسط') || text.includes('medium')) return 'medium';
  return 'low';
};

// Get icon for notification based on content (Elegant SVGs)
const getNotifIcon = (title, body) => {
  const text = `${title} ${body}`.toLowerCase();
  
  if (text.includes('طارئ') || text.includes('عاجل') || text.includes('خطير') || text.includes('حريق') || text.includes('emergency')) {
    return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>;
  }
  if (text.includes('حادث') || text.includes('سير')) {
    return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/></svg>;
  }
  if (text.includes('تم إسناد') || text.includes('assigned')) {
    return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/><path d="M9 14h6"/><path d="M9 18h6"/><path d="M9 10h.01"/></svg>;
  }
  if (text.includes('تحديث') || text.includes('تغيير') || text.includes('update')) {
    return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 2v6h-6"/><path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M3 22v-6h6"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/></svg>;
  }
  if (text.includes('تم استلام') || text.includes('received') || text.includes('حل') || text.includes('resolved')) {
    return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>;
  }
  if (text.includes('بلاغ جديد') || text.includes('new report')) {
    return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0ea5e9" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>;
  }
  if (text.includes('رفض') || text.includes('rejected')) {
    return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>;
  }
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>;
};

export default function NotificationBell({ userId }) {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const [lang, setLang] = useState(document.documentElement.dir === "rtl" ? "ar" : "en");
  const [isMuted, setIsMuted] = useState(() => {
    return localStorage.getItem("notifMuted") === "true";
  });
  const prevCountRef = useRef(0);

  // مراقبة تغيير اللغة لتعديل الاتجاه فوراً
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setLang(document.documentElement.dir === "rtl" ? "ar" : "en");
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["dir"] });
    return () => observer.disconnect();
  }, []);

  const t = translations[lang];

  const toggleMute = () => {
    const nextVal = !isMuted;
    setIsMuted(nextVal);
    localStorage.setItem("notifMuted", nextVal);
  };

  const fetchNotifications = async () => {
    if (!userId) return;
    try {
      const res = await axios.get(`${API_BASE}/Notifications/user/${userId}`);
      const newNotifs = res.data;
      
      // Play sound and show toast if there are NEW unread notifications
      const newUnread = newNotifs.filter(n => !n.isRead).length;
      if (newUnread > prevCountRef.current && prevCountRef.current >= 0) {
        // Find the newest notification to determine priority and show toast
        const latest = newNotifs.find(n => !n.isRead);
        if (latest) {
          const priority = detectPriority(latest.title, latest.body);
          const icon = getNotifIcon(latest.title, latest.body);
          
          // Only play sound if user is a Sector (القطاعات) and not muted
          const userType = localStorage.getItem("userType");
          if ((userType === "Sector" || localStorage.getItem("sectorId")) && !isMuted) {
            playNotificationSound(priority);
          }
          
          // Show beautiful custom toast
          toast.custom((t_obj) => (
            <div className={`${t_obj.visible ? 'animate-enter' : 'animate-leave'}`} style={{
              maxWidth: '350px', width: '100%', background: 'var(--surface, #fff)', 
              boxShadow: '0 10px 25px rgba(0,0,0,0.1)', borderRadius: '12px', 
              pointerEvents: 'auto', display: 'flex', border: '1px solid var(--border-color, #eee)',
              borderRight: lang === 'ar' ? `4px solid ${priority === 'high' ? '#ef4444' : priority === 'medium' ? '#f59e0b' : '#22c55e'}` : 'none',
              borderLeft: lang === 'en' ? `4px solid ${priority === 'high' ? '#ef4444' : priority === 'medium' ? '#f59e0b' : '#22c55e'}` : 'none',
              position: 'relative'
            }}>
              {/* Close Button */}
              <button 
                onClick={() => toast.dismiss(t_obj.id)} 
                style={{
                  position: 'absolute',
                  top: '8px',
                  [lang === 'ar' ? 'left' : 'right']: '8px',
                  background: 'transparent',
                  border: 'none',
                  fontSize: '18px',
                  cursor: 'pointer',
                  color: 'var(--muted, #888)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  lineHeight: 1,
                  padding: 0,
                  transition: 'background 0.2s, color 0.2s',
                  zIndex: 10
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(0,0,0,0.05)';
                  e.currentTarget.style.color = '#ef4444';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'var(--muted, #888)';
                }}
              >
                ×
              </button>

              <div style={{ padding: '16px', display: 'flex', alignItems: 'flex-start', width: '100%', gap: '12px', flexDirection: lang === 'ar' ? 'row' : 'row-reverse' }}>
                <div style={{ flex: 1, textAlign: lang === 'ar' ? 'right' : 'left', [lang === 'ar' ? 'paddingLeft' : 'paddingRight']: '20px' }}>
                  <p style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: '800', color: 'var(--text-color)' }}>
                    {latest.title || t.defaultTitle}
                  </p>
                  <p style={{ margin: 0, fontSize: '13px', color: 'var(--muted)', lineHeight: '1.4' }}>
                    {latest.body}
                  </p>
                </div>
                <div style={{ 
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'var(--bg-body, #f8fafc)', padding: '10px', borderRadius: '50%',
                  boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)'
                }}>
                  {icon}
                </div>
              </div>
            </div>
          ), { duration: 5000 });
        }
      }
      prevCountRef.current = newUnread;
      
      setNotifications(newNotifs);
    } catch (err) {
      console.error("❌ Error fetching notifications:", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 5000);
    return () => clearInterval(interval);
  }, [userId, isMuted]); // Added isMuted to trigger reload/re-bind if needed

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markAsRead = async (id) => {
    try {
      await axios.put(`${API_BASE}/Notifications/read/${id}`);
      setNotifications(prev =>
        prev.map(n => (n.notificationID === id ? { ...n, isRead: true } : n))
      );
      prevCountRef.current = Math.max(0, prevCountRef.current - 1);
    } catch (err) { console.error(err); }
  };

  const deleteNotification = async (id) => {
    try {
      await axios.delete(`${API_BASE}/Notifications/${id}`);
      const was = notifications.find(n => n.notificationID === id);
      if (was && !was.isRead) prevCountRef.current = Math.max(0, prevCountRef.current - 1);
      setNotifications(prev => prev.filter(n => n.notificationID !== id));
    } catch (err) { console.error(err); }
  };

  return (
    <div className="notif-container" style={{ position: "relative" }}>
      {/* ── Bell Icon ── */}
      <div 
        className="bell" 
        onClick={() => setOpen(!open)}
        style={{ cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
        </svg>

        {unreadCount > 0 && (
          <span style={{
            position: "absolute",
            top: "-5px",
            right: lang === "ar" ? "auto" : "-5px",
            left: lang === "ar" ? "-5px" : "auto",
            minWidth: "18px",
            height: "18px",
            backgroundColor: "#ef4444",
            borderRadius: "99px",
            border: "2px solid var(--bg-card, white)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "10px",
            fontWeight: "900",
            color: "#fff",
            padding: "0 4px"
          }}>{unreadCount}</span>
        )}
      </div>

      {/* ── Dropdown ── */}
      {open && (
        <div className={`notif-dropdown ${lang === "ar" ? "rtl" : "ltr"}`} style={{ display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
          {/* Header with sound mute toggle */}
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "10px 12px",
            borderBottom: "1px solid var(--border-color, #eee)",
            background: "var(--bg-body, rgba(0,0,0,0.02))"
          }}>
            <span style={{ fontWeight: "800", fontSize: "13px", color: "var(--text-color)" }}>
              {lang === "ar" ? "الإشعارات" : "Notifications"}
            </span>
            <button 
              onClick={toggleMute}
              title={lang === "ar" ? (isMuted ? "تفعيل صوت الإنذار" : "كتم صوت الإنذار") : (isMuted ? "Unmute alarm sound" : "Mute alarm sound")}
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "5px",
                fontSize: "11px",
                color: isMuted ? "#ef4444" : "#22c55e",
                fontWeight: "700",
                padding: "4px 8px",
                borderRadius: "6px",
                transition: "0.2s",
                lineHeight: 1
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = "rgba(0,0,0,0.05)"}
              onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
            >
              {isMuted ? (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M11 5L6 9H2v6h4l5 4V5z"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>
                  <span>{lang === "ar" ? "صوت مكتوم" : "Alerts Muted"}</span>
                </>
              ) : (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
                  <span>{lang === "ar" ? "صوت نشط" : "Alerts On"}</span>
                </>
              )}
            </button>
          </div>

          <div className="custom-scrollbar" style={{ overflowY: 'auto', maxHeight: '350px', padding: '6px' }}>
            {notifications.length === 0 ? (
              <p style={{ textAlign: "center", padding: "20px", margin: 0, color: "var(--muted)", fontSize: "14px" }}>
                {t.noNotifs}
              </p>
            ) : (
              notifications.map((n) => {
                const icon = getNotifIcon(n.title, n.body);
                const priority = detectPriority(n.title, n.body);
                const priorityColor = priority === 'high' ? '#ef4444' : priority === 'medium' ? '#f59e0b' : '#22c55e';
                
                return (
                  <div 
                    key={n.notificationID} 
                    className={`notif-item ${n.isRead ? "read" : "unread"}`} 
                    style={{ 
                      padding: "12px", 
                      borderBottom: "1px solid var(--border-color, #eee)", 
                      display: "flex", 
                      flexDirection: lang === "ar" ? "row" : "row-reverse",
                      justifyContent: "space-between", 
                      alignItems: "center",
                      gap: "10px",
                      borderRadius: "10px",
                      marginBottom: "4px",
                      borderRight: lang === "ar" ? `3px solid ${priorityColor}` : "none",
                      borderLeft: lang === "ar" ? "none" : `3px solid ${priorityColor}`,
                      background: !n.isRead ? `linear-gradient(135deg, ${priorityColor}08, transparent)` : 'transparent'
                    }}
                  >
                    {/* الأزرار */}
                    <div style={{ display: "flex", gap: "5px" }}>
                      <button title={t.delete} onClick={() => deleteNotification(n.notificationID)} style={{ background: "transparent", border: "none", cursor: "pointer", padding: "5px", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "50%", transition: "0.2s", color: "var(--muted)", fontSize: 14 }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                      </button>
                      {!n.isRead && (
                        <button title={t.markRead} onClick={() => markAsRead(n.notificationID)} style={{ background: "transparent", border: "none", cursor: "pointer", padding: "5px", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "50%", transition: "0.2s", color: "#22c55e", fontSize: 14 }}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                        </button>
                      )}
                    </div>

                    {/* النص */}
                    <div style={{ flex: 1, textAlign: lang === "ar" ? "right" : "left" }}>
                      <h4 style={{ margin: "0 0 4px 0", fontSize: "14px", fontWeight: "700", color: "var(--text-color)", display: 'flex', alignItems: 'center', gap: 8, justifyContent: lang === 'ar' ? 'flex-end' : 'flex-start' }}>
                        {n.title || t.defaultTitle} 
                        <span style={{ 
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          background: 'var(--surface, #fff)', padding: '6px', borderRadius: '50%',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
                        }}>
                          {icon}
                        </span>
                      </h4>
                      <p style={{ margin: 0, fontSize: "12px", color: "var(--muted)", lineHeight: "1.4" }}>
                        {n.body}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}