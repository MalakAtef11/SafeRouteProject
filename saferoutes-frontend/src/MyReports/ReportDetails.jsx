import { useEffect, useRef, useState } from "react";
import logo from "../Login-Register/logo.png";
import NotificationBell from "../components/NotificationBell";
import "./reportdetails.css";
import API from "../api/api.js";

const SERVER_URL = "http://localhost:5029"; 

const translations = {
  ar: {
    home: "الرئيسية",
    logout: "خروج",
    logoutMenu: "تسجيل الخروج",
    navSector: [{ href: "/sector-dashboard", label: "لوحة التحكم" }, { href: "/analytics", label: "الإحصائيات" }, { href: "/chat", label: "الدردشات" }],
    navUser: [{ href: "/reports", label: "البلاغات" }, { href: "/report", label: "أبلغ الآن" }, { href: "/my-reports", label: "بلاغاتي" }, { href: "/profile", label: "ملفي" }, { href: "/chat", label: "الدردشات" }],
    loading: "جاري تحميل تفاصيل البلاغ...",
    reportNum: "رقم البلاغ",
    date: "تاريخ التقديم",
    goBack: "العودة لقائمة البلاغات",
    descTitle: "وصف المشكلة",
    sectorsTitle: "الجهات المسؤولة عن المعالجة:",
    attachTitle: "المرفقات المدعومة بالذكاء الاصطناعي:",
    noMedia: "لا توجد صور أو تسجيلات صوتية لهذا البلاغ.",
    footerProj: "مشروع تخرج — جامعة الزيتونة الأردنية",
    footerCopy: "© 2026 جميع الحقوق محفوظة لنظام SafeRoute",
    commentsTitle: "ملاحظات وتحديثات البلاغ المشتركة",
    addCommentPlaceholder: "اكتب رسالة أو استفساراً هنا للمتابعة...",
    sendCommentBtn: "إرسال التعليق",
    noComments: "لا توجد ملاحظات أو تعليقات على هذا البلاغ حتى الآن.",
    anonymousUser: "مستخدم نظام"
  },
  en: {
    home: "Home",
    logout: "Logout",
    logoutMenu: "Log Out",
    navSector: [{ href: "/sector-dashboard", label: "Dashboard" }, { href: "/analytics", label: "Analytics" }, { href: "/chat", label: "Chats" }],
    navUser: [{ href: "/reports", label: "Reports" }, { href: "/report", label: "Report Now" }, { href: "/my-reports", label: "My Reports" }, { href: "/profile", label: "Profile" }, { href: "/chat", label: "Chats" }],
    loading: "Loading report details...",
    reportNum: "Report No.",
    date: "Submission Date",
    goBack: "Back to Reports List",
    descTitle: "Issue Description",
    sectorsTitle: "Responsible Sectors:",
    attachTitle: "AI-Powered Attachments:",
    noMedia: "No images or audio recordings for this report.",
    footerProj: "Graduation Project — Al-Zaytoonah University of Jordan",
    footerCopy: "© 2026 All Rights Reserved for SafeRoute System",
    commentsTitle: "Report Notes & Updates",
    addCommentPlaceholder: "Write a message or inquiry here to follow up...",
    sendCommentBtn: "Send Comment",
    noComments: "No notes or comments on this report yet.",
    anonymousUser: "System User"
  }
};

