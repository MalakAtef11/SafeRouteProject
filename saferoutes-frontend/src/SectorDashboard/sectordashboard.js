const userType = localStorage.getItem("userType");
const sectorName = localStorage.getItem("sectorName");

if (userType !== "sector" || !sectorName) {
  window.location.href = "../Login-Register/Login.html";
}

const defaultReports = [
  {
    id: 101,
    title: "حفرة في الشارع",
    city: "عمان",
    type: "نص",
    priority: "عالية",
    priorityClass: "priority-high",
    status: "new",
    statusLabel: "جديد",
    statusClass: "status-new",
    assignedTo: "غير مسند",
    note: "لا توجد",
    date: "2026/04/02",
    sector: "البلدية"
  },
  {
    id: 102,
    title: "إشارة مرور معطلة",
    city: "إربد",
    type: "صورة",
    priority: "متوسطة",
    priorityClass: "priority-medium",
    status: "review",
    statusLabel: "قيد المراجعة",
    statusClass: "status-review",
    assignedTo: "فني إشارات",
    note: "بانتظار فحص ميداني",
    date: "2026/03/30",
    sector: "إدارة السير"
  },
  {
    id: 103,
    title: "عامود إنارة مائل",
    city: "الزرقاء",
    type: "صوت",
    priority: "عالية",
    priorityClass: "priority-high",
    status: "processing",
    statusLabel: "قيد المعالجة",
    statusClass: "status-processing",
    assignedTo: "فريق الصيانة 1",
    note: "تم إرسال فريق كشف",
    date: "2026/03/28",
    sector: "الكهرباء"
  },
  {
    id: 104,
    title: "تسرب مياه",
    city: "عمان",
    type: "صورة",
    priority: "منخفضة",
    priorityClass: "priority-low",
    status: "resolved",
    statusLabel: "تم الحل",
    statusClass: "status-resolved",
    assignedTo: "مشرف ميداني",
    note: "أُغلق البلاغ بعد الإصلاح",
    date: "2026/03/20",
    sector: "المياه"
  },
  {
    id: 105,
    title: "بلاغ غير واضح",
    city: "العقبة",
    type: "نص",
    priority: "منخفضة",
    priorityClass: "priority-low",
    status: "rejected",
    statusLabel: "مرفوض",
    statusClass: "status-rejected",
    assignedTo: "غير مسند",
    note: "المشكلة ليست ضمن اختصاصنا",
    date: "2026/03/18",
    sector: "إدارة السير"
  },
  {
    id: 106,
    title: "تسرب من خط مياه",
    city: "الزرقاء",
    type: "صورة",
    priority: "عالية",
    priorityClass: "priority-high",
    status: "new",
    statusLabel: "جديد",
    statusClass: "status-new",
    assignedTo: "غير مسند",
    note: "لا توجد",
    date: "2026/04/04",
    sector: "المياه"
  },
  {
    id: 107,
    title: "إنارة شارع لا تعمل",
    city: "عمان",
    type: "نص",
    priority: "متوسطة",
    priorityClass: "priority-medium",
    status: "processing",
    statusLabel: "قيد المعالجة",
    statusClass: "status-processing",
    assignedTo: "فريق الصيانة 1",
    note: "تم إرسال فريق صيانة",
    date: "2026/04/01",
    sector: "الكهرباء"
  },
  {
    id: 108,
    title: "دوار يحتاج إعادة تنظيم",
    city: "إربد",
    type: "نص",
    priority: "متوسطة",
    priorityClass: "priority-medium",
    status: "review",
    statusLabel: "قيد المراجعة",
    statusClass: "status-review",
    assignedTo: "مشرف ميداني",
    note: "جاري دراسة الوضع المروري",
    date: "2026/04/03",
    sector: "إدارة السير"
  }
];

function getReports() {
  const savedReports = localStorage.getItem("dashboardReports");
  if (savedReports) {
    return JSON.parse(savedReports);
  }

  localStorage.setItem("dashboardReports", JSON.stringify(defaultReports));
  return defaultReports;
}

function saveReports(reports) {
  localStorage.setItem("dashboardReports", JSON.stringify(reports));
}

function getAllReports() {
  const savedReports = localStorage.getItem("dashboardReports");
  return savedReports ? JSON.parse(savedReports) : defaultReports;
}

let reports = getReports();

const menuToggle = document.getElementById("menuToggle");
const navMenu = document.getElementById("navMenu");
const logoutLink = document.getElementById("logoutLink");
const reportsTableBody = document.getElementById("reportsTableBody");

if (menuToggle && navMenu) {
  menuToggle.addEventListener("click", () => {
    navMenu.classList.toggle("show");
    menuToggle.innerHTML = navMenu.classList.contains("show") ? "✕" : "☰";
  });
}

const sectorSubtitle = document.getElementById("sectorSubtitle");
const sectorTitle = document.getElementById("sectorTitle");

if (sectorSubtitle) {
  sectorSubtitle.textContent = `لوحة تحكم ${sectorName}`;
}

if (sectorTitle) {
  sectorTitle.textContent = `إدارة بلاغات ${sectorName}`;
}

if (logoutLink) {
  logoutLink.addEventListener("click", (e) => {
    e.preventDefault();
    localStorage.removeItem("sectorName");
    localStorage.removeItem("userType");
    window.location.href = "../Login-Register/Login.html";
  });
}

