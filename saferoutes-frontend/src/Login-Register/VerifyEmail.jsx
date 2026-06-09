import { useState, useEffect } from "react";
import { verifyEmail, resendVerification } from "../api/authApi";
import logo from "./logo.png";
import "../Home Page/style.css";
import "./login.css";
import toast, { Toaster } from "react-hot-toast";

function VerifyEmail() {
  const [status, setStatus] = useState("loading"); // loading | success | error | expired
  const [resendEmail, setResendEmail] = useState("");
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSent, setResendSent] = useState(false);

  const lang = localStorage.getItem("lang") || "ar";
  const dark = localStorage.getItem("theme") === "dark";
  if (dark) document.body.classList.add("dark");
  else document.body.classList.remove("dark");
  document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";

  const ar = lang === "ar";

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    if (!token) { setStatus("error"); return; }

    verifyEmail(token)
      .then(() => setStatus("success"))
      .catch((err) => {
        const msg = err.response?.data;
        const errText = typeof msg === "string" ? msg : msg?.message || "";
        if (errText.includes("انتهت") || errText.toLowerCase().includes("expired")) {
          setStatus("expired");
        } else {
          setStatus("error");
        }
      });
  }, []);

  const handleResend = async (e) => {
    e.preventDefault();
    if (!resendEmail.trim()) return;
    try {
      setResendLoading(true);
      await resendVerification(resendEmail.trim().toLowerCase());
      setResendSent(true);
      toast.success(ar ? "تم الإرسال! تحقق من بريدك." : "Sent! Check your inbox.");
    } catch {
      toast.error(ar ? "حدث خطأ." : "Error occurred.");
    } finally {
      setResendLoading(false);
    }
  };

  const configs = {
    loading: {
      color: "#0071e3",
      icon: (
        <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
          <path d="M21 12a9 9 0 1 1-6.219-8.56" strokeLinecap="round">
            <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="1s" repeatCount="indefinite"/>
          </path>
        </svg>
      ),
      title: ar ? "جاري التحقق..." : "Verifying...",
      msg: ar ? "يرجى الانتظار بينما نتحقق من بريدك الإلكتروني." : "Please wait while we verify your email.",
    },
    success: {
      color: "#22c55e",
      icon: <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>,
      title: ar ? "تم التحقق بنجاح! ✅" : "Verified! ✅",
      msg: ar ? "بريدك الإلكتروني مؤكد الآن. يمكنك تسجيل الدخول والبدء باستخدام SafeRoute." : "Your email is now verified. You can log in and start using SafeRoute.",
    },
    expired: {
      color: "#f97316",
      icon: <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
      title: ar ? "انتهت صلاحية الرابط ⏰" : "Link Expired ⏰",
      msg: ar ? "انتهت صلاحية رابط التحقق. أدخل بريدك لنرسل لك رابطاً جديداً." : "The verification link has expired. Enter your email to get a new one.",
    },
    error: {
      color: "#ef4444",
      icon: <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>,
      title: ar ? "رابط غير صالح ❌" : "Invalid Link ❌",
      msg: ar ? "رابط التحقق غير صالح. أدخل بريدك لنرسل لك رابطاً جديداً." : "Invalid verification link. Enter your email to get a new one.",
    },
  };

  const cfg = configs[status];

  return (
    <div className="auth-container" dir={ar ? "rtl" : "ltr"}>
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
            <div className="auth-card" style={{ maxWidth: 460, textAlign: "center" }}>

              {/* Animated Icon */}
              <div style={{
                width: 80, height: 80, borderRadius: "50%",
                background: `linear-gradient(135deg, ${cfg.color}, ${cfg.color}cc)`,
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                boxShadow: `0 12px 35px ${cfg.color}44`,
                marginBottom: 28, transition: "all 0.5s ease"
              }}>
                {cfg.icon}
              </div>

              <h2 style={{ fontSize: 22, fontWeight: 800, color: "var(--ink)", marginBottom: 14 }}>{cfg.title}</h2>
              <p style={{ color: "var(--muted)", lineHeight: 1.8, marginBottom: 30, fontSize: 15 }}>{cfg.msg}</p>

              {status === "success" && (
                <button className="btn-submit" onClick={() => (window.location.href = "/login")}>
                  {ar ? "تسجيل الدخول الآن" : "Log In Now"}
                </button>
              )}

              {(status === "expired" || status === "error") && !resendSent && (
                <form onSubmit={handleResend} className="auth-form" style={{ textAlign: ar ? "right" : "left" }}>
                  <div className="input-group">
                    <label>{ar ? "بريدك الإلكتروني" : "Your Email"}</label>
                    <input
                      type="email"
                      value={resendEmail}
                      onChange={(e) => setResendEmail(e.target.value)}
                      style={{ textAlign: ar ? "right" : "left" }}
                      placeholder={ar ? "أدخل بريدك الإلكتروني" : "Enter your email"}
                      required
                    />
                  </div>
                  <button type="submit" className="btn-submit" disabled={resendLoading}
                    style={{ background: cfg.color }}>
                    {resendLoading ? (ar ? "جاري الإرسال..." : "Sending...") : (ar ? "إرسال رابط جديد" : "Send New Link")}
                  </button>
                </form>
              )}

              {resendSent && (
                <div style={{ background: "var(--sky)", border: "1px solid var(--stone)", borderRadius: 14, padding: "18px 20px", marginTop: 10 }}>
                  <p style={{ color: "var(--blue)", fontWeight: 700, margin: 0 }}>
                    📧 {ar ? "تم الإرسال! تحقق من صندوق الوارد." : "Sent! Check your inbox."}
                  </p>
                </div>
              )}

              <div style={{ marginTop: 24 }}>
                <button onClick={() => (window.location.href = "/login")} style={{
                  background: "none", border: "none", color: "var(--blue)", cursor: "pointer",
                  fontFamily: "Tajawal", fontWeight: 700, fontSize: 14
                }}>← {ar ? "العودة لتسجيل الدخول" : "Back to Login"}</button>
              </div>
            </div>
          </div>

          <footer className="login-modern-footer">
            <div className="footer-line">
              <span>© 2026 SafeRoute</span>
              <span className="dot-divider">•</span>
              <span>{ar ? "جامعة الزيتونة الأردنية" : "Al-Zaytoonah University"}</span>
            </div>
          </footer>
        </section>

        <section className="auth-left-panel">
          <div className="auth-left-content" style={{ textAlign: ar ? "right" : "left" }}>
            <h1 className="auth-title">{ar ? "بريدك يؤكد" : "Your email"}<br /><span>{ar ? "هويتك." : "confirms you."}</span></h1>
            <p className="auth-subtitle">{ar ? "التحقق من البريد الإلكتروني يحمي حسابك ويضمن أمانك على المنصة." : "Email verification protects your account and keeps you safe on the platform."}</p>
          </div>
        </section>
      </main>
    </div>
  );
}

export default VerifyEmail;
