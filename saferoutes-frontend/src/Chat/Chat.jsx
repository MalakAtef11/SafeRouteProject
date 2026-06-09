import React, { useState, useEffect, useRef } from "react";
import logo from "../Login-Register/logo.png";
import NotificationBell from "../components/NotificationBell";
import toast, { Toaster } from "react-hot-toast";
import API from "../api/api.js";
import "./Chat.css";

const translations = {
  ar: {
    home: "الرئيسية",
    dashboard: "لوحة التحكم",
    reports: "البلاغات",
    reportNow: "أبلغ الآن",
    myReports: "بلاغاتي",
    profile: "ملفي",
    analytics: "الإحصائيات",
    citizensDir: "دليل المواطنين",
    messages: "الدردشات",
    logout: "خروج",
    logoutMenu: "تسجيل الخروج",
    conversationsTitle: "المحادثات النشطة",
    startChatBtn: "بدء محادثة جديدة",
    selectSectorPlaceholder: "اختر ممثل القطاع لبدء المحادثة...",
    noConversations: "لا توجد محادثات نشطة حالياً. ابدأ محادثة جديدة للتواصل.",
    typeMessagePlaceholder: "اكتب رسالتك هنا...",
    sendBtn: "إرسال",
    selectUserChat: "الرجاء اختيار مستخدم من القائمة لبدء الدردشة.",
    loadingConversations: "جاري تحميل المحادثات...",
    chattingWith: "المحادثة مع:",
    citizenLabel: "مواطن",
    sectorLabel: "ممثل قطاع",
    backBtn: "رجوع",
    attachReport: "اختر بلاغاً للإشارة إليه",
    loadingReports: "جاري تحميل البلاغات...",
    noReportsForCitizen: "لا توجد بلاغات لهذا المواطن في قطاعك",
    reportPickerTitle: "بلاغات المواطن في قطاعك"
  },
  en: {
    home: "Home",
    dashboard: "Dashboard",
    reports: "Reports",
    reportNow: "Report Now",
    myReports: "My Reports",
    profile: "Profile",
    analytics: "Analytics",
    citizensDir: "Citizens Directory",
    messages: "Chats",
    logout: "Logout",
    logoutMenu: "Log Out",
    conversationsTitle: "Active Chats",
    startChatBtn: "Start New Chat",
    selectSectorPlaceholder: "Choose sector representative...",
    noConversations: "No active chats found. Start a new one to communicate.",
    typeMessagePlaceholder: "Type your message here...",
    sendBtn: "Send",
    selectUserChat: "Please select a user from the list to start chatting.",
    loadingConversations: "Loading conversations...",
    chattingWith: "Chatting with:",
    citizenLabel: "Citizen",
    sectorLabel: "Sector Rep",
    backBtn: "Back",
    attachReport: "Attach a Report",
    loadingReports: "Loading reports...",
    noReportsForCitizen: "No reports from this citizen in your sector",
    reportPickerTitle: "Citizen's Reports in Your Sector"
  }
};

