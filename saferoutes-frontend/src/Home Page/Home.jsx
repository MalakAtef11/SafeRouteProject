import { useState, useEffect } from "react";
import axios from "axios"; 
import logo from "../Login-Register/logo.png";
import "./style.css";
import NotificationBell from "../components/NotificationBell.jsx";

// ── Icons ── 
const ArrowLeftSVG = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
  </svg>
);

const CheckSVG = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const MapSVG = () => (
  <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#0071e3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" />
  </svg>
);

const BoltSVG = () => (
  <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#0071e3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

const BellLargeSVG = () => (
  <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#0071e3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 01-3.46 0" />
  </svg>
);

const PlaySVG = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <polygon points="5 3 19 12 5 21 5 3" />
  </svg>
);

// ── Translations Object ──
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
    login: "دخول",
    logoutFull: "تسجيل الخروج",
    loginFull: "تسجيل الدخول",
    eyebrow: "نظام ذكي للتبليغ عن مشاكل الطرق والبنية التحتية",
    heroTitle: "طريقك الآمن يبدأ",
    heroTitleBreak: "ببساطة",
    heroEm: "بلاغك.",
    heroSub: "أبلغ عن مشاكل البنية التحتية بنص أو صورة أو صوت، ويتولى الذكاء الاصطناعي توجيه بلاغك للجهة المختصة خلال ثوانٍ.",
    startReporting: "ابدأ الإبلاغ الآن",
    sectorDashboard: "لوحة تحكم القطاع",
    browseReports: "تصفّح البلاغات",
    activeUsers: "مستخدم نشط",
    completionRate: "نسبة الإنجاز",
    continuousTracking: "تتبع مستمر",
    latestReports: "أحدث البلاغات المحلية",
    live: "مباشر",
    noReports: "لا يوجد بلاغات حالياً",
    solvedRecently: "حُلّت مؤخراً",
    howItWorks: "آلية العمل",
    threeSteps: "ثلاث خطوات تكفي لحلّ المشكلة",
    step1Title: "سجّل بلاغك",
    step1Desc: "صوّر المشكلة وحدد موقعها على الخريطة أو أرسل وصفاً صوتياً.",
    step2Title: "المعالجة الذكية",
    step2Desc: "يُحلّل الذكاء الاصطناعي بلاغك ويحدد الجهة المختصة.",
    step3Title: "المتابعة والحل",
    step3Desc: "تصلك إشعارات لحظية من السيرفر بكل تحديث.",
    doneReports: "نسبة البلاغات المُنجزة",
    university: "مشروع تخرج — جامعة الزيتونة الأردنية",
    rights: "جميع الحقوق محفوظة لنظام SafeRoute",
    amman: "عمان",
    statusMap: {
      "Processing": "قيد المعالجة",
      "New": "تم الاستلام",
      "Done": "تم الإنجاز"
    }
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
    login: "Login",
    logoutFull: "Logout",
    loginFull: "Login",
    eyebrow: "Smart system for infrastructure reporting",
    heroTitle: "Your safe path starts",
    heroTitleBreak: "simply with your",
    heroEm: "report.",
    heroSub: "Report infrastructure issues via text, image, or voice, and AI will route your report to the right authority in seconds.",
    startReporting: "Start Reporting Now",
    sectorDashboard: "Sector Dashboard",
    browseReports: "Browse Reports",
    activeUsers: "Active User",
    completionRate: "Completion Rate",
    continuousTracking: "24/7 Tracking",
    latestReports: "Latest Local Reports",
    live: "Live",
    noReports: "No reports currently",
    solvedRecently: "Recently Solved",
    howItWorks: "How It Works",
    threeSteps: "Three steps to solve the problem",
    step1Title: "Record Report",
    step1Desc: "Capture the issue and set its location on the map or send a voice description.",
    step2Title: "Smart Processing",
    step2Desc: "AI analyzes your report and determines the specialized authority.",
    step3Title: "Follow-up & Solution",
    step3Desc: "Receive real-time notifications from the server for every update.",
    doneReports: "Completed Reports Rate",
    university: "Graduation Project — ZUJ",
    rights: "All rights reserved to SafeRoute",
    amman: "Amman",
    statusMap: {
      "قيد المعالجة": "Processing",
      "تم الاستلام": "Received",
      "تم الإنجاز": "Done"
    }
  }
};

