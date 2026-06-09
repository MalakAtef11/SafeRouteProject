import React, { useState, useEffect } from "react";
import logo from "../Login-Register/logo.png";
import NotificationBell from "../components/NotificationBell";
import "../Home Page/style.css";
import "./SectorCitizens.css";
import toast, { Toaster } from "react-hot-toast";
import API from "../api/api.js";

const UserIco = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const MailIco = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2" ry="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>;
const MapIco = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/></svg>;
const ChatIco = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: '16px', height: '16px', display: 'inline-block', verticalAlign: 'middle', margin: '0 4px' }}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>;

const translations = {
  ar: {
    dashboard: "لوحة التحكم",
    analytics: "الإحصائيات",
    citizens: "دليل المواطنين",
    logout: "خروج",
    logoutFull: "تسجيل الخروج",
    heroTitle: "دليل المواطنين -",
    heroSub: "سجل المواطنين الذين تفاعلوا وأرسلوا بلاغات لقطاعكم.",
    loading: "جاري تحميل الدليل...",
    noCitizens: "لا يوجد مواطنين تفاعلوا مع هذا القطاع حتى الآن.",
    reportsCount: "بلاغ",
    lastActive: "آخر تفاعل:",
    viewReports: "عرض بلاغاته",
    reportsBy: "بلاغات المواطن:",
    close: "إغلاق",
    messageCitizen: "تواصل مع المواطن",
    statusMap: {
      "Review": "قيد المراجعة",
      "Rejected": "مرفوض",
      "Processing": "قيد المعالجة",
      "Resolved": "تم الحل"
    }
  },
  en: {
    dashboard: "Dashboard",
    analytics: "Analytics",
    citizens: "Citizens Directory",
    logout: "Logout",
    logoutFull: "Logout",
    heroTitle: "Citizens Directory -",
    heroSub: "Directory of citizens who submitted reports to your sector.",
    loading: "Loading directory...",
    noCitizens: "No citizens found for this sector yet.",
    reportsCount: "Report(s)",
    lastActive: "Last Active:",
    viewReports: "View Reports",
    reportsBy: "Reports by:",
    close: "Close",
    messageCitizen: "Message Citizen",
    statusMap: {
      "Review": "Review",
      "Rejected": "Rejected",
      "Processing": "Processing",
      "Resolved": "Resolved"
    }
  }
};

