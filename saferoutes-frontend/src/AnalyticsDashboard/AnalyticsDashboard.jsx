import { useEffect, useRef, useState } from "react";
import logo from "../Login-Register/logo.png";
import NotificationBell from "../components/NotificationBell";
import "../Home Page/style.css";
import "./analyticsdashboard.css";
import API_BASE from "../api/config";

// ── Icons ──
const PinIco = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
    <circle cx="12" cy="10" r="3"/>
  </svg>
);

// ── Fancy Circular Progress ──
const CircularProgress = ({ percentage, color, label, value }) => {
  const radius = 35;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;
  
  return (
    <div className="circular-chart-item">
      <svg width="100" height="100" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={radius} stroke="var(--stone)" strokeWidth="8" fill="none" />
        <circle 
          cx="50" cy="50" r={radius} 
          stroke={color} strokeWidth="8" fill="none" 
          strokeDasharray={circumference} 
          strokeDashoffset={offset} 
          strokeLinecap="round"
          style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%', transition: 'stroke-dashoffset 1.5s ease-out' }}
        />
        <text x="50" y="56" textAnchor="middle" fontSize="22" fontWeight="800" fill="var(--ink)">{value}</text>
      </svg>
      <span className="circular-chart-label">{label}</span>
    </div>
  );
};

// ── Translations ──
const translations = {
  ar: {
    dashboard: "لوحة التحكم",
    analytics: "الإحصائيات",
    citizens: "دليل المواطنين",
    logout: "خروج",
    logoutFull: "تسجيل الخروج",
    smartTitle: "لوحة التحليل الذكي",
    sectorLabel: "نظرة بيانات شاملة لقطاع:",
    totalReports: "إجمالي البلاغات",
    processing: "قيد المعالجة",
    resolved: "تم الحل بنجاح",
    completionRate: "نسبة الإنجاز",
    statusDist: "توزيع حالات البلاغات",
    cityDist: "الانتشار حسب المدن",
    hotspots: "المناطق الأكثر بلاغاً",
    noData: "لا توجد بيانات حالياً",
    reportsCount: "بلاغ",
    statusMap: {
      "Processing": "قيد المعالجة",
      "New": "جديد",
      "Resolved": "تم الحل",
      "Done": "مكتمل",
      "Rejected": "مرفوضة"
    }
  },
  en: {
    dashboard: "Dashboard",
    analytics: "Analytics",
    citizens: "Citizens Directory",
    logout: "Logout",
    logoutFull: "Logout",
    smartTitle: "Smart Analytics Dashboard",
    sectorLabel: "Comprehensive data view for sector:",
    totalReports: "Total Reports",
    processing: "Processing",
    resolved: "Resolved",
    completionRate: "Completion Rate",
    statusDist: "Reports Status Distribution",
    cityDist: "Distribution by Cities",
    hotspots: "Top Reporting Hotspots",
    noData: "No data available currently",
    reportsCount: "Reports",
    statusMap: {
      "قيد المعالجة": "Processing",
      "جديد": "New",
      "تم الحل": "Resolved",
      "مكتمل": "Done",
      "مرفوضة": "Rejected",
      "Processing": "Processing",
      "New": "New",
      "Resolved": "Resolved",
      "Rejected": "Rejected"
    }
  }
};

