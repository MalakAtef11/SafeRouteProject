import { useMemo, useState, useEffect } from "react";
import logo from "../Login-Register/logo.png";
import NotificationBell from "../components/NotificationBell";
import "./editprofile.css";
import toast, { Toaster } from "react-hot-toast";
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
    editTitle: "تحديث البيانات الشخصية",
    editDesc: "يمكنك تعديل بيانات حسابك المسجل لضمان دقة التواصل والبلاغات.",
    fullName: "الاسم الكامل",
    email: "البريد الإلكتروني",
    birthDate: "تاريخ الميلاد",
    calculatedAge: "العمر المحتسب",
    waitingDate: "بانتظار التاريخ...",
    gender: "الجنس",
    selectOption: "اختيار...",
    male: "ذكر",
    female: "أنثى",
    saveChanges: "حفظ التغييرات",
    cancelBack: "إلغاء والعودة",
    saving: "جاري حفظ التعديلات محلياً...",
    successSave: "تم تحديث ملفك الشخصي بنجاح ✅",
    failSave: "فشل التحديث، تأكد من اتصالك بالسيرفر المحلي",
    yearsOld: "سنة",
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
    editTitle: "Update Personal Details",
    editDesc: "You can modify your registered account details to ensure accurate communication.",
    fullName: "Full Name",
    email: "Email Address",
    birthDate: "Date of Birth",
    calculatedAge: "Calculated Age",
    waitingDate: "Waiting for date...",
    gender: "Gender",
    selectOption: "Select...",
    male: "Male",
    female: "Female",
    saveChanges: "Save Changes",
    cancelBack: "Cancel & Return",
    saving: "Saving changes locally...",
    successSave: "Profile updated successfully ✅",
    failSave: "Update failed, check local server connection",
    yearsOld: "years",
    footerText: "Graduation Project — Al-Zaytoonah University",
    developer: "Developed by Malak Atef"
  }
};

const UserIco = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const MailIco = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>;
const BirthIco = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
const GenderIco = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2a5 5 0 1 0 5 5 5 5 0 0 0-5-5zM12 14v7M9 18h6"/></svg>;
const EditShapeIco = () => <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;

function EditProfile() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  
  const [dark, setDark] = useState(localStorage.getItem('theme') === 'dark');
  const [lang, setLang] = useState(localStorage.getItem('lang') || "ar");

  const userId = localStorage.getItem("userId");
  const userType = localStorage.getItem("userType");

  const t = translations[lang];

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    birthDate: "",
    gender: "",
  });

  const navLinks = userType === "Sector"
    ? [{ href: "/sector-dashboard", label: t.dashboard }, { href: "/analytics", label: t.analytics }]
    : [{ href: "/reports", label: t.reports }, { href: "/report", label: t.reportNow }, { href: "/my-reports", label: t.myReports }, { href: "/profile", label: t.profile }];

  useEffect(() => {
    if (dark) document.body.classList.add('dark');
    else document.body.classList.remove('dark');
    localStorage.setItem('theme', dark ? 'dark' : 'light');
    localStorage.setItem('lang', lang);
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  }, [dark, lang]);

  useEffect(() => {
    if (!userId) {
        window.location.href = "/login";
        return;
    }

    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);

    fetchUserData();

    return () => window.removeEventListener("scroll", onScroll);
  }, [userId]);

  const fetchUserData = async () => {
    try {
      const res = await fetch(`${API}/Users/${userId}`);
      if (res.ok) {
        const data = await res.json();
        setFormData({
          fullName: data.fullName || "",
          email: data.email || "",
          birthDate: data.birthDate ? data.birthDate.split("T")[0] : "",
          gender: data.gender || "",
        });
      }
    } catch (err) { console.error("Error fetching user data:", err); }
  };

  const age = useMemo(() => {
    if (!formData.birthDate) return "";
    const birthDateObj = new Date(formData.birthDate);
    const today = new Date();
    let years = today.getFullYear() - birthDateObj.getFullYear();
    const m = today.getMonth() - birthDateObj.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDateObj.getDate())) years--;
    return years > 0 ? `${years} ${t.yearsOld}` : "";
  }, [formData.birthDate, lang]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const loader = toast.loading(t.saving);
    try {
      const response = await fetch(`${API}/Auth/update/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.dismiss(loader);
        toast.success(t.successSave);
        localStorage.setItem("fullName", formData.fullName);
        localStorage.setItem("email", formData.email);
        setTimeout(() => window.location.href = "/profile", 1500);
      } else {
        throw new Error();
      }
    } catch (err) {
      toast.dismiss(loader);
      toast.error(t.failSave);
    }
  };

  const handleLogout = () => { localStorage.clear(); window.location.href = "/"; };
  const goTo = (p) => { window.location.href = p; };

  return (
    <div className="edit-profile-wrapper" dir={lang === "ar" ? "rtl" : "ltr"}>
      <Toaster position="top-center" />

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

      <main className="edit-bento-container">
        <div className="edit-intro-card">
          <div className="edit-icon-shape"><EditShapeIco /></div>
          <h2 className="edit-title">{t.editTitle}</h2>
          <p className="edit-desc">{t.editDesc}</p>
        </div>

        <form className="edit-fields-grid" onSubmit={handleSubmit}>
          
          <div className="glass-input-card full">
            <label><UserIco/> {t.fullName}</label>
            <input type="text" id="fullName" className="bento-input" value={formData.fullName} onChange={handleChange} required />
          </div>

          <div className="glass-input-card full">
            <label><MailIco/> {t.email}</label>
            <input type="email" id="email" className="bento-input" value={formData.email} onChange={handleChange} required dir="ltr" />
          </div>

          <div className="glass-input-card">
            <label><BirthIco/> {t.birthDate}</label>
            <input type="date" id="birthDate" className="bento-input" value={formData.birthDate} onChange={handleChange} required />
          </div>

          <div className="glass-input-card readonly-label">
            <label>{t.calculatedAge}</label>
            <input type="text" className="bento-input" value={age || t.waitingDate} readOnly />
          </div>

          <div className="glass-input-card full">
            <label><GenderIco/> {t.gender}</label>
            <select id="gender" className="bento-input" value={formData.gender} onChange={handleChange} required>
              <option value="">{t.selectOption}</option>
              <option value="Male">{t.male}</option>
              <option value="Female">{t.female}</option>
            </select>
          </div>

          <div className="edit-actions-bento">
            <button type="submit" className="btn-bento-save">{t.saveChanges}</button>
            <a href="/profile" className="btn-bento-cancel">{t.cancelBack}</a>
          </div>

        </form>
      </main>

      <footer className="sr-footer">
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'30px', width:'100%'}}>
          <a className="sr-logo" onClick={() => goTo("/")} style={{textDecoration:'none', cursor:'pointer'}}>
            <img src={logo} alt="SafeRoute" className="sr-logo-img" />
            <span className="sr-logo-text">Safe<span>Route</span></span>
          </a>
          <div style={{textAlign: lang === "ar" ? "right" : "left"}}>
            <p style={{fontSize:'12px', color:'var(--muted)'}}>{t.footerText}</p>
            <p style={{fontSize:'12px', color:'var(--muted)', marginTop:'5px'}}>{t.developer}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default EditProfile;