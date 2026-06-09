import { useMemo, useState, useEffect } from "react";
import logo from "../Login-Register/logo.png";
import NotificationBell from "../components/NotificationBell";
import "./profile.css";
import API from "../api/api.js";

const translations = {
  ar: {
    home: "الرئيسية",
    reports: "البلاغات",
    reportNow: "أبلغ الآن",
    myReports: "بلاغاتي",
    profile: "ملفي",
    dashboard: "لوحة التحكم",
    analytics: "الإحصائيات",
    logout: "خروج",
    logoutMenu: "تسجيل الخروج",
    defaultUser: "مستخدم SafeRoute",
    localProfile: "الملف الشخصي",
    email: "البريد الإلكتروني",
    birthDate: "تاريخ الميلاد",
    ageLabel: "العمر الحالي",
    reportsTotal: "إجمالي بلاغاتك",
    reportsCount: "بلاغ مسجل",
    editBtn: "تعديل البيانات الشخصية",
    yearsOld: "سنة",
    na: "غير محدد",
    footerText: "مشروع تخرج — جامعة الزيتونة الأردنية",
    developer: "Developed by Malak Atef"
  },
  en: {
    home: "Home",
    reports: "Reports",
    reportNow: "Report Now",
    myReports: "My Reports",
    profile: "Profile",
    dashboard: "Dashboard",
    analytics: "Analytics",
    logout: "Logout",
    logoutMenu: "Log Out",
    defaultUser: "SafeRoute User",
    localProfile: "User Profile",
    email: "Email Address",
    birthDate: "Date of Birth",
    ageLabel: "Current Age",
    reportsTotal: "Total Reports",
    reportsCount: "Registered Reports",
    editBtn: "Edit Personal Details",
    yearsOld: "years",
    na: "N/A",
    footerText: "Graduation Project — Al-Zaytoonah University",
    developer: "Developed by Malak Atef"
  }
};

const UserIco = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const MailIco = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>;
const BirthIco = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
const StatsIco = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>;