export default function Chat() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dark, setDark] = useState(localStorage.getItem('theme') === 'dark');
  const [lang, setLang] = useState(localStorage.getItem('lang') || 'ar');

  const [conversations, setConversations] = useState([]);
  const [activeUser, setActiveUser] = useState(null); // The other user in the active chat
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [contacts, setContacts] = useState([]); // Sector representatives list for citizens
  const [showStartChat, setShowStartChat] = useState(false);
  const [loadingConv, setLoadingConv] = useState(true);

  const [activeReportId, setActiveReportId] = useState(null);
  const [activeReportTitle, setActiveReportTitle] = useState(null);

  // Report picker (Sector only)
  const [showReportPicker, setShowReportPicker] = useState(false);
  const [citizenReports, setCitizenReports] = useState([]);
  const [loadingReports, setLoadingReports] = useState(false);

  const sectorId = localStorage.getItem("sectorId");

  const messagesEndRef = useRef(null);
  const userId = localStorage.getItem("userId");
  const userType = localStorage.getItem("userType");
  const t = translations[lang];

  useEffect(() => {
    if (!userId) {
      window.location.href = "/login";
      return;
    }

    // Check if redirecting from Citizens Directory to chat with a specific user
    const preselectedUserId = localStorage.getItem("chatWithUserId");
    const preselectedUserName = localStorage.getItem("chatWithUserName");
    if (preselectedUserId) {
      setActiveUser({
        userId: Number(preselectedUserId),
        fullName: preselectedUserName || "User"
      });
      localStorage.removeItem("chatWithUserId");
      localStorage.removeItem("chatWithUserName");

      // Check for report context
      const preselectedReportId = localStorage.getItem("chatReportId");
      const preselectedReportTitle = localStorage.getItem("chatReportTitle");
      if (preselectedReportId) {
        setActiveReportId(preselectedReportId);
        setActiveReportTitle(preselectedReportTitle);
        
        const prefix = lang === 'ar' 
          ? `بخصوص البلاغ رقم #${preselectedReportId} (${preselectedReportTitle}): `
          : `Regarding report #${preselectedReportId} (${preselectedReportTitle}): `;
        setMessageText(prefix);

        localStorage.removeItem("chatReportId");
        localStorage.removeItem("chatReportTitle");
      }
    }

    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll, { passive: true });

    loadConversations();
    if (userType === "Citizen") {
      loadContacts();
    }

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (dark) document.body.classList.add("dark");
    else document.body.classList.remove("dark");
    localStorage.setItem('theme', dark ? 'dark' : 'light');
    localStorage.setItem('lang', lang);
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  }, [dark, lang]);

  // Periodically fetch chat history of the active conversation and conversations list
  useEffect(() => {
    if (!activeUser) return;
    loadChatHistory();
    const interval = setInterval(() => {
      loadChatHistory();
      loadConversations();
    }, 4000);
    return () => clearInterval(interval);
  }, [activeUser]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadConversations = async () => {
    try {
      const res = await fetch(`${API}/Messages/conversations?userId=${userId}`);
      if (res.ok) {
        const data = await res.json();
        setConversations(data);
      }
    } catch (e) {
      console.error("Error fetching conversations:", e);
    } finally {
      setLoadingConv(false);
    }
  };

  const loadContacts = async () => {
    try {
      const res = await fetch(`${API}/Messages/contacts`);
      if (res.ok) {
        const data = await res.json();
        setContacts(data);
      }
    } catch (e) {
      console.error("Error loading contacts:", e);
    }
  };

  const loadChatHistory = async () => {
    if (!activeUser) return;
    try {
      const res = await fetch(`${API}/Messages/history?user1Id=${userId}&user2Id=${activeUser.userId}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (e) {
      console.error("Error loading chat history:", e);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageText.trim() || !activeUser) return;

    try {
      const res = await fetch(`${API}/Messages/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderID: Number(userId),
          receiverID: activeUser.userId,
          messageText: messageText
        })
      });
      if (res.ok) {
        const newMsg = await res.json();
        setMessages(prev => [...prev, newMsg]);
        setMessageText("");
        loadConversations();
      }
    } catch (e) {
      console.error("Error sending message:", e);
      toast.error(lang === "ar" ? "فشل إرسال الرسالة" : "Failed to send message");
    }
  };

  const startNewChat = (contact) => {
    setActiveUser(contact);
    setShowStartChat(false);
  };

  const fetchCitizenReportsForPicker = async (citizenUserId) => {
    setLoadingReports(true);
    setCitizenReports([]);
    try {
      const sid = sectorId || localStorage.getItem("sectorId");
      if (!sid) return;
      const res = await fetch(`${API}/Reports/sector?sectorId=${sid}`);
      if (res.ok) {
        const allReports = await res.json();
        // filter to only this citizen's reports
        const filtered = allReports.filter(r => String(r.citizenUserId) === String(citizenUserId));
        setCitizenReports(filtered);
      }
    } catch (e) {
      console.error("Error fetching citizen reports for picker:", e);
    } finally {
      setLoadingReports(false);
    }
  };

  const handlePickReport = (report) => {
    setActiveReportId(report.reportId);
    setActiveReportTitle(report.title);
    const prefix = lang === 'ar'
      ? `بخصوص البلاغ رقم #${report.reportId} (${report.title}): `
      : `Regarding report #${report.reportId} (${report.title}): `;
    setMessageText(prefix);
    setShowReportPicker(false);
  };

  const goTo = (p) => { window.location.href = p; };
  const handleLogout = () => { localStorage.clear(); window.location.href = "/"; };

  return (
    <div className="chat-page-container" dir={lang === "ar" ? "rtl" : "ltr"}>
      <Toaster position="top-center" />

      {/* ── HEADER ── */}
      <header className={`sr-header${scrolled ? " scrolled" : ""}`}>
        <a className="sr-logo" onClick={() => goTo("/")} style={{ cursor: "pointer", textDecoration: "none" }}>
          <img src={logo} alt="SafeRoute" className="sr-logo-img" />
          <span className="sr-logo-text">Safe<span>Route</span></span>
        </a>

        <nav className="sr-nav">
          <a href="/" onClick={(e) => { e.preventDefault(); goTo("/"); }}>{t.home}</a>
          {userType === "Sector" ? (
            <>
              <a href="/sector-dashboard" onClick={(e) => { e.preventDefault(); goTo("/sector-dashboard"); }}>{t.dashboard}</a>
              <a href="/sector-citizens" onClick={(e) => { e.preventDefault(); goTo("/sector-citizens"); }}>{t.citizensDir}</a>
              <a href="/analytics" onClick={(e) => { e.preventDefault(); goTo("/analytics"); }}>{t.analytics}</a>
            </>
          ) : (
            <>
              <a href="/reports" onClick={(e) => { e.preventDefault(); goTo("/reports"); }}>{t.reports}</a>
              <a href="/report" onClick={(e) => { e.preventDefault(); goTo("/report"); }}>{t.reportNow}</a>
              <a href="/my-reports" onClick={(e) => { e.preventDefault(); goTo("/my-reports"); }}>{t.myReports}</a>
              <a href="/profile" onClick={(e) => { e.preventDefault(); goTo("/profile"); }}>{t.profile}</a>
            </>
          )}
          <a href="/chat" className="active" onClick={(e) => e.preventDefault()}>{t.messages}</a>
        </nav>

        <div className="sr-header-right">
          <button onClick={() => setDark(!dark)} className="theme-btn"><span className="dot"></span></button>
          <button onClick={() => setLang(lang === "ar" ? "en" : "ar")} className="lang-btn">{lang === "ar" ? "EN" : "AR"}</button>
          <div className="sr-bell-container"><NotificationBell userId={userId} /></div>
          {userId && <button className="sr-btn-logout" onClick={handleLogout}>{t.logout}</button>}
          <button className="sr-hamburger-btn" onClick={() => setMenuOpen(!menuOpen)}>
            <div className={`sr-ham-line ${menuOpen ? "open" : ""}`} />
            <div className={`sr-ham-line ${menuOpen ? "open" : ""}`} />
            <div className={`sr-ham-line ${menuOpen ? "open" : ""}`} />
          </button>
        </div>
      </header>

      {/* ── MOBILE NAV ── */}
      <nav className={`sr-mobile-nav${menuOpen ? " open" : ""}`}>
        <a href="/" onClick={(e) => { e.preventDefault(); goTo("/"); }}>{t.home}</a>
        {userType === "Sector" ? (
          <>
            <a href="/sector-dashboard" onClick={(e) => { e.preventDefault(); goTo("/sector-dashboard"); }}>{t.dashboard}</a>
            <a href="/sector-citizens" onClick={(e) => { e.preventDefault(); goTo("/sector-citizens"); }}>{t.citizensDir}</a>
            <a href="/analytics" onClick={(e) => { e.preventDefault(); goTo("/analytics"); }}>{t.analytics}</a>
          </>
        ) : (
          <>
            <a href="/reports" onClick={(e) => { e.preventDefault(); goTo("/reports"); }}>{t.reports}</a>
            <a href="/report" onClick={(e) => { e.preventDefault(); goTo("/report"); }}>{t.reportNow}</a>
            <a href="/my-reports" onClick={(e) => { e.preventDefault(); goTo("/my-reports"); }}>{t.myReports}</a>
            <a href="/profile" onClick={(e) => { e.preventDefault(); goTo("/profile"); }}>{t.profile}</a>
          </>
        )}
        <a href="/chat" className="active" onClick={(e) => e.preventDefault()}>{t.messages}</a>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', justifyContent: 'space-between', padding: '10px 10px 0 10px', borderTop: '1px solid var(--stone)', marginTop: '10px' }}>
          <span style={{ fontWeight: 'bold', fontSize: '15px', color: 'var(--ink)' }}>{lang === "ar" ? "الإعدادات" : "Settings"}</span>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => setDark(!dark)} className="theme-btn" />
            <button onClick={() => setLang(lang === "ar" ? "en" : "ar")} className="lang-btn">{lang === "ar" ? "EN" : "AR"}</button>
          </div>
        </div>
        <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid var(--stone)' }}>
          {userId && <button className="sr-btn-logout" style={{ width: '100%', padding: '15px' }} onClick={handleLogout}>{t.logoutMenu}</button>}
        </div>
      </nav>

      {/* ── CHAT WRAPPER ── */}
      <main className="chat-main-wrapper">
        <div className="chat-layout-card">
          
          {/* Sidebar Area */}
          <div className={`chat-sidebar ${activeUser ? "hide-on-mobile" : ""}`}>
            <div className="sidebar-header-row">
              <h3>{t.conversationsTitle}</h3>
              {userType === "Citizen" && (
                <button className="btn-chat-action" onClick={() => setShowStartChat(!showStartChat)}>
                  {t.startChatBtn}
                </button>
              )}
            </div>

            {showStartChat && userType === "Citizen" && (
              <div className="contacts-dropdown-panel">
                <select onChange={(e) => {
                  const selected = contacts.find(c => c.userId === Number(e.target.value));
                  if (selected) startNewChat(selected);
                }} defaultValue="">
                  <option value="" disabled>{t.selectSectorPlaceholder}</option>
                  {contacts.map(c => (
                    <option key={c.userId} value={c.userId}>{c.fullName}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="conversations-list custom-scrollbar">
              {loadingConv ? (
                <p className="no-chat-msg">{t.loadingConversations}</p>
              ) : conversations.length === 0 ? (
                <p className="no-chat-msg">{t.noConversations}</p>
              ) : conversations.map(c => {
                const isActive = activeUser && activeUser.userId === c.userId;
                return (
                  <div 
                    key={c.userId} 
                    className={`conversation-item ${isActive ? "active" : ""} ${c.isUnread ? "unread" : ""}`}
                    onClick={() => {
                      setActiveUser(c);
                      setActiveReportId(null);
                      setActiveReportTitle(null);
                      setShowReportPicker(false);
                      setCitizenReports([]);
                      setMessageText("");
                    }}
                  >
                    <div className="conv-avatar">
                      {c.fullName.charAt(0).toUpperCase()}
                    </div>
                    <div className="conv-meta">
                      <div className="conv-name-row">
                        <span className="conv-name">{c.fullName}</span>
                        <span className="conv-date">
                          {new Date(c.sentAt).toLocaleTimeString(lang === 'ar' ? 'ar-EG' : 'en-US', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div className="conv-text-row">
                        <p className="conv-last-msg">{c.lastMessageText}</p>
                        {c.isUnread && <span className="unread-dot" />}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Active Chat Window */}
          <div className={`chat-window ${!activeUser ? "hide-on-mobile" : ""}`}>
            {activeUser ? (
              <>
                <div className="chat-window-header">
                  <button className="btn-back-chat" onClick={() => setActiveUser(null)}>
                    {t.backBtn}
                  </button>
                  <div className="chat-header-info">
                    <h4>{activeUser.fullName}</h4>
                    <span className="badge-user-type">
                      {activeUser.userType === "Sector" ? t.sectorLabel : t.citizenLabel}
                    </span>
                  </div>
                  {userType === "Sector" && (
                    <button
                      onClick={() => {
                        if (!showReportPicker) fetchCitizenReportsForPicker(activeUser.userId);
                        setShowReportPicker(p => !p);
                      }}
                      title={t.attachReport}
                      style={{
                        marginInlineStart: 'auto',
                        background: showReportPicker ? 'var(--blue, #0071e3)' : 'rgba(0,113,227,0.08)',
                        border: '1.5px solid rgba(0,113,227,0.25)',
                        color: showReportPicker ? '#fff' : 'var(--blue, #0071e3)',
                        borderRadius: '10px',
                        padding: '7px 14px',
                        fontSize: '12px',
                        fontWeight: '800',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        transition: 'all 0.2s'
                      }}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: '14px', height: '14px' }}>
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                        <polyline points="14 2 14 8 20 8"/>
                        <line x1="16" y1="13" x2="8" y2="13"/>
                        <line x1="16" y1="17" x2="8" y2="17"/>
                        <polyline points="10 9 9 9 8 9"/>
                      </svg>
                      {t.attachReport}
                    </button>
                  )}
                </div>

                {/* ── Report Picker Panel (Sector only) ── */}
                {showReportPicker && userType === "Sector" && (
                  <div style={{
                    background: 'var(--surface, #fff)',
                    borderBottom: '1px solid var(--stone, #e2e8f0)',
                    padding: '12px 16px',
                    maxHeight: '220px',
                    overflowY: 'auto'
                  }}>
                    <div style={{ fontSize: '12px', fontWeight: '900', color: 'var(--muted, #64748b)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {t.reportPickerTitle}
                    </div>
                    {loadingReports ? (
                      <p style={{ fontSize: '13px', color: 'var(--muted, #64748b)', textAlign: 'center', padding: '12px 0' }}>{t.loadingReports}</p>
                    ) : citizenReports.length === 0 ? (
                      <p style={{ fontSize: '13px', color: 'var(--muted, #64748b)', textAlign: 'center', padding: '12px 0' }}>{t.noReportsForCitizen}</p>
                    ) : citizenReports.map(r => (
                      <div
                        key={r.reportId}
                        onClick={() => handlePickReport(r)}
                        style={{
                          padding: '10px 14px',
                          borderRadius: '10px',
                          marginBottom: '6px',
                          background: activeReportId === r.reportId ? 'rgba(0,113,227,0.1)' : 'var(--bg, #f8fafc)',
                          border: activeReportId === r.reportId ? '1.5px solid rgba(0,113,227,0.35)' : '1.5px solid var(--stone, #e2e8f0)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '12px',
                          transition: 'all 0.15s'
                        }}
                      >
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: '800', fontSize: '13px', color: 'var(--ink, #1e293b)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            #{r.reportId} — {r.title}
                          </div>
                          <div style={{ fontSize: '11px', color: 'var(--muted, #64748b)', marginTop: '2px' }}>
                            {r.statusName} · {r.city || ''}
                          </div>
                        </div>
                        <div style={{
                          flexShrink: 0,
                          width: '8px', height: '8px', borderRadius: '50%',
                          background: r.statusName?.includes('جديد') || r.statusName === 'New' ? '#3b82f6'
                            : r.statusName?.includes('معالجة') || r.statusName?.includes('Processing') ? '#f59e0b'
                            : r.statusName?.includes('تم') || r.statusName?.includes('Resolved') ? '#10b981'
                            : '#ef4444'
                        }} />
                      </div>
                    ))}
                  </div>
                )}

                {activeReportId && (
                  <div style={{
                    background: 'rgba(0, 113, 227, 0.08)',
                    borderBottom: '1px solid rgba(0, 113, 227, 0.15)',
                    padding: '12px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '13px',
                    color: 'var(--blue, #0071e3)',
                    fontWeight: '800',
                    fontFamily: "'Tajawal', sans-serif"
                  }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      📌 {lang === 'ar' ? 'بخصوص البلاغ:' : 'Regarding Report:'} #{activeReportId} - {activeReportTitle}
                    </span>
                    <button 
                      onClick={() => {
                        setActiveReportId(null);
                        setActiveReportTitle(null);
                      }}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--muted, #64748b)',
                        cursor: 'pointer',
                        fontSize: '20px',
                        lineHeight: 1,
                        padding: '0 4px',
                        fontWeight: '300'
                      }}
                    >
                      ×
                    </button>
                  </div>
                )}

                <div className="chat-messages-container custom-scrollbar">
                  {messages.map(m => {
                    const isOutgoing = m.senderId === Number(userId);
                    return (
                      <div key={m.messageId} className={`msg-row ${isOutgoing ? "outgoing" : "incoming"}`}>
                        <div className="msg-bubble">
                          <p>{m.messageText}</p>
                          <span className="msg-time">
                            {new Date(m.sentAt).toLocaleTimeString(lang === 'ar' ? 'ar-EG' : 'en-US', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                <form className="chat-input-form-row" onSubmit={handleSendMessage}>
                  <input
                    type="text"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder={t.typeMessagePlaceholder}
                    required
                  />
                  <button type="submit" className="btn-send-msg">
                    {t.sendBtn}
                  </button>
                </form>
              </>
            ) : (
              <div className="no-active-chat-wrapper">
                <div className="empty-chat-icon">
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.3, marginBottom: '15px' }}>
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                  </svg>
                </div>
                <p>{t.selectUserChat}</p>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}