function ReportDetails() {
  const [scrolled, setScrolled] = useState(false);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lang, setLang] = useState(localStorage.getItem('lang') || "ar");
  const [dark, setDark] = useState(localStorage.getItem('theme') === 'dark');
  const [menuOpen, setMenuOpen] = useState(false);
  const [translated, setTranslated] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [translatedTitle, setTranslatedTitle] = useState("");
  const [translatedDesc, setTranslatedDesc] = useState("");

  // Notes/Comments States
  const [notes, setNotes] = useState([]);
  const [noteText, setNoteText] = useState("");
  const [submittingNote, setSubmittingNote] = useState(false);

  const mapRef = useRef(null);
  const googleMapRef = useRef(null);

  const userId = localStorage.getItem("userId");
  const userType = localStorage.getItem("userType");
  const selectedId = Number(localStorage.getItem("selectedReportId"));

  const t = translations[lang];
  const navLinks = userType === "Sector" ? t.navSector : t.navUser;

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

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);

    if (!selectedId) {
      window.location.href = localStorage.getItem("reportDetailsFrom") || "/reports";
      return;
    }

    loadReport();

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const loadNotes = async () => {
    try {
      const res = await fetch(`${API}/Reports/${selectedId}/notes`);
      if (res.ok) {
        const data = await res.json();
        setNotes(data);
      }
    } catch (e) {
      console.error("Error loading report notes:", e);
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!noteText.trim()) return;
    setSubmittingNote(true);
    try {
      const res = await fetch(`${API}/Reports/${selectedId}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          createdByUserID: Number(userId),
          noteText: noteText
        })
      });
      if (res.ok) {
        setNoteText("");
        await loadNotes();
      } else {
        alert(lang === "ar" ? "فشل إضافة التعليق" : "Failed to add comment");
      }
    } catch (err) {
      console.error("Error adding note:", err);
      alert(lang === "ar" ? "حدث خطأ أثناء إضافة التعليق" : "An error occurred while adding the comment");
    } finally {
      setSubmittingNote(false);
    }
  };

  const loadReport = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API}/Reports/public`);
      const data = await res.json();

      const found = data.find(r => r.reportId === selectedId);
      if (found) {
        setReport({
          ...found,
          image: found.imageUrl ? `${SERVER_URL}/${found.imageUrl.replace(/\\/g, "/")}` : null,
          audio: found.audioUrl ? `${SERVER_URL}/${found.audioUrl.replace(/\\/g, "/")}` : null,
          date: new Date(found.submittedAt).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-GB')
        });
      }
      await loadNotes();
    } catch (e) { 
      console.error("Error loading report details locally:", e); 
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => {
    const initMap = () => {
      if (!mapRef.current || !window.google || !report) return;
      const pos = { lat: Number(report.latitude), lng: Number(report.longitude) };
      googleMapRef.current = new window.google.maps.Map(mapRef.current, {
        center: pos, zoom: 15, disableDefaultUI: false, zoomControl: true, streetViewControl: false, mapTypeControl: false, fullscreenControl: true, gestureHandling: 'greedy',
        styles: dark ? [
          { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
          { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
          { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
          { featureType: "water", elementType: "geometry", stylers: [{ color: "#17263c" }] }
        ] : [ { "featureType": "poi", "stylers": [ { "visibility": "off" } ] } ]
      });
      const marker = new window.google.maps.Marker({ 
        position: pos, 
        map: googleMapRef.current, 
        icon: { path: window.google.maps.SymbolPath.CIRCLE, scale: 10, fillColor: '#0071e3', fillOpacity: 1, strokeColor: 'white', strokeWeight: 3 } 
      });

      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="font-family: 'Tajawal', sans-serif; text-align: center; padding: 5px 10px; color: #1e293b; font-weight: 800; font-size: 14px;">
            ${report.title || (lang === 'ar' ? "بلاغ محلي" : "Local Report")}<br>
            <span style="color: #64748b; font-size: 12px; font-weight: 600;">${report.addressText || report.city || (lang === 'ar' ? 'جاري تحديد الموقع...' : 'Detecting Location...')}</span>
          </div>
        `
      });
      infoWindow.open(googleMapRef.current, marker);

      // Reverse Geocode if address is missing
      if (!report.addressText || report.addressText === "Undefined" || report.addressText === "موقع غير محدد") {
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ location: pos }, (res, status) => {
          if (status === "OK" && res[0]) {
            infoWindow.setContent(`
              <div style="font-family: 'Tajawal', sans-serif; text-align: center; padding: 5px 10px; color: #1e293b; font-weight: 800; font-size: 14px;">
                ${report.title || (lang === 'ar' ? "بلاغ محلي" : "Local Report")}<br>
                <span style="color: #64748b; font-size: 12px; font-weight: 600;">${res[0].formatted_address}</span>
              </div>
            `);
          } else {
             infoWindow.setContent(`
              <div style="font-family: 'Tajawal', sans-serif; text-align: center; padding: 5px 10px; color: #1e293b; font-weight: 800; font-size: 14px;">
                ${report.title || (lang === 'ar' ? "بلاغ محلي" : "Local Report")}<br>
                <span style="color: #64748b; font-size: 11px; font-weight: 600;" dir="ltr">📍 ${pos.lat.toFixed(4)}, ${pos.lng.toFixed(4)} <br/>(${status})</span>
              </div>
            `);
          }
        });
      }
    };

    if (!loading && report) {
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
  }, [loading, report, dark, lang]);

  const goTo = (p) => window.location.href = p;
  const handleLogout = () => { localStorage.clear(); goTo("/"); };

  const handleTranslate = async () => {
    if (translated) { setTranslated(false); return; }
    if (!report) return;
    setTranslating(true);
    try {
      const translateText = async (text) => {
        if (!text) return "";
        const res = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=ar|en`);
        const data = await res.json();
        return data.responseData?.translatedText || text;
      };
      const [title, desc] = await Promise.all([
        translateText(report.title),
        translateText(report.description)
      ]);
      setTranslatedTitle(title);
      setTranslatedDesc(desc);
      setTranslated(true);
    } catch (err) {
      console.error("Translation failed:", err);
    } finally {
      setTranslating(false);
    }
  };

  if (loading || !report) return <div className="loading-screen">{t.loading}</div>;

  return (
    <div className="report-details-container" dir={lang === "ar" ? "rtl" : "ltr"}>
      {/* ── HEADER ── */}
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

      {/* ── MOBILE NAV ── */}
      <nav className={`sr-mobile-nav ${menuOpen ? "open" : ""}`}>
        <div className="mobile-options-row">
          <button onClick={() => setDark(!dark)} className="theme-btn"><span className="dot"></span></button>
          <button onClick={() => setLang(lang === "ar" ? "en" : "ar")} className="lang-btn">{lang === "ar" ? "EN" : "AR"}</button>
        </div>
        <a href="/" onClick={(e) => { e.preventDefault(); goTo("/"); }}>{t.home}</a>
        {navLinks.map(l => <a key={l.href} href={l.href} onClick={(e) => { e.preventDefault(); goTo(l.href); }}>{l.label}</a>)}
        {userId && <button className="sr-btn-logout" style={{width: '100%', padding: '15px'}} onClick={handleLogout}>{t.logoutMenu}</button>}
      </nav>

      {/* ── MAP ── */}
      <div className="map-full-bg"><div id="map" ref={mapRef}></div></div>

      {/* ── CONTENT ── */}
      <main className="details-scroll-layer">
        <div className="right-side-stack">
          
          <div className="notch-card-v2">
            <div className="notch-vertical-tab">{t.reportNum} #{report.reportId}</div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', marginBottom: 15 }}>
              <div className="report-status-badge">
                <div className="status-dot"></div>{report.statusName}
              </div>
              {report.priorityName && (() => {
                const p = report.priorityName;
                const isHigh = ['عالية','طارئ','High','Emergency','عاجل'].includes(p);
                const isMed = ['متوسطة','متوسط','Medium'].includes(p);
                return (
                  <div style={{ 
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    padding: '6px 16px', borderRadius: 99, fontSize: 13, fontWeight: 800,
                    background: isHigh ? 'rgba(239,68,68,0.12)' : isMed ? 'rgba(245,158,11,0.12)' : 'rgba(34,197,94,0.12)',
                    color: isHigh ? '#dc2626' : isMed ? '#d97706' : '#16a34a',
                    border: `1.5px solid ${isHigh ? 'rgba(239,68,68,0.3)' : isMed ? 'rgba(245,158,11,0.3)' : 'rgba(34,197,94,0.3)'}`
                  }}>
                    {isHigh ? '🔴' : isMed ? '🟡' : '🟢'} {lang === 'ar' ? 'الخطورة:' : 'Priority:'} {p}
                  </div>
                );
              })()}
            </div>
            <h1 className="title-h1">{translated ? translatedTitle : report.title}</h1>
            <p className="submission-date">{t.date}: {report.date}</p>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button className="btn-modern-main" onClick={() => goTo(localStorage.getItem("reportDetailsFrom") || "/reports")}>{t.goBack}</button>
              <button onClick={handleTranslate} disabled={translating} style={{ padding: '12px 24px', borderRadius: 99, border: '1.5px solid var(--blue)', background: translated ? 'var(--blue)' : 'transparent', color: translated ? '#fff' : 'var(--blue)', fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit', fontSize: 14, transition: '0.3s', display: 'flex', alignItems: 'center', gap: 8 }}>
                🌐 {translating ? (lang === 'ar' ? 'جاري الترجمة...' : 'Translating...') : translated ? (lang === 'ar' ? 'عرض الأصلي' : 'Show Original') : (lang === 'ar' ? 'ترجمة للإنجليزية' : 'Translate to English')}
              </button>
              {userType === "Sector" && report.citizenUserId && (
                <button 
                  onClick={() => {
                    localStorage.setItem("chatWithUserId", report.citizenUserId);
                    localStorage.setItem("chatWithUserName", report.citizenName || (lang === 'ar' ? "مواطن" : "Citizen"));
                    localStorage.setItem("chatReportId", report.reportId);
                    localStorage.setItem("chatReportTitle", report.title);
                    goTo("/chat");
                  }}
                  style={{ 
                    padding: '12px 24px', 
                    borderRadius: 99, 
                    border: 'none', 
                    background: 'var(--blue, #0071e3)', 
                    color: '#fff', 
                    fontWeight: 800, 
                    cursor: 'pointer', 
                    fontFamily: 'inherit', 
                    fontSize: 14, 
                    transition: '0.3s', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 8 
                  }}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: '16px', height: '16px' }}>
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                  </svg>
                  {lang === 'ar' ? 'تواصل مع مرسل البلاغ' : 'Contact Reporter'}
                </button>
              )}
            </div>
          </div>

          <div className="glass-panel">
            <div className="block-title-row">
              <div className="blue-marker"></div>
              <h3 className="section-title">{t.descTitle}</h3>
            </div>
            <p className="issue-desc" dir={translated ? 'ltr' : undefined} style={translated ? { textAlign: 'left' } : {}}>{translated ? translatedDesc : report.description}</p>

            {/* Sectors */}
            {report.sectors && report.sectors.length > 0 && (
              <div className="sectors-section">
                <h4 className="section-subtitle">{t.sectorsTitle}</h4>
                <div className="sectors-list">
                  {report.sectors.map((s, idx) => (
                    <span key={idx} className="sector-pill">{s.name || s.sectorName}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Attachments */}
            <div className="attachments-section">
               <h4 className="section-subtitle">{t.attachTitle}</h4>
               
               {report.image && (
                <div className="image-box">
                  <img src={report.image} alt="Report Visual" />
                </div>
              )}

              {report.audio && (
                <div className="audio-box">
                  <audio controls src={report.audio} />
                </div>
              )}

              {!report.image && !report.audio && (
                <p className="no-media-msg">
                  {t.noMedia}
                </p>
              )}
            </div>
          </div>


        </div>
      </main>

      {/* ── FOOTER ── */}
      <footer className="sr-footer">
        <a className="sr-logo" onClick={() => goTo("/")} style={{textDecoration:'none', cursor:'pointer'}}>
          <img src={logo} alt="SafeRoute" className="sr-logo-img" />
          <span className="sr-logo-text">Safe<span>Route</span></span>
        </a>
        <div style={{textAlign: lang === "ar" ? "right" : "left"}}>
          <p style={{fontSize:'12px', color:'var(--muted)'}}>{t.footerProj}</p>
          <p style={{fontSize:'12px', color:'var(--muted)', marginTop:'4px'}}>Developed by <strong>Malak Atef</strong></p>
        </div>
        <div className="sr-footer-copy">{t.footerCopy}</div>
      </footer>
    </div>
  );
}

export default ReportDetails;