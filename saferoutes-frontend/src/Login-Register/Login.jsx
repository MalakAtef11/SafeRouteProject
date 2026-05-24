import { useEffect, useRef, useState } from "react";
import {
  facebookLoginUser,
  googleLoginUser,
  loginUser,
  registerUser,
} from "../api/authApi";
import logo from "./logo.png";
import "../Home Page/style.css";
import "./login.css";
import toast, { Toaster } from "react-hot-toast";
import API from "../api/api.js";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const GOOGLE_CLIENT_ID = "219879263868-e9l7p62afrisa4lh264dr21c97fqt59c.apps.googleusercontent.com";
const FACEBOOK_APP_ID = "2011409296138484";

const translations = {
  ar: {
    home: "الرئيسية",
    reports: "البلاغات",
    reportNow: "أبلغ الآن",
    login: "تسجيل الدخول",
    register: "حساب جديد",
    email: "البريد الإلكتروني",
    password: "كلمة المرور",
    fullName: "الاسم الكامل",
    birthDate: "تاريخ الميلاد",
    day: "يوم",
    month: "شهر",
    year: "سنة",
    gender: "الجنس",
    male: "ذكر",
    female: "أنثى",
    select: "اختر...",
    confirmPassword: "تأكيد كلمة المرور",
    show: "عرض",
    hide: "إخفاء",
    submitLogin: "تسجيل الدخول",
    loadingLogin: "جاري التحقق...",
    submitRegister: "إنشاء حساب جديد",
    loadingRegister: "جاري الإنشاء...",
    loginWithFacebook: "الدخول باستخدام فيسبوك",
    orEmail: "أو باستخدام البريد الإلكتروني المحرك محلياً",
    title: "طريقك الآمن يبدأ",
    titleSpan: "هنا.",
    subtitle: "سجّل دخولك وكن جزءاً من منظومة ذكية تحوّل المدن إلى بيئة أكثر أماناً وكفاءة.",
    feature1Title: "أبلغ بسهولة",
    feature1Desc: "نص، صورة، أو صوت",
    feature2Title: "توجيه فوري بالذكاء",
    feature2Desc: "تحليل تلقائي في ثوانٍ",
    footerUni: "جامعة الزيتونة الأردنية | Developed by Malak Atef",
    footerCopy: "© 2026 SafeRoute",
    settings: "الإعدادات"
  },
  en: {
    home: "Home",
    reports: "Reports",
    reportNow: "Report Now",
    login: "Login",
    register: "Register",
    email: "Email Address",
    password: "Password",
    fullName: "Full Name",
    birthDate: "Date of Birth",
    day: "Day",
    month: "Month",
    year: "Year",
    gender: "Gender",
    male: "Male",
    female: "Female",
    select: "Select...",
    confirmPassword: "Confirm Password",
    show: "Show",
    hide: "Hide",
    submitLogin: "Login",
    loadingLogin: "Verifying...",
    submitRegister: "Create Account",
    loadingRegister: "Creating...",
    loginWithFacebook: "Sign in with Facebook",
    orEmail: "Or use your local email",
    title: "Your Safe Route Starts",
    titleSpan: "Here.",
    subtitle: "Log in and be part of a smart system that makes cities safer and more efficient.",
    feature1Title: "Report Easily",
    feature1Desc: "Text, Image, or Audio",
    feature2Title: "AI Dispatch",
    feature2Desc: "Auto-analysis in seconds",
    footerUni: "Al-Zaytoonah University | Developed by Malak Atef",
    footerCopy: "© 2026 SafeRoute",
    settings: "Settings"
  }
};

const EyeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
);
const EyeOffIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
);

