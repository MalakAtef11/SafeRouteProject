import { useEffect, useMemo, useRef, useState } from "react";
import logo from "../Login-Register/logo.png";
import NotificationBell from "../components/NotificationBell";
import "./reports.css";
import API from "../api/api.js";

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
    eyebrow: "استكشاف البلاغات المحلية",
    title: "خريطة بلاغات",
    subTitle: "رؤية حية لجميع البلاغات المسجلة في قاعدة البيانات المحلية.",
    searchPlaceholder: "ابحث في البلاغات المحلية...",
    filterAll: "الكل",
    filterNew: "جديد",
    filterProcessing: "قيد المعالجة",
    filterResolved: "تم الحل",
    filterRejected: "مرفوض",
    latestStatus: "أحدث الحالات",
    results: "نتيجة",
    syncing: "جاري مزامنة البلاغات...",
    noResults: "لا توجد نتائج في هذا النطاق المحلي.",
    viewMore: "عرض التفاصيل",
    university: "مشروع تخرج — جامعة الزيتونة الأردنية",
    rights: "جميع الحقوق محفوظة | Localhost Server Mode",
    myLocation: "موقعك الحالي",
    statusMap: {
      "new": "جديد",
      "review": "قيد المراجعة",
      "processing": "قيد المعالجة",
      "resolved": "تم الحل",
      "rejected": "مرفوض"
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
    eyebrow: "Explore Local Reports",
    title: "SafeRoute Reports Map",
    subTitle: "Live view of all reports registered in the local database.",
    searchPlaceholder: "Search local reports...",
    filterAll: "All",
    filterNew: "New",
    filterProcessing: "Processing",
    filterResolved: "Resolved",
    filterRejected: "Rejected",
    latestStatus: "Latest Updates",
    results: "Results",
    syncing: "Syncing reports...",
    noResults: "No results found in this range.",
    viewMore: "View Details",
    university: "Graduation Project — ZUJ",
    rights: "All rights reserved | Localhost Server Mode",
    myLocation: "Your Location",
    statusMap: {
      "new": "New",
      "review": "In Review",
      "processing": "Processing",
      "resolved": "Resolved",
      "rejected": "Rejected"
    }
  }
};

