const menuToggle = document.getElementById("menuToggle");
const navMenu = document.getElementById("navMenu");
const reportsList = document.getElementById("reportsList");

if (menuToggle && navMenu) {
  menuToggle.addEventListener("click", () => {
    navMenu.classList.toggle("show");
    menuToggle.innerHTML = navMenu.classList.contains("show") ? "✕" : "☰";
  });
}

const defaultReports = [
  {
    id: 101,
    title: "حفرة في الشارع",
    city: "عمان",
    location: "عمان - الدوار الثالث",
    type: "نص",
    status: "new",
    statusLabel: "جديد",
    statusClass: "status-new",
    date: "2026/04/02",
    sector: "البلدية"
  },
  {
    id: 102,
    title: "إشارة مرور معطلة",
    city: "إربد",
    location: "إربد - شارع الجامعة",
    type: "صورة",
    status: "review",
    statusLabel: "قيد المراجعة",
    statusClass: "status-review",
    date: "2026/03/30",
    sector: "إدارة السير"
  },
  {
    id: 103,
    title: "عامود إنارة مائل",
    city: "الزرقاء",
    location: "الزرقاء الجديدة",
    type: "صوت",
    status: "processing",
    statusLabel: "قيد المعالجة",
    statusClass: "status-processing",
    date: "2026/03/28",
    sector: "الكهرباء"
  },
  {
    id: 104,
    title: "تسرب مياه",
    city: "عمان",
    location: "عمان",
    type: "صورة",
    status: "resolved",
    statusLabel: "تم الحل",
    statusClass: "status-resolved",
    date: "2026/03/20",
    sector: "المياه"
  },
  {
    id: 105,
    title: "بلاغ غير واضح",
    city: "العقبة",
    location: "العقبة",
    type: "نص",
    status: "rejected",
    statusLabel: "مرفوض",
    statusClass: "status-rejected",
    date: "2026/03/18",
    sector: "إدارة السير"
  },
  {
    id: 106,
    title: "تسرب من خط مياه",
    city: "الزرقاء",
    location: "الزرقاء",
    type: "صورة",
    status: "new",
    statusLabel: "جديد",
    statusClass: "status-new",
    date: "2026/04/04",
    sector: "المياه"
  },
  {
    id: 107,
    title: "إنارة شارع لا تعمل",
    city: "عمان",
    location: "عمان",
    type: "نص",
    status: "processing",
    statusLabel: "قيد المعالجة",
    statusClass: "status-processing",
    date: "2026/04/01",
    sector: "الكهرباء"
  },
  {
    id: 108,
    title: "دوار يحتاج إعادة تنظيم",
    city: "إربد",
    location: "إربد",
    type: "نص",
    status: "review",
    statusLabel: "قيد المراجعة",
    statusClass: "status-review",
    date: "2026/04/03",
    sector: "إدارة السير"
  }
];

/* مؤقتًا: هذه بلاغات المستخدم الحالي */
const currentUserReportIds = [101, 103, 104];

function getReports() {
  const savedReports = localStorage.getItem("dashboardReports");

  if (!savedReports) {
    localStorage.setItem("dashboardReports", JSON.stringify(defaultReports));
    return defaultReports;
  }

  const parsedReports = JSON.parse(savedReports);

  const hasInvalidData = parsedReports.some((report) => !report.id);
  if (hasInvalidData) {
    localStorage.setItem("dashboardReports", JSON.stringify(defaultReports));
    return defaultReports;
  }

  return parsedReports;
}

function renderMyReports() {
  if (!reportsList) return;

  const allReports = getReports();
  const myReports = allReports.filter((report) =>
    currentUserReportIds.includes(report.id)
  );

  reportsList.innerHTML = "";

  if (myReports.length === 0) {
    reportsList.innerHTML = `
      <div class="report-card">
        <div class="report-header">
          <h3>لا توجد بلاغات حاليًا</h3>
        </div>
        <div class="report-details">
          <p>لم تقم بإرسال أي بلاغ بعد.</p>
        </div>
      </div>
    `;
    return;
  }

  myReports.forEach((report) => {
    const card = document.createElement("div");
    card.className = "report-card";

    card.innerHTML = `
      <div class="report-header">
        <h3>${report.title}</h3>
        <span class="status ${report.statusClass}">${report.statusLabel}</span>
      </div>

      <div class="report-details">
        <p><strong>النوع:</strong> ${report.type}</p>
        <p><strong>الموقع:</strong> ${report.location}</p>
        <p><strong>التاريخ:</strong> ${report.date}</p>
      </div>

      <button class="details-btn" data-id="${report.id}">عرض التفاصيل</button>
    `;

    reportsList.appendChild(card);
  });

  bindDetailsButtons();
}

function bindDetailsButtons() {
  const detailsButtons = document.querySelectorAll(".details-btn");

  detailsButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const reportId = button.getAttribute("data-id");
      window.location.href = `../MyReports/ReportDetails.html?id=${reportId}&from=myreports`;
    });
  });
}

renderMyReports();