// ── Skeleton Component ──
function SkeletonDashboard({ lang }) {
  return (
    <div className="skeleton-wrapper" dir={lang === "ar" ? "rtl" : "ltr"}>
      <div className="skeleton-title-block">
        <div className="skeleton sk-h1" />
        <div className="skeleton sk-sub" />
      </div>
      <div className="skeleton-metrics">
        {[...Array(4)].map((_, i) => (
          <div className="skeleton-metric-card" key={i}>
            <div className="skeleton sk-label" />
            <div className="skeleton sk-val" />
          </div>
        ))}
      </div>
      <div className="skeleton-charts">
        {[...Array(3)].map((_, i) => (
          <div className="skeleton-chart-card" key={i}>
            <div className="skeleton sk-chart-title" />
            <div className="sk-divider skeleton" />
            {[...Array(4)].map((_, j) => (
              <div className="sk-bar-row" key={j}>
                <div className="skeleton sk-bar-label" />
                <div className="skeleton sk-bar" style={{ width: `${60 + Math.random() * 40}%` }} />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function AnalyticsDashboard() {
  const [loading, setLoading] = useState(true);
  const [dark, setDark] = useState(localStorage.getItem('theme') === 'dark');
  const [lang, setLang] = useState(localStorage.getItem('lang') || 'ar');
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const sectorId = localStorage.getItem("sectorId");
  const sectorName = localStorage.getItem("sectorName") || "General Maintenance";
  const userType = localStorage.getItem("userType");
  const userId = localStorage.getItem("userId");

  const [summary, setSummary] = useState({ totalReports: 0, processingReports: 0, resolvedReports: 0 });
  const [statusDistribution, setStatusDistribution] = useState([]);
  const [citiesData, setCitiesData] = useState([]);
  const [hotspotsData, setHotspotsData] = useState([]);
  const [performance, setPerformance] = useState({ solvedRate: 0 });

  const t = translations[lang];

  useEffect(() => {
    if (userType !== "Sector") {
      window.location.href = "/";
      return;
    }

    // Apply Theme & Direction
    if (dark) document.body.classList.add("dark");
    else document.body.classList.remove("dark");
    localStorage.setItem('theme', dark ? 'dark' : 'light');
    localStorage.setItem('lang', lang);
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";

    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });

    loadData();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [dark, lang, userType]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [summ, dist, city, hot, perf] = await Promise.all([
        fetch(`${API_BASE}/Reports/sector/summary?sectorId=${sectorId}`).then(r => r.json()),
        fetch(`${API_BASE}/Reports/sector/status-distribution?sectorId=${sectorId}`).then(r => r.json()),
        fetch(`${API_BASE}/Reports/sector/cities?sectorId=${sectorId}`).then(r => r.json()),
        fetch(`${API_BASE}/Reports/sector/hotspots?sectorId=${sectorId}`).then(r => r.json()),
        fetch(`${API_BASE}/Reports/sector/performance?sectorId=${sectorId}`).then(r => r.json()),
      ]);
      setSummary(summ);
      setStatusDistribution(dist);
      setCitiesData(city);
      setHotspotsData(hot);
      setPerformance(perf);
    } catch (e) {
      console.error("خطأ في جلب البيانات:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => { localStorage.clear(); window.location.href = "/"; };
  const goTo = (p) => { window.location.href = p; };

  return (
    <div className="analytics-container" dir={lang === "ar" ? "rtl" : "ltr"}>

      {/* ── HEADER ── */}
      <header className={`sr-header${scrolled ? " scrolled" : ""}`}>
        <a className="sr-logo" onClick={() => goTo("/")} style={{ cursor: "pointer" }}>
          <img src={logo} alt="SafeRoute" className="sr-logo-img" />
          <span className="sr-logo-text">Safe<span>Route</span></span>
        </a>

        {/* Desktop Nav */}
        <nav className="sr-nav">
          <a href="/sector-dashboard" onClick={(e) => { e.preventDefault(); goTo("/sector-dashboard"); }}>{t.dashboard}</a>
          <a href="/sector-citizens" onClick={(e) => { e.preventDefault(); goTo("/sector-citizens"); }}>{t.citizens}</a>
          <a href="/analytics" className="active">{t.analytics}</a>
        </nav>

        {/* Desktop Right */}
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

          <div className="sr-auth-desktop">
            <button className="sr-btn-logout" onClick={handleLogout}>
              {t.logout}
            </button>
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
        <a href="/sector-citizens" onClick={(e) => { e.preventDefault(); setMenuOpen(false); goTo("/sector-citizens"); }}>{t.citizens}</a>
        <a href="/analytics" className="active" onClick={() => { setMenuOpen(false); }}>{t.analytics}</a>
        
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
           <button className="sr-btn-logout" style={{width: '100%', padding: '15px'}} onClick={handleLogout}>{t.logoutFull}</button>
        </div>
      </nav>

      {/* ── CONTENT ── */}
      {loading ? (
        <SkeletonDashboard lang={lang} />
      ) : (
        <main className="analytics-wrapper">

          <section className="hero-stats-title">
            <h1>{t.smartTitle}</h1>
            <p>{t.sectorLabel} <strong>{sectorName}</strong></p>
          </section>

          {/* KPI Cards */}
          <section className="metrics-grid">
            <div className="metric-card"><label>{t.totalReports}</label><div className="val">{summary.totalReports}</div></div>
            <div className="metric-card"><label>{t.processing}</label><div className="val">{summary.processingReports}</div></div>
            <div className="metric-card"><label>{t.resolved}</label><div className="val" style={{ color: "#059669" }}>{summary.resolvedReports}</div></div>
            <div className="metric-card"><label>{t.completionRate}</label><div className="val" style={{ color: "var(--blue)" }}>{performance.solvedRate}%</div></div>
          </section>

          {/* Charts */}
          <section className="charts-layout-grid">

            {/* Status Distribution */}
            <div className="chart-card">
              <div className="chart-header"><div className="dot-blue" /><h3>{t.statusDist}</h3></div>
              <div className="circular-charts-grid">
                {statusDistribution.map((item, i) => {
                  const percentage = summary.totalReports ? (item.count / summary.totalReports) * 100 : 0;
                  const colors = ["#0071e3", "#f59e0b", "#10b981", "#ef4444", "#8b5cf6"];
                  return (
                    <CircularProgress 
                      key={i} 
                      percentage={percentage} 
                      color={colors[i % colors.length]} 
                      label={t.statusMap[item.statusCode] || item.statusName} 
                      value={item.count} 
                    />
                  );
                })}
              </div>
            </div>

            {/* Cities Data */}
            <div className="chart-card">
              <div className="chart-header"><div className="dot-blue" /><h3>{t.cityDist}</h3></div>
              <div className="luxury-bars-list">
                {citiesData.map((item, i) => {
                  const percentage = summary.totalReports ? (item.count / summary.totalReports) * 100 : 0;
                  return (
                    <div className="luxury-bar-item" key={i}>
                      <div className="luxury-bar-info"><span>{item.city}</span><span className="luxury-badge">{item.count}</span></div>
                      <div className="luxury-bar-track">
                        <div className="luxury-bar-fill" style={{ width: `${percentage}%`, background: "linear-gradient(90deg, #8b5cf6, #d946ef)", boxShadow: "0 0 10px rgba(217, 70, 239, 0.4)" }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Hotspots */}
            <div className="chart-card">
              <div className="chart-header"><div className="dot-blue" /><h3>{t.hotspots}</h3></div>
              <div className="hotspots-list">
                {hotspotsData.length > 0 ? (
                  hotspotsData.map((item, i) => (
                    <div className="hotspot-row" key={i}>
                      <div className="hotspot-info"><PinIco /> {item.location}</div>
                      <div className="hotspot-badge">{item.count} {t.reportsCount}</div>
                    </div>
                  ))
                ) : (
                  <p style={{ textAlign: "center", padding: "20px", color: "#64748b" }}>{t.noData}</p>
                )}
              </div>
            </div>

          </section>
        </main>
      )}
    </div>
  );
}

export default AnalyticsDashboard;