function Reports() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [lang, setLang] = useState(localStorage.getItem('lang') || "ar");
  const [dark, setDark] = useState(localStorage.getItem('theme') === 'dark');

  const [activeFilter, setActiveFilter] = useState("all");
  const [searchText, setSearchText] = useState("");
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  const mapRef = useRef(null);
  const googleMapRef = useRef(null);
  const markersRef = useRef([]);
  const infoWindowRef = useRef(null);

  const userId = localStorage.getItem("userId");
  const userType = localStorage.getItem("userType");
  const isLoggedIn = !!userId;
  const currentPath = window.location.pathname;

  const t = translations[lang];

  const statusConfig = {
    "جديد": { code: "new", class: "status-new" },
    "قيد المراجعة": { code: "review", class: "status-review" },
    "قيد المعالجة": { code: "processing", class: "status-processing" },
    "تم الحل": { code: "resolved", class: "status-resolved" },
    "مرفوض": { code: "rejected", class: "status-rejected" },
  };

  useEffect(() => {
    fetchReports();
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    localStorage.setItem("appLang", lang);
  }, [lang]);

  useEffect(() => {
    if (dark) document.body.classList.add("dark");
    else document.body.classList.remove("dark");
    localStorage.setItem('theme', dark ? 'dark' : 'light');
    localStorage.setItem('lang', lang);
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  }, [dark, lang]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API}/Reports/public`);
      if (!res.ok) throw new Error("Server Error");
      const data = await res.json();
      
      const mapped = data.map(r => ({
        id: r.reportId,
        title: r.title || (lang === "ar" ? "بلاغ محلي" : "Local Report"),
        location: r.addressText || r.city || (lang === "ar" ? "موقع غير محدد" : "Undefined Location"),
        status: statusConfig[r.statusName]?.code || "new",
        statusLabel: r.statusName,
        statusClass: statusConfig[r.statusName]?.class || "status-new",
        type: r.reportType || "-",
        lat: Number(r.latitude),
        lng: Number(r.longitude),
        priorityName: r.priorityName || null,
        date: r.submittedAt ? new Date(r.submittedAt).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-GB') : "-"
      }));
      setReports(mapped);
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    return reports.filter(r => {
      const matchFilter = activeFilter === "all" || r.status === activeFilter;
      const matchSearch = r.title.toLowerCase().includes(searchText.toLowerCase()) || 
                          r.location.toLowerCase().includes(searchText.toLowerCase());
      return matchFilter && matchSearch;
    });
  }, [reports, activeFilter, searchText]);

  const initMap = () => {
    if (!mapRef.current || !window.google) return;
    
    infoWindowRef.current = new window.google.maps.InfoWindow();
    
    googleMapRef.current = new window.google.maps.Map(mapRef.current, {
      center: { lat: 31.9539, lng: 35.9106 },
      zoom: 9,
      disableDefaultUI: false, streetViewControl: false, mapTypeControl: false, fullscreenControl: true, gestureHandling: 'greedy',
      zoomControl: true,
      styles: dark ? [
          { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
          { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
          { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
          { featureType: "water", elementType: "geometry", stylers: [{ color: "#17263c" }] }
        ] : [{ featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] }]
    });
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        const myPos = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        googleMapRef.current.setCenter(myPos);
        new window.google.maps.Marker({
          position: myPos,
          map: googleMapRef.current,
          title: t.myLocation,
          icon: { path: window.google.maps.SymbolPath.CIRCLE, fillColor: '#4285F4', fillOpacity: 1, strokeColor: 'white', strokeWeight: 2, scale: 8 }
        });
      });
    }
    renderMarkers();
  };

  const renderMarkers = () => {
    if (!googleMapRef.current || !window.google) return;
    markersRef.current.forEach(m => m.setMap(null));
    markersRef.current = filtered.map(r => {
      const marker = new window.google.maps.Marker({
        position: { lat: r.lat, lng: r.lng },
        map: googleMapRef.current,
        title: r.title,
        icon: { path: window.google.maps.SymbolPath.CIRCLE, fillColor: '#0071e3', fillOpacity: 1, strokeColor: '#fff', strokeWeight: 2, scale: 7 }
      });
      
      marker.addListener("click", () => {
        if(infoWindowRef.current) {
          const contentString = (locName) => `
            <div style="font-family: 'Tajawal', sans-serif; text-align: ${lang === 'ar' ? 'right' : 'left'}; padding: 5px 10px; max-width: 250px;">
              <h4 style="margin: 0 0 5px 0; color: #1e293b; font-weight: 800; font-size: 15px;">${r.title}</h4>
              <p style="margin: 0 0 10px 0; color: #64748b; font-size: 12px; display: flex; align-items: center; gap: 4px;">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                ${locName}
              </p>
              <button onclick="localStorage.setItem('selectedReportId', ${r.id}); localStorage.setItem('reportDetailsFrom', '/reports'); window.location.href='/report-details';" style="width: 100%; padding: 8px; background: #0071e3; color: white; border: none; border-radius: 8px; cursor: pointer; font-family: inherit; font-weight: bold; font-size: 12px; transition: 0.2s;">
                ${t.viewMore}
              </button>
            </div>
          `;

          infoWindowRef.current.setContent(contentString(r.location));
          infoWindowRef.current.open(googleMapRef.current, marker);

          if (!r.addressText && !r.city) {
            infoWindowRef.current.setContent(contentString(lang === 'ar' ? 'جاري تحديد الموقع...' : 'Detecting Location...'));
            new window.google.maps.Geocoder().geocode({ location: { lat: r.lat, lng: r.lng } }, (res, status) => {
              if (status === "OK" && res[0]) {
                infoWindowRef.current.setContent(contentString(res[0].formatted_address));
              } else {
                infoWindowRef.current.setContent(contentString(lang === 'ar' ? 'موقع غير محدد' : 'Undefined Location'));
              }
            });
          }
        }
      });
      
      return marker;
    });
  };

  useEffect(() => {
    if (!loading) {
      if (window.google && window.google.maps) {
      initMap();
    } else if (!document.getElementById("google-maps-api-script")) {
      const script = document.createElement("script");
      script.id = "google-maps-api-script";
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyA_S3MTRppCFOzOxG8YprXrUl6sKzPROZY&language=${lang}`;
      script.async = true; 
      script.onload = initMap;
      document.body.appendChild(script);
    } else {
      const script = document.getElementById("google-maps-api-script");
      script.addEventListener("load", initMap);
    }
    }
  }, [loading, lang]);

  useEffect(() => { renderMarkers(); }, [filtered]);

  const goTo = (p) => window.location.href = p;
  const handleLogout = () => { localStorage.clear(); window.location.href = "/"; };
  const requireLogin = (p) => { if (!isLoggedIn) return goTo("/login"); goTo(p); };

  const navLinks = userType === "Sector"
    ? [{ href: "/sector-dashboard", label: t.dashboard }, { href: "/analytics", label: t.analytics }]
    : [{ href: "/reports", label: t.reports }, { href: "/report", label: t.reportNow }, { href: "/my-reports", label: t.myReports }, { href: "/profile", label: t.profile }];

  return (
    <div className="reports-container" dir={lang === "ar" ? "rtl" : "ltr"}>
      
      {/* ── HEADER ── */}
      <header className={`sr-header ${scrolled ? "scrolled" : ""}`}>
        <a className="sr-logo" onClick={() => goTo("/")} style={{cursor:'pointer'}}>
          <img src={logo} alt="SafeRoute" className="sr-logo-img" />
          <span className="sr-logo-text">Safe<span>Route</span></span>
        </a>

        <nav className="sr-nav">
          <a href="/" className={currentPath === "/" ? "active" : ""} onClick={(e) => { e.preventDefault(); goTo("/"); }}>{t.home}</a>
          {navLinks.map(l => (
            <a key={l.href} href={l.href} className={currentPath === l.href ? "active" : ""} 
               onClick={e => { e.preventDefault(); requireLogin(l.href); }}>{l.label}</a>
          ))}
        </nav>

        <div className="sr-header-right">
          <button onClick={() => setDark(!dark)} className="theme-btn"><span className="dot"></span></button>
          <button onClick={() => setLang(lang === "ar" ? "en" : "ar")} className="lang-btn">{lang === "ar" ? "EN" : "AR"}</button>
          
          <div className="sr-bell-container">
            <NotificationBell userId={userId} />
          </div>

          {isLoggedIn
            ? <button className="sr-btn-logout" onClick={handleLogout}>{t.logout}</button>
            : <button className="sr-btn-login" onClick={() => goTo("/login")}>{t.login}</button>
          }
          <button className="sr-hamburger-btn" onClick={() => setMenuOpen(o => !o)}>
            <div className="sr-ham-line" /><div className="sr-ham-line" /><div className="sr-ham-line" />
          </button>
        </div>
      </header>

      {/* Mobile Nav */}
      <nav className={`sr-mobile-nav${menuOpen ? " open" : ""}`}>
        <div className="mobile-options-row">
          <button onClick={() => setDark(!dark)} className="theme-btn"><span className="dot"></span></button>
          <button onClick={() => setLang(lang === "ar" ? "en" : "ar")} className="lang-btn">{lang === "ar" ? "EN" : "AR"}</button>
        </div>
        <a href="/" onClick={() => goTo("/")}>{t.home}</a>
        {navLinks.map(l => (
          <a key={l.href} href={l.href} onClick={e => { e.preventDefault(); setMenuOpen(false); requireLogin(l.href); }}>{l.label}</a>
        ))}
        {isLoggedIn && <button className="sr-btn-logout" style={{width: '100%', padding: '15px', marginTop: '10px'}} onClick={handleLogout}>{t.logoutFull}</button>}
      </nav>

      <section className="reports-hero">
        <div className="sr-eyebrow">{t.eyebrow}</div>
        <h2>{t.title} <em>SafeRoute</em></h2>
        <p style={{color: 'var(--muted)', maxWidth: '600px', margin: '0 auto'}}>{t.subTitle}</p>
      </section>

      <main className="explorer-container">
        <section className="map-visualizer">
          <div className="map-overlay-controls">
            <div className="floating-search">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
              <input type="text" placeholder={t.searchPlaceholder} value={searchText} onChange={(e) => setSearchText(e.target.value)} />
            </div>
            <div className="floating-filters">
              {[
                {id: "all", label: t.filterAll}, {id: "new", label: t.filterNew}, 
                {id: "processing", label: t.filterProcessing}, {id: "resolved", label: t.filterResolved}, {id: "rejected", label: t.filterRejected}
              ].map(f => (
                <button key={f.id} className={`pill-filter ${activeFilter === f.id ? "active" : ""}`} onClick={() => setActiveFilter(f.id)}>
                  {f.label}
                </button>
              ))}
            </div>
          </div>
          <div id="map" ref={mapRef} style={{ width: '100%', height: '100%', minHeight: '400px', borderRadius: '24px', overflow: 'hidden' }}></div>
        </section>

        <section className="reports-side-list">
          <div className="side-list-header">
            <h3>{t.latestStatus}</h3>
            <span className="sr-status-tag status-new">{filtered.length} {t.results}</span>
          </div>
          <div className="side-list-content">
            {loading ? (
                <p style={{textAlign:'center', padding:'20px'}}>{t.syncing}</p>
            ) : filtered.length === 0 ? (
                <p style={{textAlign: 'center', padding: '40px'}}>{t.noResults}</p>
            ) : filtered.map(r => (
              <div className="sr-report-card" key={r.id} onClick={() => { localStorage.setItem("selectedReportId", r.id); localStorage.setItem("reportDetailsFrom", "/reports"); goTo("/report-details"); }}>
                <div className="card-title-row">
                  <h4>{r.title}</h4>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                    {r.priorityName && (() => {
                      const p = r.priorityName;
                      const isHigh = ['عالية','طارئ','High','Emergency','عاجل'].includes(p);
                      const isMed = ['متوسطة','متوسط','Medium'].includes(p);
                      return (
                        <span style={{ 
                          padding: '3px 10px', borderRadius: 99, fontSize: 11, fontWeight: 800,
                          background: isHigh ? 'rgba(239,68,68,0.12)' : isMed ? 'rgba(245,158,11,0.12)' : 'rgba(34,197,94,0.12)',
                          color: isHigh ? '#dc2626' : isMed ? '#d97706' : '#16a34a'
                        }}>
                          {isHigh ? '🔴' : isMed ? '🟡' : '🟢'} {p}
                        </span>
                      );
                    })()}
                    <span className={`sr-status-tag ${r.statusClass}`}>{t.statusMap[r.status] || r.statusLabel}</span>
                  </div>
                </div>
                <div className="card-meta">
                  <span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>{r.location}</span>
                  <span>{r.date}</span>
                </div>
                <button className="btn-view-more">{t.viewMore}</button>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer>
        <div className="sr-footer">
          <a className="sr-logo" onClick={() => goTo("/")} style={{cursor:'pointer'}}>
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

export default Reports;