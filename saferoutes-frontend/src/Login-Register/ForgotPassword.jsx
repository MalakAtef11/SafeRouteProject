import { useState } from "react";
import { forgotPassword } from "../api/authApi";
import logo from "./logo.png";
import "../Home Page/style.css";
import "./login.css";
import toast, { Toaster } from "react-hot-toast";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const lang = localStorage.getItem("lang") || "ar";
  const dark = localStorage.getItem("theme") === "dark";

  if (dark) document.body.classList.add("dark");
  else document.body.classList.remove("dark");
  document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";

  const t = {
    ar: {
      title: "نسيت كلمة المرور؟",
      subtitle: "أدخل بريدك الإلكتروني وسنرسل لك رابط إعادة التعيين.",
      emailLabel: "البريد الإلكتروني",
      submit: "إرسال رابط الاسترداد",
      loading: "جاري الإرسال...",
      backLogin: "العودة لتسجيل الدخول",
      sentTitle: "تحقق من بريدك! 📧",
      sentMsg: "إذا كان البريد مسجلاً، ستصل رسالة تحتوي على رابط إعادة تعيين كلمة المرور خلال دقائق.",
      sentNote: "تحقق من مجلد Spam إذا لم تجد الرسالة.",
      resend: "لم تصل الرسالة؟ إعادة الإرسال",
    },
    en: {
      title: "Forgot your password?",
      subtitle: "Enter your email and we'll send you a reset link.",
      emailLabel: "Email Address",
      submit: "Send Reset Link",
      loading: "Sending...",
      backLogin: "Back to Login",
      sentTitle: "Check your inbox! 📧",
      sentMsg: "If your email is registered, you'll receive a reset link in a few minutes.",
      sentNote: "Check your Spam folder if you don't see it.",
      resend: "Didn't get it? Resend",
    },
  }[lang];

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await forgotPassword(email.trim().toLowerCase());
      setSent(true);
    } catch {
      toast.error(lang === "ar" ? "حدث خطأ. حاول مجدداً." : "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      setLoading(true);
      await forgotPassword(email.trim().toLowerCase());
      toast.success(lang === "ar" ? "تم إعادة الإرسال!" : "Resent!");
    } catch {
      toast.error(lang === "ar" ? "حدث خطأ." : "Error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container" dir={lang === "ar" ? "rtl" : "ltr"}>
      <Toaster position="top-center" toastOptions={{ style: { fontFamily: "Tajawal", fontWeight: "bold" } }} />

      <header className="sr-header">
        <a className="sr-logo" onClick={() => (window.location.href = "/")} style={{ cursor: "pointer" }}>
          <img src={logo} alt="SafeRoute Logo" className="sr-logo-img" />
          <span className="sr-logo-text">Safe<span>Route</span></span>
        </a>
      </header>

      <main className="auth-main">
        <section className="auth-right-panel">
          <div className="auth-card-wrapper">
            <div className="auth-card" style={{ maxWidth: 460 }}>

              {/* ── Icon ── */}
              <div style={{ textAlign: "center", marginBottom: 28 }}>
                <div style={{
                  width: 72, height: 72, borderRadius: "50%",
                  background: sent ? "linear-gradient(135deg,#22c55e,#16a34a)" : "linear-gradient(135deg,#0071e3,#005bb5)",
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                  boxShadow: sent ? "0 10px 30px rgba(34,197,94,0.3)" : "0 10px 30px rgba(0,113,227,0.3)",
                  transition: "all 0.4s ease"
                }}>
                  {sent ? (
                    <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                  ) : (
                    <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                  )}
                </div>
              </div>

              {sent ? (
                /* ── Sent State ── */
                <div style={{ textAlign: "center" }}>
                  <h2 style={{ fontSize: 22, fontWeight: 800, color: "var(--ink)", marginBottom: 14 }}>{t.sentTitle}</h2>
                  <p style={{ color: "var(--muted)", lineHeight: 1.8, marginBottom: 10, fontSize: 15 }}>{t.sentMsg}</p>
                  <p style={{
                    background: "var(--sky)", border: "1px solid var(--stone)", borderRadius: 12,
                    padding: "12px 18px", color: "var(--muted)", fontSize: 13, marginBottom: 30
                  }}>💡 {t.sentNote}</p>

                  <button onClick={handleResend} disabled={loading} style={{
                    background: "none", border: "none", color: "var(--blue)", cursor: "pointer",
                    fontFamily: "Tajawal", fontWeight: 700, fontSize: 15, marginBottom: 16, display: "block", margin: "0 auto 16px"
                  }}>{t.resend}</button>

                  <button className="btn-submit" onClick={() => (window.location.href = "/login")}
                    style={{ background: "var(--blue)" }}>
                    {t.backLogin}
                  </button>
                </div>
              ) : (
                /* ── Form State ── */
                <>
                  <h2 style={{ fontSize: 22, fontWeight: 800, color: "var(--ink)", marginBottom: 10, textAlign: "center" }}>{t.title}</h2>
                  <p style={{ color: "var(--muted)", fontSize: 15, lineHeight: 1.7, marginBottom: 30, textAlign: "center" }}>{t.subtitle}</p>

                  <form className="auth-form" onSubmit={handleSubmit}>
                    <div className="input-group">
                      <label>{t.emailLabel}</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        style={{ textAlign: lang === "ar" ? "right" : "left" }}
                        required
                      />
                    </div>

                    <button type="submit" className="btn-submit" disabled={loading}>
                      {loading ? t.loading : t.submit}
                    </button>
                  </form>

                  <div style={{ textAlign: "center", marginTop: 24 }}>
                    <button onClick={() => (window.location.href = "/login")} style={{
                      background: "none", border: "none", color: "var(--blue)", cursor: "pointer",
                      fontFamily: "Tajawal", fontWeight: 700, fontSize: 14
                    }}>
                      ← {t.backLogin}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          <footer className="login-modern-footer">
            <div className="footer-line">
              <span>© 2026 SafeRoute</span>
              <span className="dot-divider">•</span>
              <span>{lang === "ar" ? "جامعة الزيتونة الأردنية" : "Al-Zaytoonah University"}</span>
            </div>
          </footer>
        </section>

        <section className="auth-left-panel">
          <div className="auth-left-content" style={{ textAlign: lang === "ar" ? "right" : "left" }}>
            <h1 className="auth-title">
              {lang === "ar" ? "لا تقلق،" : "Don't worry,"}<br />
              <span>{lang === "ar" ? "سنساعدك." : "We've got you."}</span>
            </h1>
            <p className="auth-subtitle">
              {lang === "ar"
                ? "أمان حسابك هو أولويتنا. سنرسل لك رابطاً لإعادة تعيين كلمة مرورك بسهولة."
                : "Your account security is our priority. We'll send you a link to reset your password easily."}
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}

export default ForgotPassword;
