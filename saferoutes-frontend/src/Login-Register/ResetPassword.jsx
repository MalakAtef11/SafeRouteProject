import { useState, useEffect } from "react";
import { resetPassword } from "../api/authApi";
import logo from "./logo.png";
import "../Home Page/style.css";
import "./login.css";
import toast, { Toaster } from "react-hot-toast";

const EyeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
);
const EyeOffIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
);

function ResetPassword() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [token, setToken] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [strength, setStrength] = useState(0);

  const lang = localStorage.getItem("lang") || "ar";
  const dark = localStorage.getItem("theme") === "dark";
  if (dark) document.body.classList.add("dark");
  else document.body.classList.remove("dark");
  document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get("token");
    if (!t) {
      toast.error(lang === "ar" ? "رابط غير صالح" : "Invalid link");
      setTimeout(() => (window.location.href = "/login"), 2000);
    } else setToken(t);
  }, []);

  useEffect(() => {
    let s = 0;
    if (newPassword.length >= 8) s++;
    if (/[A-Z]/.test(newPassword)) s++;
    if (/[0-9]/.test(newPassword)) s++;
    if (/[^A-Za-z0-9]/.test(newPassword)) s++;
    setStrength(s);
  }, [newPassword]);

  const ar = lang === "ar";
  const strengthColors = ["#ef4444","#f97316","#eab308","#22c55e"];
  const strengthLabels = ar ? ["ضعيفة","مقبولة","جيدة","قوية"] : ["Weak","Fair","Good","Strong"];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword.length < 8) { toast.error(ar ? "كلمة المرور قصيرة (8 أحرف على الأقل)" : "Min 8 characters"); return; }
    if (newPassword !== confirmPassword) { toast.error(ar ? "كلمتا المرور غير متطابقتين" : "Passwords don't match"); return; }
    try {
      setLoading(true);
      await resetPassword(token, newPassword);
      setDone(true);
    } catch (error) {
      const msg = error.response?.data;
      toast.error(typeof msg === "string" ? msg : (msg?.message || (ar ? "الرابط منتهي أو غير صالح" : "Link expired or invalid")));
    } finally {
      setLoading(false);
    }
  };

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
            <div className="auth-card" style={{ maxWidth: 460 }}>
              <div style={{ textAlign: "center", marginBottom: 28 }}>
                <div style={{
                  width: 72, height: 72, borderRadius: "50%",
                  background: done ? "linear-gradient(135deg,#22c55e,#16a34a)" : "linear-gradient(135deg,#0071e3,#005bb5)",
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                  boxShadow: done ? "0 10px 30px rgba(34,197,94,0.3)" : "0 10px 30px rgba(0,113,227,0.3)",
                  transition: "all 0.4s"
                }}>
                  {done
                    ? <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                    : <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  }
                </div>
              </div>

              {done ? (
                <div style={{ textAlign: "center" }}>
                  <h2 style={{ fontSize: 24, fontWeight: 800, color: "var(--ink)", marginBottom: 14 }}>{ar ? "تم بنجاح! 🎉" : "Done! 🎉"}</h2>
                  <p style={{ color: "var(--muted)", lineHeight: 1.8, marginBottom: 30, fontSize: 15 }}>{ar ? "تم تغيير كلمة مرورك. يمكنك الدخول الآن." : "Password changed. You can log in now."}</p>
                  <button className="btn-submit" onClick={() => (window.location.href = "/login")}>{ar ? "الذهاب لتسجيل الدخول" : "Go to Login"}</button>
                </div>
              ) : (
                <>
                  <h2 style={{ fontSize: 22, fontWeight: 800, color: "var(--ink)", marginBottom: 10, textAlign: "center" }}>{ar ? "إنشاء كلمة مرور جديدة" : "Create new password"}</h2>
                  <p style={{ color: "var(--muted)", fontSize: 15, lineHeight: 1.7, marginBottom: 28, textAlign: "center" }}>{ar ? "أدخل كلمة مرور قوية لحماية حسابك." : "Enter a strong password to protect your account."}</p>
                  <form className="auth-form" onSubmit={handleSubmit}>
                    <div className="input-group">
                      <label>{ar ? "كلمة المرور الجديدة" : "New Password"}</label>
                      <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                        <input type={showPass ? "text" : "password"} value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                          style={{ textAlign: ar ? "right" : "left", width: "100%", paddingLeft: ar ? "45px" : undefined, paddingRight: ar ? undefined : "45px" }} required />
                        <span onClick={() => setShowPass(!showPass)} style={{ position: "absolute", [ar ? "left" : "right"]: "15px", cursor: "pointer", color: "var(--muted)", display: "flex", alignItems: "center" }}>
                          {showPass ? <EyeOffIcon /> : <EyeIcon />}
                        </span>
                      </div>
                      {newPassword && (
                        <div style={{ marginTop: 10 }}>
                          <div style={{ display: "flex", gap: 4, marginBottom: 5 }}>
                            {[0,1,2,3].map(i => (
                              <div key={i} style={{ flex: 1, height: 4, borderRadius: 4, background: i < strength ? strengthColors[strength-1] : "var(--stone)", transition: "background 0.3s" }} />
                            ))}
                          </div>
                          <span style={{ fontSize: 12, color: strengthColors[strength-1] || "var(--muted)", fontWeight: 700 }}>
                            {strength > 0 ? strengthLabels[strength-1] : ""}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="input-group">
                      <label>{ar ? "تأكيد كلمة المرور" : "Confirm Password"}</label>
                      <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                        <input type={showConfirm ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                          style={{ textAlign: ar ? "right" : "left", width: "100%", paddingLeft: ar ? "45px" : undefined, paddingRight: ar ? undefined : "45px", borderColor: confirmPassword && confirmPassword !== newPassword ? "#ef4444" : undefined }} required />
                        <span onClick={() => setShowConfirm(!showConfirm)} style={{ position: "absolute", [ar ? "left" : "right"]: "15px", cursor: "pointer", color: "var(--muted)", display: "flex", alignItems: "center" }}>
                          {showConfirm ? <EyeOffIcon /> : <EyeIcon />}
                        </span>
                      </div>
                      {confirmPassword && confirmPassword !== newPassword && (
                        <span style={{ fontSize: 12, color: "#ef4444", marginTop: 5, display: "block" }}>{ar ? "كلمتا المرور غير متطابقتين" : "Passwords don't match"}</span>
                      )}
                    </div>
                    <button type="submit" className="btn-submit" disabled={loading}>{loading ? (ar ? "جاري الحفظ..." : "Saving...") : (ar ? "تعيين كلمة المرور" : "Set Password")}</button>
                  </form>
                </>
              )}
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
            <h1 className="auth-title">{ar ? "كلمة مرور قوية" : "Strong Password"}<br /><span>{ar ? "= حماية أفضل." : "= Better Security."}</span></h1>
            <p className="auth-subtitle">{ar ? "استخدم مزيجاً من الأحرف الكبيرة والصغيرة والأرقام والرموز لكلمة مرور أكثر أماناً." : "Use a mix of uppercase, lowercase, numbers and symbols."}</p>
          </div>
        </section>
      </main>
    </div>
  );
}

export default ResetPassword;