function updateStatsCards() {
  reports = getReports().filter((report) => report.sector === sectorName);

  const total = reports.length;
  const newCount = reports.filter((r) => r.status === "new").length;
  const processingCount = reports.filter(
    (r) => r.status === "processing" || r.status === "review"
  ).length;
  const resolvedCount = reports.filter((r) => r.status === "resolved").length;
  const rejectedCount = reports.filter((r) => r.status === "rejected").length;

  document.getElementById("totalReportsCount").textContent = total;
  document.getElementById("newReportsCount").textContent = newCount;
  document.getElementById("processingReportsCount").textContent = processingCount;
  document.getElementById("resolvedReportsCount").textContent = resolvedCount;
  document.getElementById("rejectedReportsCount").textContent = rejectedCount;
  document.getElementById("avgProcessingTime").textContent = total > 0 ? "2.4 يوم" : "0";
}

function renderReports(filter = "all") {
  if (!reportsTableBody) return;

  reports = getReports().filter((report) => report.sector === sectorName);
  reportsTableBody.innerHTML = "";

  const filteredReports =
    filter === "all"
      ? reports
      : reports.filter((report) => report.status === filter);

  if (filteredReports.length === 0) {
    reportsTableBody.innerHTML = `
      <tr>
        <td colspan="10">لا توجد بلاغات مطابقة لهذا الفلتر</td>
      </tr>
    `;
    updateStatsCards();
    return;
  }

  filteredReports.forEach((report) => {
    const row = document.createElement("tr");
    row.setAttribute("data-status", report.status);

    row.innerHTML = `
      <td>#${report.id}</td>
      <td>${report.title}</td>
      <td>${report.city}</td>
      <td>${report.type}</td>
      <td><span class="priority ${report.priorityClass}">${report.priority}</span></td>
      <td><span class="status ${report.statusClass}">${report.statusLabel}</span></td>
      <td><span class="assigned-tag">${report.assignedTo}</span></td>
      <td><span class="note-tag ${report.note === "لا توجد" ? "empty-note" : ""}">${report.note}</span></td>
      <td>${report.date}</td>
      <td>
        <div class="action-buttons">
          ${
            report.status === "new"
              ? `<button class="approve-btn" data-id="${report.id}">موافقة</button>
                 <button class="reject-btn" data-id="${report.id}">رفض</button>`
              : ""
          }
          ${
            report.status === "review"
              ? `<button class="review-btn" data-id="${report.id}">قيد المراجعة</button>`
              : ""
          }
          ${
            report.status === "processing"
              ? `<button class="resolve-btn" data-id="${report.id}">تم الحل</button>`
              : ""
          }
          <button class="details-btn" data-id="${report.id}">التفاصيل</button>
        </div>
      </td>
    `;

    reportsTableBody.appendChild(row);
  });

  bindButtons();
  updateStatsCards();
}

function updateReportStatus(reportId, newStatus, newLabel, newClass) {
  const allReports = getAllReports().map((report) => {
    if (report.id === reportId) {
      return {
        ...report,
        status: newStatus,
        statusLabel: newLabel,
        statusClass: newClass
      };
    }
    return report;
  });

  saveReports(allReports);

  const activeFilterBtn = document.querySelector(".filter-btn.active");
  const activeFilter = activeFilterBtn ? activeFilterBtn.getAttribute("data-filter") : "all";
  renderReports(activeFilter);
}

function bindButtons() {
  document.querySelectorAll(".approve-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const reportId = Number(btn.getAttribute("data-id"));
      updateReportStatus(reportId, "review", "تمت الموافقة", "status-review");
      alert("تمت الموافقة على البلاغ");
    });
  });

  document.querySelectorAll(".reject-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const reportId = Number(btn.getAttribute("data-id"));
      updateReportStatus(reportId, "rejected", "مرفوض", "status-rejected");
      alert("تم رفض البلاغ");
    });
  });

  document.querySelectorAll(".review-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const reportId = Number(btn.getAttribute("data-id"));
      updateReportStatus(reportId, "review", "قيد المراجعة", "status-review");
      alert("تم تحديث البلاغ إلى: قيد المراجعة");
    });
  });

  document.querySelectorAll(".resolve-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const reportId = Number(btn.getAttribute("data-id"));
      updateReportStatus(reportId, "resolved", "تم الحل", "status-resolved");
      alert("تم تحديث البلاغ إلى: تم الحل");
    });
  });

  document.querySelectorAll(".details-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const reportId = Number(btn.getAttribute("data-id"));
      window.location.href = `../MyReports/ReportDetails.html?id=${reportId}&from=dashboard`;
    });
  });
}

const filterButtons = document.querySelectorAll(".filter-btn");

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    filterButtons.forEach((btn) => btn.classList.remove("active"));
    button.classList.add("active");

    const filter = button.getAttribute("data-filter");
    renderReports(filter);
  });
});

const analyticsBtn = document.getElementById("analyticsBtn");

if (analyticsBtn) {
  analyticsBtn.addEventListener("click", () => {
    window.location.href = "../AnalyticsDashboard/AnalyticsDashboard.html";
  });
}

renderReports();