function Login() {
  const [activeTab, setActiveTab] = useState("login");
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [birthDate, setBirthDate] = useState(null);
  const [gender, setGender] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [email, setEmail] = useState("");
  const googleButtonRef = useRef(null);
  const [dark, setDark] = useState(localStorage.getItem('theme') === 'dark');
  const [lang, setLang] = useState(localStorage.getItem('lang') || 'ar');

  const t = translations[lang];

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (dark) document.body.classList.add("dark");
    else document.body.classList.remove("dark");
    localStorage.setItem('theme', dark ? 'dark' : 'light');
    localStorage.setItem('lang', lang);
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  }, [dark, lang]);

  const saveUserSession = (data) => {
    localStorage.setItem("userId", data.userId);
    localStorage.setItem("userType", data.userType);
    if (data.sectorId) localStorage.setItem("sectorId", data.sectorId);
    if (data.sectorName) localStorage.setItem("sectorName", data.sectorName);
  };

  const redirectAfterLogin = (data) => {
    if (data.userType === "Sector") {
      window.location.href = "/sector-dashboard";
    } else {
      window.location.href = "/";
    }
  };

  // ================= GOOGLE LOGIC =================
  useEffect(() => {
    const loadGoogleScript = () => {
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = initializeGoogleButton;
      document.body.appendChild(script);
    };

    const initializeGoogleButton = () => {
      if (!window.google || !googleButtonRef.current) return;
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleCredentialResponse,
      });
      window.google.accounts.id.renderButton(googleButtonRef.current, {
        theme: "outline", size: "large", text: "signin_with", shape: "pill", width: 340
      });
    };
    loadGoogleScript();
  }, []);

  const handleGoogleCredentialResponse = async (response) => {
    try {
      setLoading(true);
      const data = await googleLoginUser(response.credential);
      saveUserSession(data);
      toast.success("تم تسجيل الدخول بنجاح عبر Google!");
      redirectAfterLogin(data);
    } catch (error) {
      toast.error("فشل تسجيل الدخول عبر Google");
    } finally {
      setLoading(false);
    }
  };

  // ================= FACEBOOK LOGIC =================
  useEffect(() => {
    window.fbAsyncInit = function () {
      window.FB.init({
        appId: FACEBOOK_APP_ID,
        cookie: true,
        xfbml: true,
        version: 'v20.0'
      });
    };

    (function (d, s, id) {
      var js, fjs = d.getElementsByTagName(s)[0];
      if (d.getElementById(id)) return;
      js = d.createElement(s); js.id = id;
      js.src = "https://connect.facebook.net/en_US/sdk.js";
      fjs.parentNode.insertBefore(js, fjs);
    }(document, 'script', 'facebook-jssdk'));
  }, []);

  const handleFacebookLogin = (e) => {
    e.preventDefault();
    if (!window.FB) {
      toast.error("جاري تحميل ميزة فيسبوك...");
      return;
    }
    window.FB.login((response) => {
      if (response.authResponse) {
        processFacebookLogin(response.authResponse.accessToken);
      } else {
        toast.error("تم إلغاء الدخول عبر فيسبوك");
      }
    }, { scope: 'public_profile,email' });
  };

  const processFacebookLogin = async (token) => {
    try {
      setLoading(true);
      const data = await facebookLoginUser(token);
      saveUserSession(data);
      toast.success("تم تسجيل الدخول بنجاح!");
      redirectAfterLogin(data);
    } catch (error) {
      toast.error("خطأ في الاتصال المحلي عبر فيسبوك");
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const data = await loginUser(
        loginEmail.trim().toLowerCase(),
        loginPassword
      );

      saveUserSession(data);

      // 🔥 جلب البيانات الكاملة من السيرفر المحلي (Localhost)
      // لأن الميثود موجودة داخل AuthController
      const res = await fetch(`${API}/Auth/${data.userId}`);
      const userData = await res.json();

      localStorage.setItem("email", userData.email);
      localStorage.setItem("fullName", userData.fullName);

      toast.success(`أهلاً بك مجدداً ${userData.fullName}!`);
      redirectAfterLogin(data);
    } catch (error) {
      toast.error("خطأ في البريد الإلكتروني أو كلمة المرور");
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (registerPassword !== confirmPassword) {
      toast.error("كلمتا المرور غير متطابقتين");
      return;
    }
    try {
      setLoading(true);
      
      const formattedDate = birthDate ? birthDate.toISOString().split('T')[0] : "";
      
      await registerUser({
        fullName, email: registerEmail.trim().toLowerCase(),
        birthDate: formattedDate, gender, password: registerPassword,
      });
      toast.success("تم إنشاء الحساب بنجاح! يمكنك الدخول الآن.");
      setActiveTab("login");
    } catch (error) {
      toast.error(error.response?.data || "حدث خطأ أثناء الإنشاء");
    } finally {
      setLoading(false);
    }
  };

  const goTo = (path) => { window.location.href = path; };

  return (
    <div className="auth-container" dir={lang === "ar" ? "rtl" : "ltr"}>
      <Toaster position="top-center" reverseOrder={false} toastOptions={{ style: { fontFamily: 'Tajawal', fontWeight: 'bold' } }} />

      <header className={`sr-header${scrolled ? " scrolled" : ""}`}>
        <a className="sr-logo" onClick={() => goTo("/")} style={{ cursor: 'pointer' }}>
          <img src={logo} alt="SafeRoute Logo" className="sr-logo-img" />
          <span className="sr-logo-text">Safe<span>Route</span></span>
        </a>

        {/* Desktop Nav */}
        <nav className="sr-nav">
          <a href="/" onClick={(e) => { e.preventDefault(); goTo("/"); }}>{t.home}</a>
          <a href="/reports" onClick={(e) => { e.preventDefault(); goTo("/login"); }}>{t.reports}</a>
          <a href="/report" onClick={(e) => { e.preventDefault(); goTo("/login"); }}>{t.reportNow}</a>
        </nav>

        {/* Desktop Right */}
        <div className="sr-header-right">
          <button onClick={() => setDark(!dark)} className="theme-btn">
            <span className="dot"></span>
          </button>

          <button onClick={() => setLang(lang === "ar" ? "en" : "ar")} className="lang-btn">
            {lang === "ar" ? "EN" : "AR"}
          </button>

          <button className="sr-hamburger-btn" onClick={() => setMenuOpen(!menuOpen)}>
            <div className={`sr-ham-line ${menuOpen ? "open" : ""}`} />
            <div className={`sr-ham-line ${menuOpen ? "open" : ""}`} />
            <div className={`sr-ham-line ${menuOpen ? "open" : ""}`} />
          </button>
        </div>
      </header>

      {/* ── MOBILE NAV ── */}
      <nav className={`sr-mobile-nav${menuOpen ? " open" : ""}`}>
        <a href="/" className="active" onClick={(e) => { e.preventDefault(); setMenuOpen(false); goTo("/"); }}>{t.home}</a>
        <a href="/reports" onClick={(e) => { e.preventDefault(); setMenuOpen(false); goTo("/login"); }}>{t.reports}</a>
        <a href="/report" onClick={(e) => { e.preventDefault(); setMenuOpen(false); goTo("/login"); }}>{t.reportNow}</a>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', justifyContent: 'space-between', padding: '10px 10px 0 10px', borderTop: '1px solid var(--stone)', marginTop: '10px' }}>
          <span style={{ fontWeight: 'bold', fontSize: '15px', color: 'var(--ink)' }}>{t.settings}</span>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => setDark(!dark)} className="theme-btn" />
            <button onClick={() => setLang(lang === "ar" ? "en" : "ar")} className="lang-btn">
              {lang === "ar" ? "EN" : "AR"}
            </button>
          </div>
        </div>
      </nav>

      <main className="auth-main">
        <section className="auth-right-panel">
          <div className="auth-card-wrapper">
            <div className="auth-card">
              <div className="tabs-container">
                <button className={`tab-btn ${activeTab === "login" ? "active" : ""}`} onClick={() => setActiveTab("login")}>{t.login}</button>
                <button className={`tab-btn ${activeTab === "register" ? "active" : ""}`} onClick={() => setActiveTab("register")}>{t.register}</button>
              </div>

              <div className="social-login-group">
                <div ref={googleButtonRef} className="google-btn-wrapper" style={{ direction: "ltr" }}></div>
                <button onClick={handleFacebookLogin} className="btn-social btn-facebook">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M14 13.5h2.5l1-4H14v-2c0-1.03 0-2 2-2h1.5V2.14c-.326-.043-1.557-.14-2.857-.14C11.928 2 10 3.657 10 6.7v2.8H7v4h3V22h4v-8.5z" /></svg>
                  {t.loginWithFacebook}
                </button>
              </div>

              <div className="divider"><span>{t.orEmail}</span></div>

              {activeTab === "login" ? (
                <form className="auth-form" onSubmit={handleLoginSubmit}>
                  <div className="input-group">
                    <label>{t.email}</label>
                    <input type="email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} style={{ textAlign: lang === 'ar' ? 'right' : 'left' }} required />
                  </div>
                  <div className="input-group">
                    <label>{t.password}</label>
                    <div style={{position: 'relative', display: 'flex', alignItems: 'center'}}>
                       <input type={showLoginPassword ? "text" : "password"} value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} style={{ textAlign: lang === 'ar' ? 'right' : 'left', width: '100%', paddingLeft: lang === 'ar' ? '45px' : undefined, paddingRight: lang === 'ar' ? undefined : '45px' }} required />
                       <span onClick={() => setShowLoginPassword(!showLoginPassword)} style={{position: 'absolute', [lang === 'ar' ? 'left' : 'right']: '15px', cursor: 'pointer', color: 'var(--muted)', display: 'flex', alignItems: 'center'}}>
                         {showLoginPassword ? <EyeOffIcon /> : <EyeIcon />}
                       </span>
                    </div>
                  </div>
                  <button type="submit" className="btn-submit" disabled={loading}>{loading ? t.loadingLogin : t.submitLogin}</button>
                </form>
              ) : (
                <form className="auth-form" onSubmit={handleRegisterSubmit}>
                  <div className="input-group">
                    <label>{t.fullName}</label>
                    <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} style={{ textAlign: lang === 'ar' ? 'right' : 'left' }} required />
                  </div>
                  <div className="input-group">
                    <label>{t.email}</label>
                    <input type="email" value={registerEmail} onChange={(e) => setRegisterEmail(e.target.value)} style={{ textAlign: lang === 'ar' ? 'right' : 'left' }} required />
                  </div>
                  <div className="form-row">
                    <div className="input-group custom-datepicker-wrapper">
                      <label>{t.birthDate}</label>
                      <DatePicker
                        selected={birthDate}
                        onChange={(date) => setBirthDate(date)}
                        dateFormat="yyyy-MM-dd"
                        className="custom-datepicker"
                        placeholderText={t.birthDate}
                        showYearDropdown
                        showMonthDropdown
                        dropdownMode="select"
                        maxDate={new Date()}
                        required
                      />
                    </div>
                    <div className="input-group">
                      <label>{t.gender}</label>
                      <select value={gender} onChange={(e) => setGender(e.target.value)} required>
                        <option value="">{t.select}</option>
                        <option value="Male">{t.male}</option>
                        <option value="Female">{t.female}</option>
                      </select>
                    </div>
                  </div>
                  <div className="input-group">
                    <label>{t.password}</label>
                    <div style={{position: 'relative', display: 'flex', alignItems: 'center'}}>
                       <input type={showRegisterPassword ? "text" : "password"} value={registerPassword} onChange={(e) => setRegisterPassword(e.target.value)} style={{ textAlign: lang === 'ar' ? 'right' : 'left', width: '100%', paddingLeft: lang === 'ar' ? '45px' : undefined, paddingRight: lang === 'ar' ? undefined : '45px' }} required />
                       <span onClick={() => setShowRegisterPassword(!showRegisterPassword)} style={{position: 'absolute', [lang === 'ar' ? 'left' : 'right']: '15px', cursor: 'pointer', color: 'var(--muted)', display: 'flex', alignItems: 'center'}}>
                         {showRegisterPassword ? <EyeOffIcon /> : <EyeIcon />}
                       </span>
                    </div>
                  </div>
                  <div className="input-group">
                    <label>{t.confirmPassword}</label>
                    <div style={{position: 'relative', display: 'flex', alignItems: 'center'}}>
                       <input type={showConfirmPassword ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} style={{ textAlign: lang === 'ar' ? 'right' : 'left', width: '100%', paddingLeft: lang === 'ar' ? '45px' : undefined, paddingRight: lang === 'ar' ? undefined : '45px' }} required />
                       <span onClick={() => setShowConfirmPassword(!showConfirmPassword)} style={{position: 'absolute', [lang === 'ar' ? 'left' : 'right']: '15px', cursor: 'pointer', color: 'var(--muted)', display: 'flex', alignItems: 'center'}}>
                         {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
                       </span>
                    </div>
                  </div>
                  <button type="submit" className="btn-submit" disabled={loading}>{loading ? t.loadingRegister : t.submitRegister}</button>
                </form>
              )}
            </div>
          </div>

          <footer className="login-modern-footer">
            <div className="footer-line">
              <span>{t.footerCopy}</span>
              <span className="dot-divider">•</span>
              <span>{t.footerUni}</span>
            </div>
          </footer>
        </section>

        <section className="auth-left-panel">
          <div className="auth-left-content" style={{ textAlign: lang === 'ar' ? 'right' : 'left' }}>
            <h1 className="auth-title">{t.title}<br /><span>{t.titleSpan}</span></h1>
            <p className="auth-subtitle">{t.subtitle}</p>
            <div className="feature-list">
              <div className="feature-item">
                <div className="feature-icon">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                </div>
                <div className="feature-text"><h4>{t.feature1Title}</h4><p>{t.feature1Desc}</p></div>
              </div>
              <div className="feature-item">
                <div className="feature-icon">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
                </div>
                <div className="feature-text"><h4>{t.feature2Title}</h4><p>{t.feature2Desc}</p></div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Login;