const statusClass = (s) => {
  if (s === "Processing" || s === "قيد المعالجة") return "sr-status sr-status-processing";
  if (s === "New" || s === "تم الاستلام") return "sr-status sr-status-received";
  return "sr-status sr-status-done";
};

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [realReports, setRealReports] = useState([]); 
  const [statsData, setStatsData] = useState({ total: 0, rate: 95 }); 
  const [dark, setDark] = useState(localStorage.getItem('theme') === 'dark');
  const [lang, setLang] = useState(localStorage.getItem('lang') || 'ar');
  const [profileIncomplete, setProfileIncomplete] = useState(false);

  const userId = localStorage.getItem("userId");
  const userType = localStorage.getItem("userType");
  const isLoggedIn = !!userId;
  const currentPath = window.location.pathname;
  
  const t = translations[lang];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    fetchHomeData();
    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  useEffect(() => {
    if (dark) {
      document.body.classList.add("dark");
    } else {
      document.body.classList.remove("dark");
    }
    localStorage.setItem('theme', dark ? 'dark' : 'light');
    localStorage.setItem('lang', lang);
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  }, [dark, lang]);

  useEffect(() => {
    if (isLoggedIn && userType !== "Sector") {
      axios.get(`http://localhost:5029/api/v1/Auth/${userId}`)
        .then(res => {
          const user = res.data;
          if (!user.birthDate || !user.gender) {
            setProfileIncomplete(true);
          }
        })
        .catch(err => console.error("Error checking profile:", err));
    }
  }, [isLoggedIn, userId, userType]);

  const fetchHomeData = async () => {
    try {
      const reportsRes = await axios.get("http://localhost:5029/api/v1/Reports/public");
      setRealReports(reportsRes.data.slice(0, 3));
      const statsRes = await axios.get("http://localhost:5029/api/v1/Reports/sector/performance?sectorId=1");
      setStatsData({
        total: statsRes.data.totalReports,
        rate: statsRes.data.solvedRate
      });
    } catch (err) {
      console.error("خطأ في جلب البيانات:", err);
    }
  };

  const goTo = (path) => { window.location.href = path; };
  
  const requireLogin = (path) => { 
    if (!isLoggedIn) { goTo("/login"); return; } 
    goTo(path); 
  };

  const handleLogout = () => { localStorage.clear(); window.location.href = "/"; };

  const navLinks = userType === "Sector"
    ? [{ href: "/sector-dashboard", label: t.dashboard }, { href: "/analytics", label: t.analytics }]
    : [
        { href: "/reports", label: t.reports }, 
        { href: "/report", label: t.reportNow }, 
        { href: "/my-reports", label: t.myReports }, 
        { href: "/profile", label: t.profile }
      ];

  // دالة لترجمة حالة البلاغ القادم من الداتابيز
  const translateStatus = (status) => {
    return t.statusMap[status] || status;
  };

  return (
    <div dir={lang === "ar" ? "rtl" : "ltr"}>
      {/* ── HEADER ── */}
      <header className={`sr-header${scrolled ? " scrolled" : ""}`}>
        <a className="sr-logo" onClick={() => goTo("/")} style={{cursor: 'pointer'}}>
          <img src={logo} alt="SafeRoute Logo" className="sr-logo-img" />
          <span className="sr-logo-text">Safe<span>Route</span></span>
        </a>

        <nav className="sr-nav">
          <a href="/" className={currentPath === "/" ? "active" : ""}>{t.home}</a>
          {navLinks.map(l => (
            <a key={l.href} href={l.href} onClick={e => { e.preventDefault(); requireLogin(l.href); }}>{l.label}</a>
          ))}
        </nav>

        <div className="sr-header-right">
          <button onClick={() => setDark(!dark)} className="theme-btn">
            <span className="dot"></span>
          </button>

          <button onClick={() => setLang(lang === "ar" ? "en" : "ar")} className="lang-btn">
            {lang === "ar" ? "EN" : "AR"}
          </button>

          <div className="sr-bell-container">
            <NotificationBell userId={userId} />
          </div>

          {/* ديسكتوب فقط */}
          <div className="sr-auth-desktop">
            {isLoggedIn
              ? <button className="sr-btn-logout" onClick={handleLogout}>{t.logout}</button>
              : <button className="sr-btn-login" onClick={() => goTo("/login")}>{t.login}</button>
            }
          </div>

          {/* موبايل فقط */}
          <button className="sr-hamburger-btn" onClick={() => setMenuOpen(!menuOpen)}>
            <div className={`sr-ham-line ${menuOpen ? "open" : ""}`} />
            <div className={`sr-ham-line ${menuOpen ? "open" : ""}`} />
            <div className={`sr-ham-line ${menuOpen ? "open" : ""}`} />
          </button>
        </div>
      </header>

      {/* ── MOBILE NAV ── */}
      <nav className={`sr-mobile-nav${menuOpen ? " open" : ""}`}>
        <a href="/" onClick={() => setMenuOpen(false)}>{t.home}</a>
        {navLinks.map(l => (
          <a key={l.href} href={l.href} onClick={e => { e.preventDefault(); setMenuOpen(false); requireLogin(l.href); }}>{l.label}</a>
        ))}
        
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', justifyContent: 'space-between', padding: '10px 10px 0 10px', borderTop: '1px solid var(--stone)', marginTop: '10px' }}>
           <span style={{ fontWeight: 'bold', fontSize: '15px', color: 'var(--ink)' }}>{lang === "ar" ? "الإعدادات" : "Settings"}</span>
           <div style={{ display: 'flex', gap: '10px' }}>
             <button onClick={() => setDark(!dark)} className="theme-btn" />
             <button onClick={() => setLang(lang === "ar" ? "en" : "ar")} className="lang-btn">
               {lang === "ar" ? "EN" : "AR"}
             </button>
           </div>
        </div>

        <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid var(--stone)' }}>
           {isLoggedIn ? (
              <button className="sr-btn-logout" style={{width: '100%', padding: '15px'}} onClick={handleLogout}>{t.logoutFull}</button>
            ) : (
              <button className="sr-btn-login" style={{width: '100%', padding: '15px'}} onClick={() => goTo("/login")}>{t.loginFull}</button>
            )}
        </div>
      </nav>

      {/* ── PROFILE INCOMPLETE BANNER ── */}
      {profileIncomplete && (
        <div style={{ 
          backgroundColor: 'var(--blue)', 
          color: 'white', 
          padding: '12px 20px', 
          textAlign: 'center', 
          fontWeight: '500', 
          fontSize: '15px',
          marginTop: scrolled ? '65px' : '0',
          transition: 'margin-top 0.3s ease',
          boxShadow: '0 4px 12px rgba(0,113,227,0.3)'
        }}>
          <span>{lang === "ar" ? "مرحباً بك! يرجى استكمال بيانات ملفك الشخصي (مثل الجنس وتاريخ الميلاد) لضمان تقديم أفضل خدمة لك." : "Welcome! Please complete your profile data (like Gender and Birth Date) to ensure the best service."}</span>
          <a href="/profile" style={{ 
            margin: lang === "ar" ? '0 15px 0 0' : '0 0 0 15px', 
            color: '#fff', 
            textDecoration: 'underline', 
            fontWeight: 'bold',
            cursor: 'pointer'
          }}>{lang === "ar" ? "أكمل بياناتك الآن" : "Complete Profile Now"}</a>
        </div>
      )}

      {/* ══ HERO SECTION ══ */}
      <section className="sr-hero">
        <div className="sr-hero-left">
          <div className="sr-eyebrow anim-1">
            <span className="sr-eyebrow-dot" />
            {t.eyebrow}
          </div>
          <h1 className="sr-hero-title anim-2">
            {t.heroTitle}<br />
            {t.heroTitleBreak} <em>{t.heroEm}</em>
          </h1>
          <p className="sr-hero-sub anim-3">{t.heroSub}</p>
          <div className="sr-cta-row anim-4">
            <button className="sr-btn-primary" onClick={() => requireLogin(userType === "Sector" ? "/sector-dashboard" : "/report")}>
              {userType === "Sector" ? t.sectorDashboard : t.startReporting}
              <ArrowLeftSVG />
            </button>
            <button className="sr-btn-ghost" onClick={() => requireLogin("/reports")}>
              <PlaySVG /> {t.browseReports}
            </button>
          </div>
          <div className="sr-hero-features anim-5">
            <div className="sr-feature-item"><CheckSVG /> {lang === "ar" ? "معالجة بالذكاء الاصطناعي" : "AI Processing"}</div>
            <div className="sr-feature-item"><CheckSVG /> {lang === "ar" ? "توجيه تلقائي للجهات" : "Auto Routing"}</div>
            <div className="sr-feature-item"><CheckSVG /> {lang === "ar" ? "تتبع فوري ومباشر" : "Live Tracking"}</div>
          </div>
        </div>

        <div className="sr-hero-right anim-6">
          <div className="sr-feed-card">
            <div className="sr-feed-header">
              <span className="sr-feed-title">{t.latestReports}</span>
              <span className="sr-live-badge"><span className="sr-live-dot" />{t.live}</span>
            </div>
            {realReports.length > 0 ? realReports.map((r, i) => (
              <div className="sr-report-item" key={i}>
                <div>
                  <div className="sr-report-type">{r.title}</div>
                  <div className="sr-report-loc">{r.city || t.amman}</div>
                </div>
                <span className={statusClass(r.statusName)}>{translateStatus(r.statusName)}</span>
              </div>
            )) : <p style={{textAlign: 'center', color: '#999'}}>{t.noReports}</p>}
          </div>
          <div className="sr-deco-card">
            <div className="sr-deco-icon"><CheckSVG /></div>
            <div>
              <div className="sr-deco-val">{statsData.rate}%</div>
              <div className="sr-deco-lbl">{t.solvedRecently}</div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ HOW IT WORKS ══ */}
      <div className="sr-section">
        <div className="sr-section-label">
          <div className="sr-section-line" />
          <span className="sr-section-tag">{t.howItWorks}</span>
        </div>
        <h2 className="sr-section-title">{t.threeSteps}</h2>
        <div className="sr-steps">
          {[
            { n: "01", icon: <MapSVG />, title: t.step1Title, desc: t.step1Desc },
            { n: "02", icon: <BoltSVG />, title: t.step2Title, desc: t.step2Desc },
            { n: "03", icon: <BellLargeSVG/>, title: t.step3Title, desc: t.step3Desc },
          ].map(s => (
            <div className="sr-step" key={s.n}>
              <div className="sr-step-num">{s.n}</div>
              <div className="sr-step-icon-wrap">{s.icon}</div>
              <div className="sr-step-title">{s.title}</div>
              <p className="sr-step-desc">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ══ STATS BAND ══ */}
      <div className="sr-stats-section">
        <div className="sr-stats-band">
          <div>
            <div className="sr-stat-num">{statsData.total}<span>+</span></div>
            <div className="sr-stat-label">{t.activeUsers}</div>
          </div>
          <div>
            <div className="sr-stat-num">{statsData.rate}<span>%</span></div>
            <div className="sr-stat-label">{t.doneReports}</div>
          </div>
          <div>
            <div className="sr-stat-num">24<span>/7</span></div>
            <div className="sr-stat-label">{t.continuousTracking}</div>
          </div>
        </div>
      </div>

      {/* ══ FOOTER ══ */}
      <footer>
        <div className="sr-footer">
          <a className="sr-logo" onClick={() => goTo("/")} style={{cursor: 'pointer'}}>
            <img src={logo} alt="SafeRoute Logo" className="sr-logo-img" />
            <span className="sr-logo-text">Safe<span>Route</span></span>
          </a>
          <div className="sr-footer-right">
            <p>{t.university}</p>
            <p style={{ marginTop: 4 }}>Developed by <strong>Malak Atef</strong></p>
          </div>
          <div className="sr-footer-copy">
            © 2026 {t.rights}
          </div>
        </div>
      </footer>
    </div>
  );
}