function Profile() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState(null);
  const [reportsCount, setReportsCount] = useState(0);

  const [dark, setDark] = useState(localStorage.getItem('theme') === 'dark');
  const [lang, setLang] = useState(localStorage.getItem('lang') || "ar");

  const userId = localStorage.getItem("userId");
  const userType = localStorage.getItem("userType");

  const t = translations[lang];

  useEffect(() => {
    if (dark) document.body.classList.add('dark');
    else document.body.classList.remove('dark');
    localStorage.setItem('theme', dark ? 'dark' : 'light');
    localStorage.setItem('lang', lang);
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  }, [dark, lang]);

  const navLinks = userType === "Sector"
    ? [{ href: "/sector-dashboard", label: t.dashboard }, { href: "/analytics", label: t.analytics }, { href: "/chat", label: lang === "ar" ? "الدردشات" : "Chats" }]
    : [{ href: "/reports", label: t.reports }, { href: "/report", label: t.reportNow }, { href: "/my-reports", label: t.myReports }, { href: "/profile", label: t.profile }, { href: "/chat", label: lang === "ar" ? "الدردشات" : "Chats" }];

  useEffect(() => {
    if (!userId) {
        window.location.href = "/login";
        return;
    }

    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);

    fetchUser();
    fetchReportsCount();

    return () => window.removeEventListener("scroll", onScroll);
  }, [userId]);

  const fetchUser = async () => {
    try {
      const res = await fetch(`${API}/Auth/${userId}`);
      if (res.ok) {
          const data = await res.json();
          setUser(data);
      }
    } catch (err) { console.error("Error fetching user:", err); }
  };

  const fetchReportsCount = async () => {
    try {
      const res = await fetch(`${API}/Reports/count?userId=${userId}`);
      const data = await res.json();
      setReportsCount(data.count || 0);
    } catch (err) { console.error("Error fetching reports count:", err); }
  };

  const age = useMemo(() => {
    if (!user?.birthDate) return t.na;
    const birth = new Date(user.birthDate);
    const today = new Date();
    let years = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) years--;
    return years >= 0 ? `${years} ${t.yearsOld}` : t.na;
  }, [user?.birthDate, lang]);

  const handleLogout = () => { localStorage.clear(); window.location.href = "/"; };
  const goTo = (p) => { window.location.href = p; };

  const initial = user?.fullName ? user.fullName.charAt(0).toUpperCase() : "U";

  return (
    <div className="profile-wrapper" dir={lang === "ar" ? "rtl" : "ltr"}>
      <header className={`sr-header ${scrolled ? "scrolled" : ""}`}>
        <a className="sr-logo" onClick={() => goTo("/")} style={{cursor:'pointer'}}>
          <img src={logo} alt="SafeRoute" className="sr-logo-img" />
          <span className="sr-logo-text">Safe<span>Route</span></span>
        </a>

        <nav className="sr-nav">
          <a href="/" onClick={(e) => { e.preventDefault(); goTo("/"); }}>{t.home}</a>
          {navLinks.map(l => (
            <a key={l.href} href={l.href} className={window.location.pathname === l.href ? "active" : ""} onClick={(e) => { e.preventDefault(); goTo(l.href); }}>{l.label}</a>
          ))}
        </nav>

        <div className="sr-header-right">
          <button onClick={() => setDark(!dark)} className="theme-btn"><span className="dot"></span></button>
          <button onClick={() => setLang(lang === "ar" ? "en" : "ar")} className="lang-btn">{lang === "ar" ? "EN" : "AR"}</button>
          <div className="sr-bell-box"><NotificationBell userId={userId} /></div>
          {userId && <button className="sr-btn-logout" onClick={handleLogout}>{t.logout}</button>}
          <button className="sr-hamburger" onClick={() => setMenuOpen(!menuOpen)}>
             <div className="sr-ham-line"/><div className="sr-ham-line"/><div className="sr-ham-line"/>
          </button>
        </div>
      </header>

      <nav className={`sr-mobile-nav ${menuOpen ? "open" : ""}`}>
        <div className="mobile-options-row">
          <button onClick={() => setDark(!dark)} className="theme-btn"><span className="dot"></span></button>
          <button onClick={() => setLang(lang === "ar" ? "en" : "ar")} className="lang-btn">{lang === "ar" ? "EN" : "AR"}</button>
        </div>
        <a href="/" onClick={() => goTo("/")}>{t.home}</a>
        {navLinks.map(l => <a key={l.href} href={l.href} onClick={() => goTo(l.href)}>{l.label}</a>)}
        <button className="sr-btn-logout" style={{width: '100%', padding: '15px'}} onClick={handleLogout}>{t.logoutMenu}</button>
      </nav>

      <main className="profile-bento-grid">
        <div className="bento-id-card">
          <div className="avatar-liquid">{initial}</div>
          <h2 className="profile-name">{user?.fullName || t.defaultUser}</h2>
          <span className="profile-badge">{t.localProfile}</span>
        </div>

        <div className="bento-info-box">
          <label><MailIco/> {t.email}</label>
          <span>{user?.email || t.na}</span>
        </div>

        <div className="bento-info-box">
          <label><BirthIco/> {t.birthDate}</label>
          <span>{user?.birthDate ? user.birthDate.split("T")[0] : t.na}</span>
        </div>

        <div className="bento-info-box">
          <label><UserIco/> {t.ageLabel}</label>
          <span>{age}</span>
        </div>

        <div className="bento-info-box bento-highlight">
          <label><StatsIco/> {t.reportsTotal}</label>
          <span className="profile-stat-value">{reportsCount} {t.reportsCount}</span>
        </div>

        <div className="bento-actions">
          <button className="btn-bento-edit" onClick={() => goTo("/edit-profile")}>{t.editBtn}</button>
          <button className="btn-bento-logout" onClick={handleLogout}>{t.logoutMenu}</button>
        </div>
      </main>

      <footer className="sr-footer">
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'30px', width:'100%'}}>
          <a className="sr-logo" onClick={() => goTo("/")} style={{textDecoration:'none', cursor:'pointer'}}>
            <img src={logo} alt="SafeRoute" className="sr-logo-img" />
            <span className="sr-logo-text">Safe<span>Route</span></span>
          </a>
          <div style={{textAlign: lang === "ar" ? "right" : "left"}}>
            <p style={{fontSize:'12px', color:'var(--muted)'}}>{t.footerText}</p>
            <p style={{fontSize:'12px', color:'var(--muted)', marginTop:'4px'}}>{t.developer}</p>
          </div>
        </div>
        <div className="sr-footer-copy" style={{textAlign:'center', marginTop:20, fontSize:11, color:'var(--muted)'}}>
            © 2026 SafeRoute
        </div>
      </footer>
    </div>
  );
}

export default Profile;