export default function SectorCitizens() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dark, setDark] = useState(localStorage.getItem('theme') === 'dark');
  const [lang, setLang] = useState(localStorage.getItem('lang') || 'ar');
  const [loading, setLoading] = useState(true);
  
  const [citizens, setCitizens] = useState([]);
  const [selectedCitizen, setSelectedCitizen] = useState(null);
  const [citizenReports, setCitizenReports] = useState([]);
  const [reportsLoading, setReportsLoading] = useState(false);

  const sectorId = localStorage.getItem("sectorId");
  const sectorName = localStorage.getItem("sectorName") || "Maintenance Sector";
  const userId = localStorage.getItem("userId");
  const userType = localStorage.getItem("userType");

  const t = translations[lang];

  useEffect(() => {
    if (userType !== "Sector") {
      window.location.href = "/";
      return;
    }
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll, { passive: true });
    
    fetchCitizens();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (dark) document.body.classList.add("dark");
    else document.body.classList.remove("dark");
    localStorage.setItem('theme', dark ? 'dark' : 'light');
    localStorage.setItem('lang', lang);
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  }, [dark, lang]);

  const fetchCitizens = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API}/Reports/sector/${sectorId}/citizens`);
      if(res.ok) {
        const data = await res.json();
        setCitizens(data);
      }
    } catch (e) {
      console.error(e);
      toast.error("Error loading citizens");
    } finally {
      setLoading(false);
    }
  };

  const fetchCitizenReports = async (citizen) => {
    setSelectedCitizen(citizen);
    setReportsLoading(true);
    try {
      const res = await fetch(`${API}/Reports/sector/${sectorId}/citizen/${citizen.userId}`);
      if(res.ok) {
        const data = await res.json();
        setCitizenReports(data);
      }
    } catch (e) {
      console.error(e);
      toast.error("Error loading reports");
    } finally {
      setReportsLoading(false);
    }
  };

  const goTo = (p) => { window.location.href = p; };
  const handleLogout = () => { localStorage.clear(); window.location.href = "/"; };

  return (
    <div className="sector-citizens-container" dir={lang === "ar" ? "rtl" : "ltr"}>
      <Toaster position="top-center" />

      {/* ── HEADER ── */}
      <header className={`sr-header${scrolled ? " scrolled" : ""}`}>
        <a className="sr-logo" onClick={() => goTo("/")} style={{ cursor: "pointer", textDecoration: "none" }}>
          <img src={logo} alt="SafeRoute" className="sr-logo-img" />
          <span className="sr-logo-text">Safe<span>Route</span></span>
        </a>
        <nav className="sr-nav">
          <a href="/sector-dashboard" onClick={(e) => { e.preventDefault(); goTo("/sector-dashboard"); }}>{t.dashboard}</a>
          <a href="/sector-citizens" className="active" onClick={(e) => { e.preventDefault(); }}>{t.citizens}</a>
          <a href="/analytics" onClick={(e) => { e.preventDefault(); goTo("/analytics"); }}>{t.analytics}</a>
          <a href="/chat" onClick={(e) => { e.preventDefault(); goTo("/chat"); }}>{lang === "ar" ? "الدردشات" : "Chats"}</a>
        </nav>
        <div className="sr-header-right">
          <button onClick={() => setDark(!dark)} className="theme-btn"><span className="dot"></span></button>
          <button onClick={() => setLang(lang === "ar" ? "en" : "ar")} className="lang-btn">{lang === "ar" ? "EN" : "AR"}</button>
          <div className="sr-bell-container"><NotificationBell userId={userId} /></div>
          <div className="sr-auth-desktop">
            {userId && <button className="sr-btn-logout" onClick={handleLogout}>{t.logout}</button>}
          </div>
          <button className="sr-hamburger-btn" onClick={() => setMenuOpen(!menuOpen)}>
            <div className={`sr-ham-line ${menuOpen ? "open" : ""}`} />
            <div className={`sr-ham-line ${menuOpen ? "open" : ""}`} />
            <div className={`sr-ham-line ${menuOpen ? "open" : ""}`} />
          </button>
        </div>
      </header>

      {/* ── MOBILE NAV ── */}
      <nav className={`sr-mobile-nav${menuOpen ? " open" : ""}`}>
        <a href="/sector-dashboard" onClick={(e) => { e.preventDefault(); setMenuOpen(false); goTo("/sector-dashboard"); }}>{t.dashboard}</a>
        <a href="/sector-citizens" className="active" onClick={(e) => { e.preventDefault(); setMenuOpen(false); }}>{t.citizens}</a>
        <a href="/analytics" onClick={(e) => { e.preventDefault(); setMenuOpen(false); goTo("/analytics"); }}>{t.analytics}</a>
        <a href="/chat" onClick={(e) => { e.preventDefault(); setMenuOpen(false); goTo("/chat"); }}>{lang === "ar" ? "الدردشات" : "Chats"}</a>
        
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', justifyContent: 'space-between', padding: '10px 10px 0 10px', borderTop: '1px solid var(--stone)', marginTop: '10px' }}>
           <span style={{ fontWeight: 'bold', fontSize: '15px', color: 'var(--ink)' }}>{lang === "ar" ? "الإعدادات" : "Settings"}</span>
           <div style={{ display: 'flex', gap: '10px' }}>
             <button onClick={() => setDark(!dark)} className="theme-btn" />
             <button onClick={() => setLang(lang === "ar" ? "en" : "ar")} className="lang-btn">{lang === "ar" ? "EN" : "AR"}</button>
           </div>
        </div>
        <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid var(--stone)' }}>
           {userId && <button className="sr-btn-logout" style={{width: '100%', padding: '15px'}} onClick={handleLogout}>{t.logoutFull}</button>}
        </div>
      </nav>

      <main className="sector-wrapper">
        <section className="hero-sector-info">
          <h1>{t.heroTitle} {sectorName}</h1>
          <p>{t.heroSub}</p>
        </section>

        <section className="citizens-grid">
          {loading ? (
            <p style={{textAlign: 'center', width: '100%', color: 'var(--muted)', gridColumn: '1 / -1'}}>{t.loading}</p>
          ) : citizens.length === 0 ? (
            <p style={{textAlign: 'center', width: '100%', color: 'var(--muted)', gridColumn: '1 / -1'}}>{t.noCitizens}</p>
          ) : citizens.map(c => (
            <div key={c.userId} className="citizen-card chic-input-card">
              <div className="cit-avatar"><UserIco /></div>
              <div className="cit-info">
                <h3 className="cit-name">{c.fullName || (lang === 'ar' ? "مواطن مجهول" : "Unknown Citizen")}</h3>
                <span className="cit-email"><MailIco/> {c.email || (lang === 'ar' ? "غير متوفر" : "N/A")}</span>
              </div>
              <div className="cit-stats">
                <div className="cit-stat-badge">
                  <strong>{c.totalReports}</strong> {t.reportsCount}
                </div>
                <div className="cit-last-active">
                  {t.lastActive} {new Date(c.lastReportDate).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US')}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                <button className="btn-action-prism outline" onClick={() => fetchCitizenReports(c)} style={{ flex: 1, margin: 0, padding: '10px 5px', fontSize: '13px' }}>
                  {t.viewReports}
                </button>
                <button className="btn-action-prism" onClick={() => {
                  localStorage.setItem("chatWithUserId", c.userId);
                  localStorage.setItem("chatWithUserName", c.fullName);
                  goTo("/chat");
                }} style={{ flex: 1, margin: 0, padding: '10px 5px', fontSize: '13px', background: 'var(--blue)', color: '#fff', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
                  <ChatIco /> {t.messageCitizen}
                </button>
              </div>
            </div>
          ))}
        </section>
      </main>

      {/* ── CITIZEN REPORTS MODAL ── */}
      {selectedCitizen && (
        <div className="modal-overlay" style={{ backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', zIndex: 1000, position: 'fixed', top: 0, left: 0, width: '100%', height: '100%' }}>
          <div className="modal-box" style={{ width: '100%', maxWidth: 600, borderRadius: 'var(--r-xl)', position: 'relative', border: 'none', borderTop: '6px solid #8b5cf6', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', padding: '30px', background: '#ffffff', display: 'flex', flexDirection: 'column', maxHeight: '85vh' }}>
            
            <h3 style={{ fontSize: 20, fontWeight: 900, color: '#1f2937', marginBottom: 5 }}>
              {t.reportsBy} <span style={{ color: '#8b5cf6' }}>{selectedCitizen.fullName || (lang === 'ar' ? "مواطن مجهول" : "Unknown")}</span>
            </h3>
            <p style={{ color: '#6b7280', fontSize: '13px', marginBottom: 20 }}>{selectedCitizen.email || (lang === 'ar' ? "بدون بريد إلكتروني" : "No Email")}</p>

            <div className="custom-scrollbar" style={{ flex: 1, overflowY: 'auto', paddingRight: '10px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {reportsLoading ? (
                <p style={{ textAlign: 'center', color: '#6b7280', padding: '20px' }}>{t.loading}</p>
              ) : citizenReports.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#6b7280', padding: '20px' }}>{t.noCitizens}</p>
              ) : citizenReports.map(r => (
                <div key={r.reportId} style={{ padding: '15px', borderRadius: '12px', border: '1px solid #e5e7eb', background: '#f9fafb' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <strong style={{ color: '#1f2937', fontSize: '15px' }}>#{r.reportId} {r.title}</strong>
                    <span style={{ fontSize: '12px', padding: '3px 8px', borderRadius: '99px', background: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6', fontWeight: 'bold' }}>
                      {t.statusMap[r.statusName] || r.statusName}
                    </span>
                  </div>
                  <p style={{ color: '#4b5563', fontSize: '13px', margin: '0 0 10px 0', lineHeight: 1.5 }}>{r.description}</p>
                  <div style={{ display: 'flex', gap: '15px', fontSize: '12px', color: '#6b7280' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MapIco/> {r.city || r.addressText || (lang === 'ar' ? "غير محدد" : "N/A")}</span>
                    <span>{new Date(r.submittedAt).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US')}</span>
                  </div>
                </div>
              ))}
            </div>

            <button 
              onClick={() => setSelectedCitizen(null)} 
              style={{ width: '100%', marginTop: '20px', padding: 12, borderRadius: 99, background: '#f3f4f6', color: '#374151', fontWeight: 800, border: 'none', cursor: 'pointer', transition: '0.2s ease' }}
              onMouseOver={e => e.currentTarget.style.background = '#e5e7eb'}
              onMouseOut={e => e.currentTarget.style.background = '#f3f4f6'}
            >
              {t.close}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
