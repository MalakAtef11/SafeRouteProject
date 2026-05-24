import { useEffect, useRef, useState } from "react";
import logo from "../Login-Register/logo.png";
import NotificationBell from "../components/NotificationBell";
import "./myreports.css";
import toast, { Toaster } from "react-hot-toast";


const MicIco = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" /></svg>;
const CameraIco = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" /></svg>;

const API_BASE = "http://localhost:5029/api/v1";

const translations = {
  ar: {
    home: "الرئيسية",
    reports: "البلاغات",
    reportNow: "أبلغ الآن",
    myReports: "بلاغاتي",
    profile: "ملفي",
    dashboard: "لوحة التحكم",
    logout: "خروج",
    logoutMenu: "تسجيل الخروج",
    pageTitle: "سجل بلاغاتي",
    loading: "جاري جلب بياناتك...",
    noReports: "لم تقم بإرسال أي بلاغات بعد.",
    confirmDelete: "هل أنت متأكد من حذف هذا البلاغ نهائياً؟",
    deleting: "جاري الحذف محلياً...",
    deleted: "تم الحذف بنجاح 🗑️",
    deleteFail: "فشل الحذف. حاول مجدداً.",
    unknownCity: "غير محدد",
    stepNew: "جديد",
    stepReview: "قيد المراجعة",
    stepProcess: "قيد المعالجة",
    stepDone: "تم الحل",
    btnDetails: "متابعة التفاصيل",
    editTitle: "تعديل بيانات البلاغ",
    descLabel: "وصف البلاغ",
    mapLabel: "الموقع (اسحب الدبوس للتعديل)",
    saveBtn: "حفظ التغييرات",
    cancelBtn: "إلغاء",
    saving: "جاري حفظ التعديلات...",
    saved: "تم التحديث بنجاح ✅",
    saveFail: "فشل التحديث",
  },
  en: {
    home: "Home",
    reports: "Reports",
    reportNow: "Report Now",
    myReports: "My Reports",
    profile: "Profile",
    dashboard: "Dashboard",
    logout: "Logout",
    logoutMenu: "Log Out",
    pageTitle: "My Reports History",
    loading: "Fetching your data...",
    noReports: "You haven't submitted any reports yet.",
    confirmDelete: "Are you sure you want to permanently delete this report?",
    deleting: "Deleting locally...",
    deleted: "Deleted successfully 🗑️",
    deleteFail: "Failed to delete. Try again.",
    unknownCity: "Unspecified",
    stepNew: "New",
    stepReview: "Under Review",
    stepProcess: "In Progress",
    stepDone: "Resolved",
    btnDetails: "View Details",
    editTitle: "Edit Report Details",
    descLabel: "Report Description",
    mapLabel: "Location (Drag pin to adjust)",
    saveBtn: "Save Changes",
    cancelBtn: "Cancel",
    saving: "Saving changes...",
    saved: "Updated successfully ✅",
    saveFail: "Update failed",
  }
};

const CheckIco = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5"><polyline points="20 6 9 17 4 12" /></svg>;
const PinIco = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>;
const DateIco = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>;
const EditIco = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>;
const TrashIco = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>;

function MyReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  const [dark, setDark] = useState(localStorage.getItem('theme') === 'dark');
  const [lang, setLang] = useState(localStorage.getItem('lang') || "ar");

  const [editingReport, setEditingReport] = useState(null);
  const [reportToDelete, setReportToDelete] = useState(null);
  const [editLat, setEditLat] = useState(null);
  const [editLng, setEditLng] = useState(null);
  const [editAddr, setEditAddr] = useState("");
  const [recording, setRecording] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const uploadRef = useRef(null);

  const [newAudioBlob, setNewAudioBlob] = useState(null);
  const [newAudioUrl, setNewAudioUrl] = useState(null);
  const [newImageFile, setNewImageFile] = useState(null);
  const [newImagePreview, setNewImagePreview] = useState(null);

  const mapRef = useRef(null);
  const gMap = useRef(null);
  const markerRef = useRef(null);
  const infoWindowRef = useRef(null);

  const userId = localStorage.getItem("userId");
  const userType = localStorage.getItem("userType");

  const t = translations[lang];

  useEffect(() => {
    if (dark) document.body.classList.add("dark");
    else document.body.classList.remove("dark");
    localStorage.setItem('theme', dark ? 'dark' : 'light');
    localStorage.setItem('lang', lang);
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  }, [dark, lang]);

  useEffect(() => {
    if (!userId) {
      window.location.href = "/login";
      return;
    }
    loadMyReports();
  }, []);

  const loadMyReports = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/Reports/my?userId=${userId}`);
      const data = await res.json();

      if (res.ok) {
        setReports(data);
      } else {
        toast.error("فشل تحميل البلاغات");
      }
    } catch {
      toast.error("خطأ في الاتصال");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id) => {
    setReportToDelete(id);
  };

  const executeDelete = async () => {
    if (!reportToDelete) return;
    const id = reportToDelete;
    setReportToDelete(null);
    const loader = toast.loading(t.deleting);
    try {
      const res = await fetch(`${API_BASE}/Reports/${id}`, { 
        method: "DELETE",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json"
        }
      });
      
      if (res.ok) {
        toast.dismiss(loader);
        toast.success(t.deleted);
        setReports(prev => prev.filter(r => r.reportId !== id));
      } else {
        const errText = await res.text();
        console.error(`❌ Delete failed with status: ${res.status}`, errText);
        throw new Error(`خطأ سيرفر: ${res.status}`);
      }
    } catch (err) {
      console.error("❌ Catch error in handleDelete:", err);
      toast.dismiss(loader);
      toast.error(`${t.deleteFail} - ${err.message || ""}`);
    }
  };

  const toggleRecording = async () => {
    if (recording) { mediaRecorderRef.current.stop(); return; }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];
      mediaRecorderRef.current.ondataavailable = (e) => audioChunksRef.current.push(e.data);
      mediaRecorderRef.current.onstop = async () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        setNewAudioBlob(blob);
        setNewAudioUrl(URL.createObjectURL(blob));
        setNewAudioUrl(URL.createObjectURL(blob));
        setRecording(false);
        toast.success(lang === 'ar' ? 'تم تسجيل الصوت بنجاح' : 'Audio recorded successfully');
      };
      mediaRecorderRef.current.start();
      setRecording(true);
    } catch { toast.error(t.micErr || 'خطأ في الميكروفون'); }
  };

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewImageFile(file);
      setNewImagePreview(URL.createObjectURL(file));
      toast.success(lang === 'ar' ? 'تم تحديد الصورة بنجاح' : 'Image selected successfully');
    }
  };

  // AI analysis moved to handleUpdate

  const renderMap = () => {
    if (!mapRef.current || !window.google || !editingReport) return;
    const pos = { lat: Number(editingReport.latitude) || 31.9539, lng: Number(editingReport.longitude) || 35.9106 };

    gMap.current = new window.google.maps.Map(mapRef.current, {
      center: pos, zoom: 15, disableDefaultUI: true, zoomControl: true,
      styles: [{ featureType: "poi", stylers: [{ visibility: "off" }] }]
    });

    const marker = new window.google.maps.Marker({
      position: pos,
      map: gMap.current,
      draggable: true,
      icon: { path: window.google.maps.SymbolPath.CIRCLE, scale: 9, fillColor: '#0071e3', fillOpacity: 1, strokeColor: 'white', strokeWeight: 2 }
    });
    markerRef.current = marker;

    const infoWindow = new window.google.maps.InfoWindow({
      content: `<div style="font-family: 'Tajawal', sans-serif; font-size: 13px; font-weight: 700; color: #1e293b;">${editingReport.addressText || editingReport.city || t.unknownCity}</div>`
    });
    infoWindowRef.current = infoWindow;
    infoWindow.open(gMap.current, marker);

    const updateLoc = (latLng) => {
      setEditLat(latLng.lat());
      setEditLng(latLng.lng());
      new window.google.maps.Geocoder().geocode({ location: latLng }, (r) => {
        if (r && r[0]) {
          setEditAddr(r[0].formatted_address);
          infoWindow.setContent(`<div style="font-family: 'Tajawal', sans-serif; font-size: 13px; font-weight: 700; color: #1e293b;">${r[0].formatted_address}</div>`);
        }
      });
    };

    marker.addListener("dragend", () => updateLoc(marker.getPosition()));
    gMap.current.addListener("click", (e) => { marker.setPosition(e.latLng); updateLoc(e.latLng); });

    setTimeout(() => {
      window.google.maps.event.trigger(gMap.current, 'resize');
      gMap.current.setCenter(pos);
    }, 100);
  };

  const handleCurrentLocation = () => {
    if (navigator.geolocation) {
      toast.loading(lang === 'ar' ? "جاري تحديد الموقع..." : "Getting location...", { id: "loc" });
      navigator.geolocation.getCurrentPosition((pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setEditLat(coords.lat);
        setEditLng(coords.lng);
        
        if (gMap.current) {
          gMap.current.setCenter(coords);
          if (markerRef.current) markerRef.current.setPosition(coords);
        }
        new window.google.maps.Geocoder().geocode({ location: coords }, (res) => {
          if (res && res[0]) {
            setEditAddr(res[0].formatted_address);
            if (infoWindowRef.current) {
              infoWindowRef.current.setContent(`<div style="font-family: 'Tajawal', sans-serif; font-size: 13px; font-weight: 700; color: #1e293b;">${res[0].formatted_address}</div>`);
            }
          }
        });
        toast.success(lang === 'ar' ? 'تم التحديث بنجاح' : 'Location updated', { id: "loc" });
      }, () => {
        toast.error(lang === 'ar' ? 'فشل تحديد الموقع' : 'Failed to get location', { id: "loc" });
      });
    }
  };

  useEffect(() => {
    if (editingReport) {
      const initOrLoadMap = () => {
        if (window.google && window.google.maps) {
          setTimeout(renderMap, 300);
        } else if (!document.getElementById("google-maps-api-script")) {
          const script = document.createElement("script");
          script.id = "google-maps-api-script";
          script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyA_S3MTRppCFOzOxG8YprXrUl6sKzPROZY&language=${lang}`;
          script.async = true;
          script.onload = () => setTimeout(renderMap, 300);
          document.body.appendChild(script);
        } else {
          const script = document.getElementById("google-maps-api-script");
          script.addEventListener("load", () => setTimeout(renderMap, 300));
        }
      };
      initOrLoadMap();
    }
  }, [editingReport, lang]);

  const handleUpdate = async () => {
    setAnalyzing(true);
    const loader = toast.loading(lang === 'ar' ? 'جاري التحديث وتحليل الذكاء الاصطناعي...' : 'Updating & AI Analyzing...');
    try {
      const formData = new FormData();
      formData.append("citizenUserID", userId);

      // Description: use what user typed in the textarea
      const finalDescription = editingReport.description?.trim() || 
        (newAudioBlob ? (lang === 'ar' ? 'بلاغ صوتي' : 'Voice Report') : 
        (newImageFile ? (lang === 'ar' ? 'بلاغ مصور' : 'Image Report') : 
        (lang === 'ar' ? 'بلاغ محدث' : 'Updated Report')));
      formData.append("Description", finalDescription);

      // Location
      formData.append("Latitude", editLat || editingReport.latitude);
      formData.append("Longitude", editLng || editingReport.longitude);
      formData.append("AddressText", editAddr || editingReport.addressText || (lang === 'ar' ? 'موقع محدد على الخريطة' : 'Location marked on map'));

      // Media: send new media if exists
      if (newAudioBlob) formData.append("audio", newAudioBlob, "audio.webm");
      if (newImageFile) formData.append("image", newImageFile);

      // Tell backend to remove old media if user deleted it
      if (!editingReport.imageUrl && !newImageFile) formData.append("removeImage", "true");
      if (!editingReport.audioUrl && !newAudioBlob) formData.append("removeAudio", "true");

      console.log("📤 Sending update to AI/update-report/" + editingReport.reportId);

      const res = await fetch(`${API_BASE}/AI/update-report/${editingReport.reportId}`, {
        method: "PUT",
        body: formData
      });

      console.log("📡 Response status:", res.status);

      if (res.ok) {
        toast.dismiss(loader);
        toast.success(lang === 'ar' ? 'تم التحديث والتحليل بنجاح ✅' : 'Updated & Analyzed successfully ✅');
        setEditingReport(null);
        setNewAudioBlob(null); setNewAudioUrl(null);
        setNewImageFile(null); setNewImagePreview(null);
        setEditAddr(""); setEditLat(null); setEditLng(null);
        // Refetch fresh data from DB
        await loadMyReports();
      } else {
        const errText = await res.text();
        console.error("❌ Update failed:", res.status, errText);
        toast.dismiss(loader);
        toast.error(t.saveFail + ` (${res.status})`);
      }
    } catch (err) {
      console.error("Update error:", err);
      toast.dismiss(loader);
      toast.error(t.saveFail);
    } finally {
      setAnalyzing(false);
    }
  };


  const navLinks = userType === "Sector"
    ? [{ href: "/sector-dashboard", label: t.dashboard }]
    : [{ href: "/reports", label: t.reports }, { href: "/report", label: t.reportNow }, { href: "/my-reports", label: t.myReports }, { href: "/profile", label: t.profile }];

  const getSteps = (status) => {
    const steps = [t.stepNew, t.stepReview, t.stepProcess, t.stepDone];
    let idx = 0;
    if (status === "Under Review" || status === "قيد المراجعة") idx = 1;
    if (status === "In Progress" || status === "قيد المعالجة") idx = 2;
    if (status === "Resolved" || status === "تم الحل") idx = 3;

    return steps.map((label, i) => ({ label, completed: i <= idx }));
  };

  const goTo = (p) => window.location.href = p;
  const handleLogout = () => { localStorage.clear(); goTo("/"); };

  return (
    <div dir={lang === "ar" ? "rtl" : "ltr"}>
      <Toaster position="top-center" />

      <header className="sr-header">
        <a className="sr-logo" onClick={() => goTo("/")} style={{ cursor: 'pointer' }}>
          <img src={logo} alt="SafeRoute" className="sr-logo-img" />
          <span className="sr-logo-text">Safe<span>Route</span></span>
        </a>
        <nav className="sr-nav">
          <a href="/" onClick={(e) => { e.preventDefault(); goTo("/"); }}>{t.home}</a>
          {navLinks.map(l => (
            <a key={l.href} href={l.href} className={window.location.pathname === l.href ? "active" : ""} onClick={(e) => { e.preventDefault(); goTo(l.href); }}>
              {l.label}
            </a>
          ))}
        </nav>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }} className="sr-header-right">
          <button onClick={() => setDark(!dark)} className="theme-btn"><span className="dot"></span></button>
          <button onClick={() => setLang(lang === "ar" ? "en" : "ar")} className="lang-btn">{lang === "ar" ? "EN" : "AR"}</button>
          <div className="sr-bell-box"><NotificationBell userId={userId} /></div>
          {userId && <button className="sr-btn-logout" onClick={handleLogout}>{t.logout}</button>}
          <button className="sr-hamburger" onClick={() => setMenuOpen(!menuOpen)}>
            <div className="sr-ham-line" /><div className="sr-ham-line" /><div className="sr-ham-line" />
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
        <button className="sr-btn-logout" style={{ width: '100%', padding: '15px' }} onClick={handleLogout}>{t.logoutMenu}</button>
      </nav>

      <main className="reports-prism-wrapper">
        <h1 className="hero-stats-h1">{t.pageTitle}</h1>

        <div className="cards-stack">
          {loading ? (
            <p style={{ textAlign: 'center' }}>{t.loading}</p>
          ) : reports.length === 0 ? (
            <p style={{ textAlign: 'center' }}>{t.noReports}</p>
          ) : reports.map(r => (
            <div className="report-card-modern" key={r.reportId}>
              <div className="card-notch">#{r.reportId}</div>

              {/* Priority Badge */}
              {r.priorityName && (() => {
                const p = r.priorityName;
                const isHigh = ['عالية','طارئ','High','Emergency','عاجل'].includes(p);
                const isMed = ['متوسطة','متوسط','Medium'].includes(p);
                return (
                  <span style={{ 
                    display: 'inline-flex', alignItems: 'center', gap: 5,
                    padding: '4px 14px', borderRadius: 99, fontSize: 12, fontWeight: 800,
                    marginBottom: 8,
                    background: isHigh ? 'rgba(239,68,68,0.12)' : isMed ? 'rgba(245,158,11,0.12)' : 'rgba(34,197,94,0.12)',
                    color: isHigh ? '#dc2626' : isMed ? '#d97706' : '#16a34a',
                    border: `1px solid ${isHigh ? 'rgba(239,68,68,0.3)' : isMed ? 'rgba(245,158,11,0.3)' : 'rgba(34,197,94,0.3)'}`
                  }}>
                    {isHigh ? '🔴' : isMed ? '🟡' : '🟢'} {p}
                  </span>
                );
              })()}

              <h3 style={{ fontSize: 24, fontWeight: 900, marginBottom: 10, paddingLeft: lang === 'ltr' ? 0 : 40, paddingRight: lang === 'ltr' ? 40 : 0 }}>{r.title}</h3>
              <div style={{ display: 'flex', gap: 20, color: 'var(--muted)', fontSize: 14, fontWeight: 700 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><PinIco /> {r.addressText || r.city || t.unknownCity}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><DateIco /> {new Date(r.submittedAt).toLocaleDateString()}</span>
              </div>

              <div className="timeline-clean">
                {getSteps(r.statusName).map((step, i) => (
                  <div className={`t-node ${step.completed ? 'done' : ''}`} key={i}>
                    <div className="t-circle"><CheckIco /></div>
                    <span className="t-text">{step.label}</span>
                  </div>
                ))}
              </div>

              <div className="action-buttons-row">
                <button className="btn-modern-main" onClick={() => { localStorage.setItem("selectedReportId", r.reportId); localStorage.setItem("reportDetailsFrom", "/my-reports"); goTo("/report-details"); }}>{t.btnDetails}</button>
                <button className="btn-modern-icon edit" title={t.editTitle} onClick={() => { setEditingReport(r); setEditAddr(r.addressText); }}><EditIco /></button>
                <button className="btn-modern-icon delete" title={t.confirmDelete} onClick={() => handleDelete(r.reportId)}><TrashIco /></button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {editingReport && (
        <div className="modal-overlay" style={{ backdropFilter: 'blur(10px)', alignItems: 'flex-start', padding: '20px', overflowY: 'auto' }}>
          <div className="modal-box chic-input-card" style={{ margin: 'auto', width: '100%', maxWidth: 500, borderRadius: 'var(--r-xl)', position: 'relative', border: '1px solid var(--stone)' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: 6, background: 'var(--blue)', borderTopLeftRadius: 'var(--r-xl)', borderTopRightRadius: 'var(--r-xl)' }}></div>
            <h3 style={{ fontSize: 22, fontWeight: 900, marginBottom: 20, color: 'var(--ink)' }}>{t.editTitle}</h3>

            <div className="input-group">
              <label style={{ fontWeight: 800, color: 'var(--muted)', fontSize: 14, marginBottom: 8, display: 'block' }}>{t.descLabel}</label>
              <textarea className="ai-textarea" rows="3" value={editingReport.description} onChange={e => setEditingReport({ ...editingReport, description: e.target.value })} style={{ width: '100%', padding: 15, borderRadius: 20, border: '1.5px solid var(--stone)', background: 'var(--bg-main)', color: 'var(--ink)', fontFamily: 'inherit', resize: 'none' }} />
            </div>

            {/* Existing Media Previews */}
            {(editingReport.imageUrl || editingReport.audioUrl) && (
              <div className="input-group" style={{ marginTop: 20 }}>
                <label style={{ fontWeight: 800, color: 'var(--muted)', fontSize: 14, marginBottom: 8, display: 'block' }}>{lang === 'ar' ? 'المرفقات الحالية' : 'Current Attachments'}</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {editingReport.imageUrl && (
                    <div style={{ position: 'relative', padding: 10, borderRadius: 16, border: '1.5px solid var(--stone)', background: 'var(--bg-main)' }}>
                      <button type="button" onClick={() => setEditingReport({ ...editingReport, imageUrl: null })} style={{ position: 'absolute', top: 8, right: 8, width: 28, height: 28, borderRadius: '50%', background: '#ef4444', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 900, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>✕</button>
                      <img src={editingReport.imageUrl.startsWith('http') ? editingReport.imageUrl : (editingReport.imageUrl.startsWith('/') ? `http://localhost:5029${editingReport.imageUrl}` : `http://localhost:5029/${editingReport.imageUrl}`)} alt="Attached" style={{ width: '100%', borderRadius: 10, maxHeight: 150, objectFit: 'cover' }} />
                    </div>
                  )}
                  {editingReport.audioUrl && (
                    <div style={{ position: 'relative', padding: 10, borderRadius: 16, border: '1.5px solid var(--stone)', background: 'var(--bg-main)' }}>
                      <button type="button" onClick={() => setEditingReport({ ...editingReport, audioUrl: null })} style={{ position: 'absolute', top: 8, right: 8, width: 28, height: 28, borderRadius: '50%', background: '#ef4444', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 900, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>✕</button>
                      <audio src={editingReport.audioUrl.startsWith('http') ? editingReport.audioUrl : (editingReport.audioUrl.startsWith('/') ? `http://localhost:5029${editingReport.audioUrl}` : `http://localhost:5029/${editingReport.audioUrl}`)} controls style={{ width: '100%' }} />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* New Media Previews */}
            {(newImagePreview || newAudioUrl) && (
              <div className="input-group" style={{ marginTop: 15 }}>
                <label style={{ fontWeight: 800, color: 'var(--blue)', fontSize: 14, marginBottom: 8, display: 'block' }}>{lang === 'ar' ? 'المرفقات الجديدة' : 'New Attachments'}</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {newImagePreview && (
                    <div style={{ position: 'relative', padding: 10, borderRadius: 16, border: '1.5px solid var(--blue)', background: 'rgba(0, 113, 227, 0.05)' }}>
                      <button type="button" onClick={() => { setNewImageFile(null); setNewImagePreview(null); }} style={{ position: 'absolute', top: 8, right: 8, width: 28, height: 28, borderRadius: '50%', background: '#ef4444', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 900, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>✕</button>
                      <img src={newImagePreview} alt="New" style={{ width: '100%', borderRadius: 10, maxHeight: 150, objectFit: 'cover' }} />
                    </div>
                  )}
                  {newAudioUrl && (
                    <div style={{ position: 'relative', padding: 10, borderRadius: 16, border: '1.5px solid var(--blue)', background: 'rgba(0, 113, 227, 0.05)' }}>
                      <button type="button" onClick={() => { setNewAudioBlob(null); setNewAudioUrl(null); }} style={{ position: 'absolute', top: 8, right: 8, width: 28, height: 28, borderRadius: '50%', background: '#ef4444', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 900, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>✕</button>
                      <audio src={newAudioUrl} controls style={{ width: '100%' }} />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Modern Media Buttons Bar */}
            <div className="media-whatsapp-bar">
              <button type="button" disabled={analyzing} className="tool-icon-btn" onClick={() => uploadRef.current.click()} title={lang === 'ar' ? 'رفع صورة' : 'Upload'}>
                <CameraIco />
                <input type="file" ref={uploadRef} accept="image/*" style={{ display: 'none' }} onChange={handleImage} />
              </button>

              <button type="button" disabled={analyzing} className={`tool-icon-btn ${recording ? 'recording' : ''}`} onClick={toggleRecording} title={recording ? (lang === 'ar' ? '⏹️ إيقاف' : 'Stop') : (lang === 'ar' ? 'تسجيل صوت' : 'Record')}>
                <MicIco />
              </button>

              <button type="button" disabled={analyzing} className="tool-icon-btn" onClick={handleCurrentLocation} title={t.mapLabel}>
                <PinIco />
              </button>
            </div>

            <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--muted)', marginTop: 15, textAlign: 'center' }}>
              📍 {editAddr || editingReport.addressText}
            </p>

            <div className="input-group" style={{ marginTop: 10 }}>
              <div ref={mapRef} className="map-container" style={{ width: '100%', height: 220, borderRadius: 20, overflow: 'hidden', border: '1.5px solid var(--stone)' }}></div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 30 }}>
              <button className="btn-modern-main" style={{ width: '100%', padding: 15, borderRadius: 99, fontWeight: 800 }} onClick={handleUpdate}>{t.saveBtn}</button>
              <button onClick={() => setEditingReport(null)} style={{ width: '100%', padding: 15, borderRadius: 99, border: '1.5px solid var(--stone)', background: 'transparent', color: 'var(--muted)', fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit', transition: '0.3s' }} onMouseOver={e => e.target.style.background = 'var(--bg-main)'} onMouseOut={e => e.target.style.background = 'transparent'}>{t.cancelBtn}</button>
            </div>
          </div>
        </div>
      )}

      {reportToDelete && (
        <div className="modal-overlay" style={{ backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', zIndex: 1000 }}>
          <div className="modal-box" style={{ width: '100%', maxWidth: 400, borderRadius: 'var(--r-xl)', position: 'relative', border: 'none', borderTop: '6px solid #ef4444', padding: '30px', background: '#ffffff', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <div style={{ background: 'rgba(239, 68, 68, 0.1)', width: 60, height: 60, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px', color: '#ef4444' }}>
                <TrashIco />
              </div>
              <h3 style={{ fontSize: 20, fontWeight: 900, color: '#1f2937' }}>{lang === 'ar' ? 'تأكيد الحذف' : 'Confirm Delete'}</h3>
              <p style={{ color: '#6b7280', marginTop: 10, fontSize: 14, fontWeight: 700 }}>
                {t.confirmDelete}
              </p>
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 30 }}>
              <button 
                onClick={executeDelete}
                style={{ flex: 1, padding: 12, borderRadius: 99, background: '#ef4444', color: 'white', fontWeight: 800, border: 'none', cursor: 'pointer', fontFamily: 'inherit', transition: '0.2s', transform: 'scale(1)' }}
                onMouseOver={e => e.target.style.transform = 'scale(1.02)'}
                onMouseOut={e => e.target.style.transform = 'scale(1)'}>
                {lang === 'ar' ? 'نعم، احذف البلاغ' : 'Yes, Delete'}
              </button>
              <button 
                onClick={() => setReportToDelete(null)} 
                style={{ flex: 1, padding: 12, borderRadius: 99, border: '1.5px solid #e5e7eb', background: 'transparent', color: '#6b7280', fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit', transition: '0.3s' }}
                onMouseOver={e => e.target.style.background = '#f9fafb'}
                onMouseOut={e => e.target.style.background = 'transparent'}>
                {t.cancelBtn}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyReports;