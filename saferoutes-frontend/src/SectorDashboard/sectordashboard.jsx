import { useEffect, useMemo, useState } from "react";
import logo from "../Login-Register/logo.png";
import NotificationBell from "../components/NotificationBell";
import "../Home Page/style.css";
import "./sectordashboard.css";
import toast, { Toaster } from "react-hot-toast";
import API from "../api/api.js"; 

// ── Icons ──
const PinIco = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>;
const UserIco = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const CalendarIco = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;

// ── Translations Object ──
const translations = {
  ar: {
    dashboard: "لوحة التحكم",
    analytics: "الإحصائيات",
    logout: "خروج",
    logoutFull: "تسجيل الخروج",
    heroTitle: "إدارة عمليات",
    heroSub: "لوحة تحكم محلية لإدارة البلاغات الواردة لقطاعكم.",
    totalOps: "إجمالي العمليات",
    newReports: "بلاغات جديدة",
    underProcessing: "تحت المعالجة",
    completed: "تم الإنجاز",
    rejected: "مرفوضة",
    filterAll: "كافة البلاغات",
    filterNew: "جديدة",
    filterWork: "قيد العمل",
    filterSolved: "تم الحل",
    filterRejected: "مرفوضة",
    showCharts: "عرض التحليل البياني",
    loading: "جاري مزامنة بيانات البلاغات المحلية...",
    noReports: "لا يوجد بلاغات في هذا التصنيف حالياً.",
    details: "التفاصيل",
    receive: "استلام",
    reject: "رفض",
    process: "توجيه للمعالجة",
    close: "إغلاق وحل",
    citizen: "المواطن",
    city: "المدينة",
    date: "التاريخ",
    amman: "عمان",
    anonymous: "مجهول",
    university: "مشروع تخرج — جامعة الزيتونة الأردنية",
    statusMap: {
      "Review": "تم استلام البلاغ مراجعة",
      "Rejected": "تم رفض البلاغ",
      "Processing": "بدء العمل الميداني",
      "Resolved": "تم حل المشكلة نهائياً"
    }
  },
  en: {
    dashboard: "Dashboard",
    analytics: "Analytics",
    logout: "Logout",
    logoutFull: "Logout",
    heroTitle: "Operations Management -",
    heroSub: "Local dashboard for managing incoming sector reports.",
    totalOps: "Total Operations",
    newReports: "New Reports",
    underProcessing: "Processing",
    completed: "Completed",
    rejected: "Rejected",
    filterAll: "All Reports",
    filterNew: "New",
    filterWork: "In Progress",
    filterSolved: "Solved",
    filterRejected: "Rejected",
    showCharts: "Show Analytics",
    loading: "Syncing local report data...",
    noReports: "No reports found in this category.",
    details: "Details",
    receive: "Receive",
    reject: "Reject",
    process: "Dispatch",
    close: "Close & Solve",
    citizen: "Citizen",
    city: "City",
    date: "Date",
    amman: "Amman",
    anonymous: "Anonymous",
    university: "Graduation Project — ZUJ",
    statusMap: {
      "Review": "Report received for review",
      "Rejected": "Report has been rejected",
      "Processing": "Field work started",
      "Resolved": "Issue resolved permanently"
    }
  }
};

function SectorDashboard() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState([]);
  const [summary, setSummary] = useState({ totalReports: 0, newReports: 0, processingReports: 0, resolvedReports: 0, rejectedReports: 0 });
  const [dark, setDark] = useState(localStorage.getItem('theme') === 'dark');
  const [lang, setLang] = useState(localStorage.getItem('lang') || 'ar');

  // Reassign functionality state
  const [sectorsList, setSectorsList] = useState([]);
  const [reassignData, setReassignData] = useState({ open: false, reportId: null, selectedSectors: [], reason: "" });

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
    loadDashboardData();

    // Fetch sectors for reassign dropdown
    fetch(`${API}/Sectors`)
      .then(res => res.json())
      .then(data => setSectorsList(data))
      .catch(err => console.error("Error fetching sectors", err));

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (dark) document.body.classList.add("dark");
    else document.body.classList.remove("dark");
    localStorage.setItem('theme', dark ? 'dark' : 'light');
    localStorage.setItem('lang', lang);
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  }, [dark, lang]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const reps = await fetch(`${API}/Reports/sector?sectorId=${sectorId}`).then(r => r.json());

      const processedReports = reps.map(r => ({
        ...r,
        statusKey: (
          ["جديد", "New"].includes(r.statusName) ? "new" :
          ["قيد المعالجة", "Processing"].includes(r.statusName) ? "processing" :
          ["تم الحل", "Resolved", "مكتمل", "Done"].includes(r.statusName) ? "resolved" :
          ["مرفوض", "مرفوضة", "Rejected"].includes(r.statusName) ? "rejected" :
          "all"
        )
      }));

      const summ = {
        totalReports: processedReports.length,
        newReports: processedReports.filter(r => r.statusKey === "new").length,
        processingReports: processedReports.filter(r => r.statusKey === "processing").length,
        resolvedReports: processedReports.filter(r => r.statusKey === "resolved").length,
        rejectedReports: processedReports.filter(r => r.statusKey === "rejected").length,
      };

      setSummary(summ);
      setReports(processedReports);
    } catch (e) { 
      console.error("Error fetching data:", e); 
    } finally { 
      setLoading(false); 
    }
  };

  const updateStatus = async (reportId, code, msgKey) => {
    const loader = toast.loading(lang === "ar" ? "جاري التحديث..." : "Updating...");
    try {
      const res = await fetch(`${API}/Reports/${reportId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ statusCode: code, changedByUserID: Number(userId), changeNote: t.statusMap[code] }),
      });

      if (res.ok) { 
        toast.dismiss(loader); 
        toast.success(t.statusMap[code]); 
        loadDashboardData(); 
      } else {
        throw new Error();
      }
    } catch { 
      toast.dismiss(loader); 
      toast.error(lang === "ar" ? "فشل التحديث" : "Update failed"); 
    }
  };

  const submitReassign = async () => {
    if (reassignData.selectedSectors.length === 0) {
      toast.error(lang === "ar" ? "الرجاء تحديد جهة واحدة على الأقل" : "Please select at least one sector");
      return;
    }
    const loader = toast.loading(lang === "ar" ? "جاري التحويل..." : "Reassigning...");
    try {
      const res = await fetch(`${API}/Reports/${reassignData.reportId}/reassign`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          newSectorIds: reassignData.selectedSectors,
          reason: reassignData.reason,
          userId: Number(userId)
        })
      });
      if (res.ok) {
        toast.dismiss(loader);
        toast.success(lang === "ar" ? "تم التحويل بنجاح" : "Reassigned successfully");
        setReassignData({ open: false, reportId: null, selectedSectors: [], reason: "" });
        loadDashboardData();
      } else {
        throw new Error();
      }
    } catch {
      toast.dismiss(loader);
      toast.error(lang === "ar" ? "فشل التحويل" : "Reassign failed");
    }
  };

  const filteredReports = useMemo(() => 
    activeFilter === "all" ? reports : reports.filter(r => r.statusKey === activeFilter), 
  [activeFilter, reports]);

  const goTo = (p) => { window.location.href = p; };
  const handleLogout = () => { localStorage.clear(); window.location.href = "/"; };

  return (
    <div className="sector-dashboard-container" dir={lang === "ar" ? "rtl" : "ltr"}>
      <Toaster position="top-center" />

      {/* ── HEADER ── */}
      <header className={`sr-header${scrolled ? " scrolled" : ""}`}>
        <a className="sr-logo" onClick={() => goTo("/")} style={{ cursor: "pointer" }}>
          <img src={logo} alt="SafeRoute" className="sr-logo-img" />
          <span className="sr-logo-text">Safe<span>Route</span></span>
        </a>

        {/* Desktop Nav */}
        <nav className="sr-nav">
          <a href="/sector-dashboard" className="active">{t.dashboard}</a>
          <a href="/sector-citizens" onClick={(e) => { e.preventDefault(); goTo("/sector-citizens"); }}>
            {lang === "ar" ? "دليل المواطنين" : "Citizens Directory"}
          </a>
          <a href="/analytics" onClick={(e) => { e.preventDefault(); goTo("/analytics"); }}>{t.analytics}</a>
          <a href="/chat" onClick={(e) => { e.preventDefault(); goTo("/chat"); }}>
            {lang === "ar" ? "الدردشات" : "Chats"}
          </a>
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
        <a href="/sector-dashboard" className="active" onClick={(e) => { e.preventDefault(); setMenuOpen(false); goTo("/sector-dashboard"); }}>{t.dashboard}</a>
        <a href="/sector-citizens" onClick={(e) => { e.preventDefault(); setMenuOpen(false); goTo("/sector-citizens"); }}>
          {lang === "ar" ? "دليل المواطنين" : "Citizens Directory"}
        </a>
        <a href="/analytics" onClick={(e) => { e.preventDefault(); setMenuOpen(false); goTo("/analytics"); }}>{t.analytics}</a>
        <a href="/chat" onClick={(e) => { e.preventDefault(); setMenuOpen(false); goTo("/chat"); }}>
          {lang === "ar" ? "الدردشات" : "Chats"}
        </a>
        
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
           {userId && <button className="sr-btn-logout" style={{width: '100%', padding: '15px'}} onClick={handleLogout}>{t.logoutFull}</button>}
        </div>
      </nav>

      <main className="sector-wrapper">
        <section className="hero-sector-info">
          <h1>{t.heroTitle} {sectorName}</h1>
          <p>{t.heroSub}</p>
        </section>

        {/* ── KPIs ── */}
        <section className="prism-stats-grid">
          <div className="prism-stat-box"><label>{t.totalOps}</label><strong>{summary.totalReports}</strong></div>
          <div className="prism-stat-box" style={{borderTop:'4px solid var(--blue)'}}><label>{t.newReports}</label><strong style={{color:'var(--blue)'}}>{summary.newReports}</strong></div>
          <div className="prism-stat-box" style={{borderTop:'4px solid #f59e0b'}}><label>{t.underProcessing}</label><strong style={{color:'#f59e0b'}}>{summary.processingReports}</strong></div>
          <div className="prism-stat-box" style={{borderTop:'4px solid #10b981'}}><label>{t.completed}</label><strong style={{color:'#10b981'}}>{summary.resolvedReports}</strong></div>
          <div className="prism-stat-box" style={{borderTop:'4px solid #ef4444'}}><label>{t.rejected}</label><strong style={{color:'#ef4444'}}>{summary.rejectedReports}</strong></div>
        </section>

        {/* ── FILTERS ── */}
        <section className="controls-prism-row">
          <div className="filter-prism-stack">
            {[
              {id: "all", label: t.filterAll},
              {id: "new", label: t.filterNew},
              {id: "processing", label: t.filterWork},
              {id: "resolved", label: t.filterSolved},
              {id: "rejected", label: t.filterRejected}
            ].map(f => (
              <button key={f.id} className={`prism-pill ${activeFilter === f.id ? "active" : ""}`} onClick={() => setActiveFilter(f.id)}>
                {f.label}
              </button>
            ))}
          </div>
          <button className="btn-main-chic" style={{width:'auto', padding:'12px 25px'}} onClick={() => goTo("/analytics")}>{t.showCharts}</button>
        </section>

        {/* ── TASK CARDS ── */}
        <section className="tasks-prism-grid">
          {loading ? (
              <p style={{textAlign:'center', width:'100%'}}>{t.loading}</p>
          ) : filteredReports.length === 0 ? (
              <p style={{textAlign:'center', width:'100%'}}>{t.noReports}</p>
          ) : filteredReports.map(r => (
            <div className="task-panel-card" key={r.reportId}>
              <div className="task-notch-id">ID #{r.reportId}</div>
              
              <div className="task-status-row">
                <div className={`status-indicator ${r.statusKey}`} />
                <span style={{fontSize:'12px', fontWeight:800, color:'var(--muted)'}}>{r.statusName}</span>
              </div>

              <h3 className="task-title">{r.title}</h3>

              <div className="task-meta-grid">
                <div className="meta-item"><label>{t.citizen}</label><span><UserIco/>{r.citizenName || t.anonymous}</span></div>
                <div className="meta-item"><label>{t.city}</label><span><PinIco/>{r.city || t.amman}</span></div>
                <div className="meta-item"><label>{t.date}</label><span><CalendarIco/>{new Date(r.submittedAt).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US')}</span></div>
              </div>

              <div className="task-actions-stack">
                <button className="btn-action-prism outline" onClick={() => { localStorage.setItem("selectedReportId", r.reportId); localStorage.setItem("reportDetailsFrom", "/sector-dashboard"); goTo("/report-details"); }}>{t.details}</button>
                <button className="btn-action-prism outline" style={{border: '1.5px solid #8b5cf6', color: '#8b5cf6'}} onClick={() => setReassignData({ open: true, reportId: r.reportId, selectedSectors: [], reason: "" })}>
                  {lang === "ar" ? "تحويل لجهة أخرى" : "Reassign"}
                </button>
                
                {r.citizenUserId && (
                  <button className="btn-action-prism" style={{ background: 'var(--blue, #0071e3)', color: 'white', border: 'none' }} onClick={() => {
                    localStorage.setItem("chatWithUserId", r.citizenUserId);
                    localStorage.setItem("chatWithUserName", r.citizenName || (lang === 'ar' ? "مواطن" : "Citizen"));
                    localStorage.setItem("chatReportId", r.reportId);
                    localStorage.setItem("chatReportTitle", r.title);
                    goTo("/chat");
                  }}>
                    {lang === "ar" ? "تواصل مع المرسل" : "Contact Reporter"}
                  </button>
                )}
                
                {r.statusKey === "new" && (
                  <>
                    <button className="btn-action-prism primary" onClick={() => updateStatus(r.reportId, "Review")}>{t.receive}</button>
                    <button className="btn-action-prism reject" onClick={() => updateStatus(r.reportId, "Rejected")}>{t.reject}</button>
                  </>
                )}
                
                {r.statusName === "قيد المراجعة" && (
                  <button className="btn-action-prism primary" onClick={() => updateStatus(r.reportId, "Processing")}>{t.process}</button>
                )}

                {r.statusKey === "processing" && (
                  <button className="btn-action-prism" style={{background:'#10b981', color:'white'}} onClick={() => updateStatus(r.reportId, "Resolved")}>{t.close}</button>
                )}
              </div>
            </div>
          ))}
        </section>
      </main>

      <footer className="sr-footer">
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'30px', width:'100%'}}>
          <a className="sr-logo" onClick={() => goTo("/")} style={{textDecoration:'none', cursor:'pointer'}}>
            <img src={logo} alt="SafeRoute" className="sr-logo-img" />
            <span className="sr-logo-text">Safe<span>Route</span></span>
          </a>
          <div style={{textAlign: lang === 'ar' ? 'left' : 'right'}}>
            <p style={{fontSize:'12px', color:'var(--muted)'}}>{t.university}</p>
            <p style={{fontSize:'12px', color:'var(--muted)', marginTop:'5px'}}>Developed by <strong>Malak Atef</strong></p>
          </div>
        </div>
      </footer>

      {/* ── REASSIGN MODAL ── */}
      {reassignData.open && (
        <div className="modal-overlay" style={{ backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', zIndex: 1000, position: 'fixed', top: 0, left: 0, width: '100%', height: '100%' }}>
          <div className="modal-box" style={{ width: '100%', maxWidth: 450, borderRadius: 'var(--r-xl)', position: 'relative', border: 'none', borderTop: '6px solid #8b5cf6', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', padding: '30px', background: '#ffffff' }}>
            
            <h3 style={{ fontSize: 20, fontWeight: 900, color: '#1f2937', marginBottom: 20, textAlign: 'center' }}>
              {lang === "ar" ? "تحويل البلاغ لجهات أخرى" : "Reassign Report"}
            </h3>

            <div style={{ marginBottom: 15 }}>
              <label style={{ display: 'block', fontWeight: 800, marginBottom: 12, color: '#374151' }}>
                {lang === "ar" ? "اختر الجهات الجديدة (يمكنك اختيار أكثر من جهة)" : "Select New Sectors"}
              </label>
              
              <div className="custom-scrollbar" style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '8px',
                maxHeight: '180px',
                overflowY: 'auto',
                padding: '12px',
                border: '1.5px solid #e5e7eb',
                borderRadius: '12px',
                background: '#f9fafb'
              }}>
                {sectorsList.map(s => {
                  const isSelected = reassignData.selectedSectors.includes(s.sectorID);
                  return (
                    <div 
                      key={s.sectorID}
                      onClick={() => {
                        setReassignData(prev => {
                          const currentlySelected = prev.selectedSectors;
                          if (currentlySelected.includes(s.sectorID)) {
                            return { ...prev, selectedSectors: currentlySelected.filter(id => id !== s.sectorID) };
                          } else {
                            return { ...prev, selectedSectors: [...currentlySelected, s.sectorID] };
                          }
                        });
                      }}
                      style={{
                        padding: '8px 16px',
                        borderRadius: '99px',
                        border: isSelected ? '1.5px solid #8b5cf6' : '1.5px solid #e5e7eb',
                        background: isSelected ? 'rgba(139, 92, 246, 0.1)' : '#ffffff',
                        color: isSelected ? '#8b5cf6' : '#4b5563',
                        fontSize: '13px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        userSelect: 'none',
                        boxShadow: isSelected ? 'none' : '0 1px 2px rgba(0,0,0,0.05)'
                      }}
                    >
                      {isSelected && <span style={{width: 6, height: 6, borderRadius: '50%', background: '#8b5cf6'}}></span>}
                      {s.sectorName}
                    </div>
                  );
                })}
              </div>
            </div>

            <div style={{ marginBottom: 25 }}>
              <label style={{ display: 'block', fontWeight: 800, marginBottom: 8, color: '#374151' }}>
                {lang === "ar" ? "سبب التحويل (اختياري)" : "Reason (Optional)"}
              </label>
              <textarea 
                value={reassignData.reason}
                onChange={e => setReassignData(prev => ({ ...prev, reason: e.target.value }))}
                placeholder={lang === "ar" ? "مثال: يتبع لبلدية أخرى..." : "E.g. belongs to another municipality..."}
                style={{ width: '100%', padding: 12, borderRadius: 12, border: '1.5px solid #e5e7eb', background: '#f9fafb', color: '#1f2937', minHeight: 80, outline: 'none' }}
              />
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button 
                onClick={submitReassign}
                style={{ flex: 1, padding: 12, borderRadius: 99, background: '#8b5cf6', color: 'white', fontWeight: 800, border: 'none', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(139, 92, 246, 0.3)' }}>
                {lang === "ar" ? "تأكيد التحويل" : "Confirm Reassign"}
              </button>
              <button 
                onClick={() => setReassignData({ open: false, reportId: null, selectedSectors: [], reason: "" })} 
                style={{ flex: 1, padding: 12, borderRadius: 99, border: '1.5px solid #e5e7eb', background: '#ffffff', color: '#6b7280', fontWeight: 800, cursor: 'pointer' }}>
                {lang === "ar" ? "إلغاء" : "Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SectorDashboard;