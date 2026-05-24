import "./style.css";

function App() {
  const reports = [
    {
      type: "حفرة",
      location: "قرب الدوار الثالث - عمان",
      status: "قيد المعالجة",
    },
    {
      type: "إشارة تالفة",
      location: "شارع الجامعة - إربد",
      status: "تم الاستلام",
    },
    {
      type: "إنارة ضعيفة",
      location: "الزرقاء الجديدة",
      status: "تم الحل",
    },
  ];

  return (
    <div dir="rtl">
      <header className="header">
        <div className="logo">
          <h1>SafeRoute</h1>
          <p>طريقك الآمن</p>
        </div>

        <nav className="nav">
          <a href="#">الرئيسية</a>
          <a href="#">البلاغات</a>
          <a href="#">أبلغ الآن</a>
          <a href="#">بلاغاتي</a>
          <a href="#">تسجيل الدخول</a>
        </nav>
      </header>

      <main>
        <section className="hero">
          <div className="hero-text">
            <h2>بلّغ بسرعة، ودع النظام يتابع بذكاء</h2>
            <p>
              منصة ذكية تساعد المستخدمين على الإبلاغ عن المخاطر والعوائق في الطرق
              باستخدام النص أو الصورة أو الصوت، مع تحديد الموقع تلقائيًا.
            </p>
            <div className="hero-buttons">
              <button>أبلغ الآن</button>
              <button className="secondary-btn">تسجيل الدخول</button>
            </div>
          </div>

          <div className="hero-card">
            <h3>البلاغات القريبة</h3>
            <div className="reports-list">
              {reports.map((report, index) => (
                <div className="report-item" key={index}>
                  <h4>{report.type}</h4>
                  <p>الموقع: {report.location}</p>
                  <p>الحالة: {report.status}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div>
          <h3>SafeRoute</h3>
          <p>نظام ذكي لتحسين السلامة العامة والبنية التحتية.</p>
        </div>
        <div>
          <p>© 2026 جميع الحقوق محفوظة</p>
        </div>
      </footer>
    </div>
  );
}

export default App;